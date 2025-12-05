import { useState, useCallback, useEffect } from "react";

// Helper function to render the different item types
const renderItem = (item) => {
  switch (item.type) {
    case "input":
      return (
        <input
          // Uses the item's unique 'label' as the placeholder
          placeholder={item.label || "Input Field"}
          // Slightly increased padding and font size for visibility (px-3 py-1.5)
          className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 transition-all bg-white"
          disabled
        />
      );
    case "text":
      // Uses the item's unique 'label'
      return <p className="text-gray-700 px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-md bg-white">{item.label}</p>;
    case "image":
      // Uses the item's unique 'label'
      return (
        // Increased height from h-10 to h-14
        <div className="w-full h-14 bg-blue-50 flex items-center justify-center rounded-md text-xs text-blue-500 font-semibold border border-dashed border-blue-300">
          {item.label || "Image Placeholder"}
        </div>
      );
    default:
      return item.id || item;
  }
};

// Helper function to generate a unique key for a new row
const getNewRowKey = (data) => {
    let count = Object.keys(data).length + 1;
    let newKey = `row${count}`;
    while (data.hasOwnProperty(newKey)) {
        count++;
        newKey = `row${count}`;
    }
    return newKey;
};

const MIN_COLUMN_HEIGHT = 100;

const CustomNestedDnD = () => {
  // Initial state setup
  const [data, setData] = useState({
    row1: {
      column1: [
        { id: "comp1", type: "input", label: "Input Field 1" },
        { id: "comp2", type: "image", label: "Image 1" },
      ],
      column2: [
        { id: "comp3", type: "input", label: "Input Field 2" },
        { id: "comp4", type: "text", label: "Text Block 1" },
      ],
    },
    row2: {
      column1: [
        { id: "comp5", type: "input", label: "Input Field 3" },
        { id: "comp6", type: "image", label: "Image 2" },
      ],
    },
  });
  
  // State to store custom heights for columns
  const [columnHeights, setColumnHeights] = useState({
      row1: { column1: 150, column2: 150 },
      row2: { column1: 150 },
  });

  // State to track resizing globally
  const [isResizing, setIsResizing] = useState(false);
  const [resizeTarget, setResizeTarget] = useState({ rowKey: null, colKey: null, startY: 0, startHeight: 0 });

  const [sidebar] = useState({
    rows: ["newRow"],
    columns: ["newColumn"],
    items: [
      { type: "input", label: "Input Field" },
      { type: "text", label: "Text Block" },
      { type: "image", label: "Image Placeholder" },
    ],
  });

  const [dragInfo, setDragInfo] = useState({
    type: null, // 'row', 'column', 'item', 'newRow', 'newColumn', 'newItem'
    row: null,
    column: null,
    item: null,
  });

  const [counters, setCounters] = useState({
    rows: 2, 
    columns: 2, 
    items: 6, // Tracks unique index for new items
  });

  // Indicator States
  const [itemDropIndicator, setItemDropIndicator] = useState({ show: false, position: "before", itemId: null });
  const [columnDropIndicator, setColumnDropIndicator] = useState({ show: false, position: "before", columnKey: null, rowKey: null });
  const [rowDropIndicator, setRowDropIndicator] = useState({ show: false, position: "before", rowKey: null });

  // 💡 OPTIMIZATION: Single reset function for all drag/indicator state
  const resetDragState = useCallback(() => {
    setDragInfo({ type: null, row: null, column: null, item: null });
    setItemDropIndicator({ show: false, position: "before", itemId: null });
    setColumnDropIndicator({ show: false, position: "before", columnKey: null, rowKey: null });
    setRowDropIndicator({ show: false, position: "before", rowKey: null });
  }, []);

  // --- Resize Logic ---
  const startResizing = useCallback((e, rowKey, colKey) => {
      e.stopPropagation();
      setIsResizing(true);
      
      const columnElement = e.currentTarget.parentNode;
      setResizeTarget({
          rowKey,
          colKey,
          startY: e.clientY,
          startHeight: columnElement.offsetHeight,
      });
  }, []);

  const doResizing = useCallback((e) => {
      if (!isResizing || !resizeTarget.rowKey) return;
      
      const deltaY = e.clientY - resizeTarget.startY;
      let newHeight = resizeTarget.startHeight + deltaY;
      
      // Enforce minimum height
      newHeight = Math.max(newHeight, MIN_COLUMN_HEIGHT);
      
      setColumnHeights(prevHeights => ({
          ...prevHeights,
          [resizeTarget.rowKey]: {
              ...prevHeights[resizeTarget.rowKey],
              [resizeTarget.colKey]: newHeight,
          }
      }));
  }, [isResizing, resizeTarget]);

  const stopResizing = useCallback(() => {
      if (isResizing) {
          setIsResizing(false);
          setResizeTarget({ rowKey: null, colKey: null, startY: 0, startHeight: 0 });
      }
  }, [isResizing]);

  // Attach global mouse listeners for resizing
  useEffect(() => {
      if (isResizing) {
          document.addEventListener('mousemove', doResizing);
          document.addEventListener('mouseup', stopResizing);
      } else {
          document.removeEventListener('mousemove', doResizing);
          document.removeEventListener('mouseup', stopResizing);
      }
      return () => {
          document.removeEventListener('mousemove', doResizing);
          document.removeEventListener('mouseup', stopResizing);
      };
  }, [isResizing, doResizing, stopResizing]);
  
  // --- Drag Operations ---
  const onDragStart = (e, type, row = null, column = null, item = null) => {
    e.stopPropagation();
    setDragInfo({ type, row, column, item });
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // --- Drag Enter for Indicators (Sets Indicator State) ---
  const onDragEnterItem = (e, item) => {
    // Only show indicator if a component is being dragged AND it is not the item currently being dragged
    if ((dragInfo.type !== "item" && dragInfo.type !== "newItem") || dragInfo.item?.id === item.id) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const position = y < rect.height / 2 ? "before" : "after";
    setItemDropIndicator({ show: true, position, itemId: item.id });
  };
  
  const onDragEnterColumn = (e, rowKey, colKey) => {
    if (dragInfo.type !== "column" && dragInfo.type !== "newColumn") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const position = x < rect.width / 2 ? "before" : "after";
    setColumnDropIndicator({ show: true, position, columnKey: colKey, rowKey: rowKey });
  };

  const onDragLeaveColumn = () => {
    setColumnDropIndicator({ show: false, position: "before", columnKey: null, rowKey: null });
  };

  const onDragEnterRow = (e, rowKey) => {
    if ((dragInfo.type !== "row" && dragInfo.type !== "newRow") || dragInfo.row === rowKey) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const position = y < rect.height / 2 ? "before" : "after";
    setRowDropIndicator({ show: true, position, rowKey: rowKey });
  };

  const onDragLeaveRow = () => {
    setRowDropIndicator({ show: false, position: "before", rowKey: null });
  };

  // --- Drop Handlers ---
  
  // Handles drops into the main canvas area, outside any specific row (effectively drops at the end)
  const onDropRow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only handle newRow drop if it hits the main container (dropped at the end)
    if (dragInfo.type === "newRow") {
        const newData = JSON.parse(JSON.stringify(data));
        const newRowKey = getNewRowKey(data);
        newData[newRowKey] = { column1: [] };
        setData(newData);
        
        // Initialize height for the new column
        setColumnHeights(prevHeights => ({
            ...prevHeights,
            [newRowKey]: { column1: MIN_COLUMN_HEIGHT }
        }));
    }
    
    resetDragState();
  };

  // 💡 OPTIMIZED: Handles reordering existing rows AND inserting new rows.
  const onDropOnRow = (e, targetRowKey) => {
    e.preventDefault();
    e.stopPropagation();

    const newData = JSON.parse(JSON.stringify(data));
    const entries = Object.entries(newData);
    const targetIndex = entries.findIndex(([key]) => key === targetRowKey);
    
    // Determine insertion point based on indicator position
    let insertIndex = targetIndex;
    if (rowDropIndicator.show && rowDropIndicator.position === "after") {
        insertIndex = targetIndex + 1;
    }

    // 1. Reordering existing rows
    if (dragInfo.type === "row" && dragInfo.row) {
        const sourceIndex = entries.findIndex(([key]) => key === dragInfo.row);
        
        if (sourceIndex > -1 && targetIndex > -1) {
            
            // Adjust index for comparison because the array hasn't been spliced yet
            const adjustedInsertIndex = insertIndex > sourceIndex ? insertIndex - 1 : insertIndex;
            const isDroppingOnSelf = adjustedInsertIndex === sourceIndex;
            
            if (!isDroppingOnSelf) {
              const [sourceRow] = entries.splice(sourceIndex, 1);
              // Also move the corresponding height entry
              const heightsEntries = Object.entries(columnHeights);
              const sourceHeightIndex = heightsEntries.findIndex(([key]) => key === dragInfo.row);
              if (sourceHeightIndex > -1) {
                  const [sourceHeight] = heightsEntries.splice(sourceHeightIndex, 1);
                  heightsEntries.splice(adjustedInsertIndex, 0, sourceHeight);
                  setColumnHeights(Object.fromEntries(heightsEntries));
              }
              
              entries.splice(adjustedInsertIndex, 0, sourceRow);
              setData(Object.fromEntries(entries));
            }
        }
    } 
    // 2. Inserting a NEW row
    else if (dragInfo.type === "newRow") {
        const newRowKey = getNewRowKey(data);
        const newRowEntry = [newRowKey, { column1: [] }];
        
        // Insert the new row at the calculated index matching the visual indicator
        entries.splice(insertIndex, 0, newRowEntry); 
        setData(Object.fromEntries(entries));
        
        // Insert new height entry
        const heightsEntries = Object.entries(columnHeights);
        heightsEntries.splice(insertIndex, 0, [newRowKey, { column1: MIN_COLUMN_HEIGHT }]);
        setColumnHeights(Object.fromEntries(heightsEntries));
    }
    
    resetDragState();
  };


  // 💡 OPTIMIZED: Handles dropping items/columns, including generating unique labels for new items.
  const onDropColumn = (e, targetRowKey, targetColumnKey) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragInfo.type) return;

    const newData = JSON.parse(JSON.stringify(data));

    // 1. New Column from Sidebar
    if (dragInfo.type === "newColumn") {
      const colName = `column${Object.keys(newData[targetRowKey]).length + 1}`;
      if (newData[targetRowKey] && !newData[targetRowKey][colName]) {
        newData[targetRowKey][colName] = [];
        
        // Initialize height for the new column
        setColumnHeights(prevHeights => ({
            ...prevHeights,
            [targetRowKey]: {
                ...prevHeights[targetRowKey],
                [colName]: MIN_COLUMN_HEIGHT,
            }
        }));
      }
      setCounters((prev) => ({ ...prev, columns: prev.columns + 1 }));
    }

    // 2. New Item from Sidebar (with unique name generation)
    else if (dragInfo.type === "newItem") {
      if (newData[targetRowKey] && newData[targetRowKey][targetColumnKey]) {
        
        const newCounter = counters.items + 1;
        let baseLabel = dragInfo.item.label;
        if (baseLabel.includes("Field")) baseLabel = "Input Field";
        
        const newItem = {
          id: `${dragInfo.item.type}_${newCounter}`,
          type: dragInfo.item.type,
          label: `${baseLabel} ${newCounter}`, // Set unique label
        };
        
        const targetItems = newData[targetRowKey][targetColumnKey];
        
        if (itemDropIndicator.show && itemDropIndicator.itemId) {
            const targetIndex = targetItems.findIndex(i => i.id === itemDropIndicator.itemId);
            const insertIndex = itemDropIndicator.position === "before" ? targetIndex : targetIndex + 1;
            targetItems.splice(insertIndex, 0, newItem);
        } else {
            targetItems.push(newItem);
        }
        
        setCounters((prev) => ({ ...prev, items: newCounter }));
      }
    }

    // 3. Reorder / Move Existing Item
    else if (dragInfo.type === "item" && dragInfo.row && dragInfo.column && dragInfo.item) {
      const sourceItems = newData[dragInfo.row][dragInfo.column];
      const itemIndex = sourceItems.findIndex((i) => i.id === dragInfo.item.id);

      if (itemIndex > -1) {
        // Remove item from source
        const [movedItem] = sourceItems.splice(itemIndex, 1);
        const targetItems = newData[targetRowKey][targetColumnKey];

        // Insert item into target based on indicator position
        if (itemDropIndicator.show && itemDropIndicator.itemId) {
          const targetIndex = targetItems.findIndex((i) => i.id === itemDropIndicator.itemId);
          const insertIndex = itemDropIndicator.position === "before" ? targetIndex : targetIndex + 1;
          targetItems.splice(insertIndex, 0, movedItem);
        } else {
          // If no specific item indicator is active, append to the end
          targetItems.push(movedItem);
        }
      }
    }

    // 4. Move/Reorder Column
    else if (dragInfo.type === "column" && dragInfo.row && dragInfo.column) {
      const columns = newData[dragInfo.row];
      const entries = Object.entries(columns);
      const sourceColumnKey = dragInfo.column;
      const targetColumnKeyToMoveBefore = columnDropIndicator.columnKey;

      if (dragInfo.row === targetRowKey) {
        // Reordering within the same row
        if (columnDropIndicator.show && columnDropIndicator.columnKey) {
          const sourceIndex = entries.findIndex(([key]) => key === sourceColumnKey);
          const targetIndex = entries.findIndex(([key]) => key === targetColumnKeyToMoveBefore);

          let insertIndex = targetIndex;
          if (columnDropIndicator.position === "after") {
              insertIndex = targetIndex + 1;
          }
          
          if (sourceIndex > -1 && targetIndex > -1) {
              const adjustedInsertIndex = insertIndex > sourceIndex ? insertIndex - 1 : insertIndex;
              const isDroppingOnSelf = adjustedInsertIndex === sourceIndex;
              
              if (!isDroppingOnSelf) {
                  const [sourceColumn] = entries.splice(sourceIndex, 1);
                  entries.splice(adjustedInsertIndex, 0, sourceColumn); 
                  newData[targetRowKey] = Object.fromEntries(entries);
              }
          }
        }
      } else {
        // Moving to a different row (Not yet fully supported in this simple logic, but handles deletion from source)
        const columnToMove = newData[dragInfo.row][dragInfo.column];
        delete newData[dragInfo.row][dragInfo.column];
        newData[targetRowKey][dragInfo.column] = columnToMove;
        
        // Also move column height
        setColumnHeights(prevHeights => {
            const newHeights = JSON.parse(JSON.stringify(prevHeights));
            const heightToMove = newHeights[dragInfo.row][dragInfo.column];
            delete newHeights[dragInfo.row][dragInfo.column];
            newHeights[targetRowKey] = {
                ...newHeights[targetRowKey],
                [dragInfo.column]: heightToMove
            };
            return newHeights;
        });
      }
    }

    setData(newData);
    resetDragState();
  };

  // --- Trash Handler ---
  const onDropToTrash = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragInfo.type) return;

    const newData = JSON.parse(JSON.stringify(data));

    if (dragInfo.type === "row" && dragInfo.row) {
        delete newData[dragInfo.row];
        setColumnHeights(prev => {
            const newHeights = { ...prev };
            delete newHeights[dragInfo.row];
            return newHeights;
        });
    }
    if (dragInfo.type === "column" && dragInfo.row && dragInfo.column) {
      delete newData[dragInfo.row][dragInfo.column];
      setColumnHeights(prev => {
        const newHeights = JSON.parse(JSON.stringify(prev));
        delete newHeights[dragInfo.row][dragInfo.column];
        return newHeights;
      });
    }
    if (dragInfo.type === "item" && dragInfo.row && dragInfo.column && dragInfo.item) {
      newData[dragInfo.row][dragInfo.column] = newData[dragInfo.row][
        dragInfo.column
      ].filter((i) => i.id !== dragInfo.item.id);
    }

    setData(newData);
    resetDragState();
  };


  return (
    <div className="flex gap-4 p-4 min-h-screen bg-gray-50 font-sans w-full">
      {/* Sidebar - Slight increase in padding and margin */}
      <div className="w-[220px] border border-gray-300 p-3 bg-white shadow-xl rounded-lg h-fit sticky top-4">
        <h3 className="font-extrabold text-base mb-4 text-blue-700 border-b border-blue-200 pb-2">Components</h3>
        
        {/* Row Components */}
        <h4 className="font-bold mb-2 mt-4 text-gray-600 uppercase tracking-wider text-xs">Layout</h4>
        {sidebar.rows.map((r) => (
          <div
            key={r}
            draggable
            onDragStart={(e) => onDragStart(e, "newRow", r)}
            // Increased padding p-3 and mb-2
            className="p-3 mb-2 border border-blue-500 bg-blue-100 cursor-grab rounded-lg shadow-md
                       hover:bg-blue-200 transition-all text-sm font-semibold text-blue-800 flex items-center gap-2"
          >
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            New Row
          </div>
        ))}

        {/* Column Components */}
        <h4 className="font-bold mb-2 mt-4 text-gray-600 uppercase tracking-wider text-xs">Structure</h4>
        {sidebar.columns.map((c) => (
          <div
            key={c}
            draggable
            onDragStart={(e) => onDragStart(e, "newColumn", null, c)}
            // Increased padding p-3 and mb-2
            className="p-3 mb-2 border border-green-500 bg-green-100 cursor-grab rounded-lg shadow-md
                       hover:bg-green-200 transition-all text-sm font-semibold text-green-800 flex items-center gap-2"
          >
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            New Column
          </div>
        ))}

        {/* Content Components */}
        <h4 className="font-bold mb-2 mt-4 text-gray-600 uppercase tracking-wider text-xs">Elements</h4>
        {sidebar.items.map((i, index) => (
          <div
            key={index}
            draggable
            onDragStart={(e) => onDragStart(e, "newItem", null, null, i)}
            // Increased padding p-3 and mb-2
            className="p-3 mb-2 border border-purple-500 bg-purple-100 cursor-grab rounded-lg shadow-md hover:bg-purple-200 transition-all"
          >
            {renderItem(i)}
          </div>
        ))}
      </div>

      {/* Main Drag & Drop Canvas */}
      <div className="flex-1 min-h-[calc(100vh-32px)]" onDragOver={onDragOver} onDrop={onDropRow}>
        <div className="p-5 bg-white rounded-lg shadow-xl border border-gray-200 min-h-full">
          <h2 className="text-xl font-bold mb-5 text-gray-800 border-b pb-2">Layout Builder Canvas</h2>

          {Object.entries(data).map(([rowKey, columns]) => (
            <div key={rowKey}>
              {/* Row Drop Indicator (Before) - Increased height h-3 */}
              {rowDropIndicator.show &&
                rowDropIndicator.position === "before" &&
                rowDropIndicator.rowKey === rowKey && (
                  <div className="h-3 my-2 bg-yellow-500 rounded-md animate-pulse"></div>
                )}

              <div
                onDragOver={onDragOver}
                onDragEnter={(e) => onDragEnterRow(e, rowKey)}
                onDragLeave={onDragLeaveRow}
                onDrop={(e) => onDropOnRow(e, rowKey)}
                // Increased row padding p-4 and mb-4
                className={`border border-gray-300 p-4 mb-4 bg-gray-50 rounded-xl transition-all shadow-md
                  ${dragInfo.type === 'row' && dragInfo.row === rowKey ? 'ring-2 ring-blue-300 shadow-lg' : 'hover:border-blue-400'}`}
              >
                <div className="flex justify-between items-center mb-3 border-b border-gray-300 pb-2">
                  <h3 className="font-semibold text-base text-gray-700">{rowKey}</h3>
                  
                  {/* Explicit Row Drag Handle - Increased size/padding p-2 */}
                  <button
                    draggable
                    onDragStart={(e) => onDragStart(e, "row", rowKey)}
                    className="p-2 cursor-grab bg-blue-200 rounded-md hover:bg-blue-300 transition text-blue-700"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                  </button>
                </div>
                
                {/* Columns Container */}
                <div className="flex gap-3 items-stretch"> {/* added items-stretch for column resizing to work visually */}
                  {Object.entries(columns).map(([colKey, items]) => (
                    <div key={colKey} className="flex-1 flex">
                      {/* Column Drop Indicator (Before) - Increased width w-3 */}
                      {columnDropIndicator.show &&
                        columnDropIndicator.position === "before" &&
                        columnDropIndicator.columnKey === colKey &&
                        columnDropIndicator.rowKey === rowKey && (
                          <div className="w-3 mx-1 bg-green-500 rounded-md animate-pulse"></div>
                        )}

                      <div
                        onDragOver={onDragOver}
                        onDragEnter={(e) => onDragEnterColumn(e, rowKey, colKey)}
                        onDragLeave={onDragLeaveColumn}
                        onDrop={(e) => onDropColumn(e, rowKey, colKey)}
                        // Column styles
                        className={`flex-1 border-2 border-dashed p-3 bg-white rounded-lg transition relative flex flex-col
                          ${(dragInfo.type === 'column' || dragInfo.type === 'newColumn') && columnDropIndicator.columnKey === colKey
                            ? 'border-green-600 ring-2 ring-green-300 shadow-inner' 
                            : 'border-gray-300 hover:border-green-500'}`}
                        style={{ height: columnHeights[rowKey]?.[colKey] || MIN_COLUMN_HEIGHT }}
                      >
                        <div className="flex justify-between items-center mb-3 pb-1 border-b border-gray-200 flex-shrink-0">
                            <h4 className="font-medium text-sm text-gray-600">{colKey}</h4>
                            
                            {/* Explicit Column Drag Handle - Increased size/padding p-1 */}
                            <button
                                draggable
                                onDragStart={(e) => onDragStart(e, "column", rowKey, colKey)}
                                className="p-1 cursor-grab hover:bg-gray-100 rounded-md transition text-gray-500 hover:text-green-600"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16"></path></svg>
                            </button>
                        </div>
                        
                        {/* Items Container - Allows scrolling if content exceeds height */}
                        <div className="space-y-3 overflow-y-auto flex-grow pr-1"> 
                          {items.map((item) => (
                            <div key={item.id || item}>
                              {/* Item Drop Indicator (Before) - Increased height h-1.5 */}
                              {itemDropIndicator.show &&
                                itemDropIndicator.position === "before" &&
                                itemDropIndicator.itemId === item.id && (
                                  <div className="h-1.5 bg-purple-500 mb-1 rounded-sm animate-pulse"></div>
                                )}
                              <div
                                onDragEnter={(e) => onDragEnterItem(e, item)}
                                onDragOver={onDragOver}
                                // Increased item padding p-2 and slightly wider gap
                                className={`p-2 border border-gray-400 bg-white rounded-md transition-all shadow-sm flex items-start gap-2
                                    hover:shadow-md duration-100 ease-out
                                    ${(dragInfo.type === 'item' || dragInfo.type === 'newItem') && itemDropIndicator.itemId === item.id
                                        ? 'ring-2 ring-purple-500' 
                                        : ''}`}
                              >
                                {/* Explicit Item Drag Handle - Increased size/padding p-1 w-4 h-4 */}
                                <button
                                    draggable
                                    onDragStart={(e) => onDragStart(e, "item", rowKey, colKey, item)}
                                    className="p-1 mt-0.5 cursor-grab text-gray-500 hover:text-purple-600 transition rounded-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7h16M4 12h16m-7 5h7"></path></svg>
                                </button>
                                <div className="flex-1">
                                    {renderItem(item)}
                                </div>
                              </div>
                              {/* Item Drop Indicator (After) - Increased height h-1.5 */}
                              {itemDropIndicator.show &&
                                itemDropIndicator.position === "after" &&
                                itemDropIndicator.itemId === item.id && (
                                  <div className="h-1.5 bg-purple-500 mt-1 rounded-sm animate-pulse"></div>
                                )}
                            </div>
                          ))}
                        </div>
                        
                        {/* Vertical Resize Handle */}
                        <div
                            onMouseDown={(e) => startResizing(e, rowKey, colKey)}
                            // Small, clear handle at the bottom
                            className="absolute bottom-0 left-0 right-0 h-2 bg-gray-400 hover:bg-blue-600 cursor-ns-resize rounded-b-lg transition duration-150 flex items-center justify-center group-hover:h-3"
                        >
                            <div className="w-8 h-0.5 bg-white rounded-full"></div>
                        </div>
                      </div>
                      
                      {/* Column Drop Indicator (After) - Increased width w-3 */}
                      {columnDropIndicator.show &&
                        columnDropIndicator.position === "after" &&
                        columnDropIndicator.columnKey === colKey &&
                        columnDropIndicator.rowKey === rowKey && (
                          <div className="w-3 mx-1 bg-green-500 rounded-md animate-pulse"></div>
                        )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Row Drop Indicator (After) - Increased height h-3 */}
              {rowDropIndicator.show &&
                rowDropIndicator.position === "after" &&
                rowDropIndicator.rowKey === rowKey && (
                  <div className="h-3 my-2 bg-yellow-500 rounded-md animate-pulse"></div>
                )}
            </div>
          ))}

          {/* New Container for JSON and Trash - Side by Side (flex) */}
          {/* Increased gap and padding in this section */}
          <div className="flex gap-5 mt-5 pt-5 border-t border-gray-200">
            
            {/* 1. Live Data Display (JSON) - LEFT SIDE (2/3 width) */}
            <div className="w-2/3 p-4 bg-blue-50 rounded-lg shadow-inner border border-blue-300">
              <h3 className="text-sm font-bold mb-3 text-blue-700 border-b border-blue-200 pb-1.5">Live Data State (JSON)</h3>
              <pre className="text-xs text-gray-800 overflow-x-auto p-3 bg-white rounded-md border border-gray-200 shadow-sm max-h-56">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
            
            {/* 2. Trash Area - RIGHT SIDE (1/3 width) */}
            <div
              className="w-1/3 flex items-center justify-center p-4 border-2 border-red-500 border-dashed bg-red-100 rounded-lg text-center cursor-pointer hover:bg-red-200 transition shadow-md hover:shadow-lg"
              onDragOver={onDragOver}
              onDrop={onDropToTrash}
            >
              <div className="p-1">
                <span className="font-bold text-red-800 text-base flex items-center justify-center gap-2">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  Drag to Delete
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomNestedDnD;