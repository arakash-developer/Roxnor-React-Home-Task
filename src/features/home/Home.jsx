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

// Helper function to generate a unique key for a new row (or column if adapted)
const getNewUniqueKey = (dataObj, prefix = 'entity') => {
    let count = 1;
    let newKey = `${prefix}${count}`;
    while (dataObj.hasOwnProperty(newKey)) {
        count++;
        newKey = `${prefix}${count}`;
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
  const [resizeRef, setResizeRef] = useState(null); 

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

  // Unique index for new content items (Input Field 7, Text Block 8, etc.)
  const [itemCounter, setItemCounter] = useState(6);

  // Indicator States
  const [itemDropIndicator, setItemDropIndicator] = useState({ show: false, position: "before", itemId: null });
  const [columnDropIndicator, setColumnDropIndicator] = useState({ show: false, position: "before", columnKey: null, rowKey: null });
  const [rowDropIndicator, setRowDropIndicator] = useState({ show: false, position: "before", rowKey: null });

  // Reset function for all drag/indicator state
  const resetDragState = useCallback(() => {
    setDragInfo({ type: null, row: null, column: null, item: null });
    setItemDropIndicator({ show: false, position: "before", itemId: null });
    setColumnDropIndicator({ show: false, position: "before", columnKey: null, rowKey: null });
    setRowDropIndicator({ show: false, position: "before", rowKey: null });
  }, []);

  // --- Resize Logic (Unchanged) ---
  const startResizing = useCallback((e, rowKey, colKey) => {
      e.stopPropagation();
      const columnElement = e.currentTarget.parentNode;
      setResizeRef(columnElement); 
      
      setIsResizing(true);
      setResizeTarget({
          rowKey,
          colKey,
          startY: e.clientY,
          startHeight: columnElement.offsetHeight,
      });
  }, []);

  const doResizing = useCallback((e) => {
      if (!isResizing || !resizeTarget.rowKey || !resizeRef) return;
      
      const deltaY = e.clientY - resizeTarget.startY;
      let newHeight = resizeTarget.startHeight + deltaY;
      
      newHeight = Math.max(newHeight, MIN_COLUMN_HEIGHT);
      
      // Update height directly on the DOM element for smooth resizing
      resizeRef.style.height = `${newHeight}px`;

  }, [isResizing, resizeTarget, resizeRef]);

  const stopResizing = useCallback(() => {
      if (isResizing && resizeRef) {
          
          const finalHeight = resizeRef.offsetHeight;
          
          // Update React state ONCE with the final height
          setColumnHeights(prevHeights => ({
              ...prevHeights,
              [resizeTarget.rowKey]: {
                  ...prevHeights[resizeTarget.rowKey],
                  [resizeTarget.colKey]: finalHeight,
              }
          }));

          // Cleanup
          setIsResizing(false);
          setResizeTarget({ rowKey: null, colKey: null, startY: 0, startHeight: 0 });
          setResizeRef(null);
      }
  }, [isResizing, resizeRef, resizeTarget.rowKey, resizeTarget.colKey]);

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
  
  // --- Drag Operations (Unchanged) ---
  const onDragStart = (e, type, row = null, column = null, item = null) => {
    e.stopPropagation();
    setDragInfo({ type, row, column, item });
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };
  
  // --- NEW Indicator Logic using onDragOver for stability ---
  
  // Handles continuous drag over for items
  const onDragOverItem = useCallback((e, item, rowKey, colKey) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only update indicator if we are dragging an item or a new item
    if ((dragInfo.type !== "item" && dragInfo.type !== "newItem") || dragInfo.item?.id === item.id) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const position = y < rect.height / 2 ? "before" : "after";

    // Only set state if it actually changes to prevent unnecessary re-renders (flicker)
    setItemDropIndicator(prev => {
        if (prev.show && prev.itemId === item.id && prev.position === position) {
            return prev;
        }
        return { show: true, position, itemId: item.id };
    });
  }, [dragInfo]);

  // Handles continuous drag over for columns
  const onDragOverColumn = useCallback((e, rowKey, colKey) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only update indicator if we are dragging a column or a new column
    if (dragInfo.type !== "column" && dragInfo.type !== "newColumn") return;
    
    // Skip if we are dragging the column over itself and it's an existing column
    if (dragInfo.type === "column" && dragInfo.column === colKey && dragInfo.row === rowKey) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const position = x < rect.width / 2 ? "before" : "after";
    
    // Only set state if it actually changes to prevent unnecessary re-renders (flicker)
    setColumnDropIndicator(prev => {
        if (prev.show && prev.columnKey === colKey && prev.rowKey === rowKey && prev.position === position) {
            return prev;
        }
        return { show: true, position, columnKey: colKey, rowKey: rowKey };
    });
  }, [dragInfo]);


  // --- Drag Enter/Leave for Rows (Kept as vertical space is large) ---
  
  const onDragEnterRow = (e, rowKey) => {
    // We only care about rows or new rows being dragged
    if ((dragInfo.type !== "row" && dragInfo.type !== "newRow") || dragInfo.row === rowKey) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const position = y < rect.height / 2 ? "before" : "after";
    setRowDropIndicator({ show: true, position, rowKey: rowKey });
  };

  const onDragLeaveRow = () => {
    // Only clear if the cursor is truly leaving the row area
    // For simplicity with row DND, we clear the indicator entirely when leaving the boundary
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
        const newRowKey = getNewUniqueKey(data, 'row');
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

  // Handles reordering existing rows AND inserting new rows. (Unchanged)
  const onDropOnRow = (e, targetRowKey) => {
    e.preventDefault();
    e.stopPropagation();

    const newData = JSON.parse(JSON.stringify(data));
    const entries = Object.entries(newData);
    const targetIndex = entries.findIndex(([key]) => key === targetRowKey);
    
    let insertIndex = targetIndex;
    if (rowDropIndicator.show && rowDropIndicator.position === "after") {
        insertIndex = targetIndex + 1;
    }

    // 1. Reordering existing rows
    if (dragInfo.type === "row" && dragInfo.row) {
        const sourceIndex = entries.findIndex(([key]) => key === dragInfo.row);
        
        if (sourceIndex > -1 && targetIndex > -1) {
            
            const adjustedInsertIndex = insertIndex > sourceIndex ? insertIndex - 1 : insertIndex;
            const isDroppingOnSelf = adjustedInsertIndex === sourceIndex;
            
            if (!isDroppingOnSelf) {
              const [sourceRow] = entries.splice(sourceIndex, 1);
              
              // Move the corresponding height entry using the same adjusted index
              setColumnHeights(prevHeights => {
                  const heightsEntries = Object.entries(prevHeights);
                  const sourceHeightIndex = heightsEntries.findIndex(([key]) => key === dragInfo.row);
                  if (sourceHeightIndex > -1) {
                      const [sourceHeight] = heightsEntries.splice(sourceHeightIndex, 1);
                      heightsEntries.splice(adjustedInsertIndex, 0, sourceHeight);
                      return Object.fromEntries(heightsEntries);
                  }
                  return prevHeights;
              });
              
              entries.splice(adjustedInsertIndex, 0, sourceRow);
              setData(Object.fromEntries(entries));
            }
        }
    } 
    // 2. Inserting a NEW row
    else if (dragInfo.type === "newRow") {
        const newRowKey = getNewUniqueKey(data, 'row');
        const newRowEntry = [newRowKey, { column1: [] }];
        
        entries.splice(insertIndex, 0, newRowEntry); 
        setData(Object.fromEntries(entries));
        
        // Insert new height entry
        setColumnHeights(prevHeights => {
            const heightsEntries = Object.entries(prevHeights);
            heightsEntries.splice(insertIndex, 0, [newRowKey, { column1: MIN_COLUMN_HEIGHT }]);
            return Object.fromEntries(heightsEntries);
        });
    }
    
    resetDragState();
  };


  const onDropColumn = (e, targetRowKey, targetColumnKey) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragInfo.type) return;

    const newData = JSON.parse(JSON.stringify(data));
    const isIndicatorActive = columnDropIndicator.show && columnDropIndicator.rowKey === targetRowKey && columnDropIndicator.columnKey === targetColumnKey;

    // --- 1. New Column from Sidebar ---
    if (dragInfo.type === "newColumn") {
      
      const colName = getNewUniqueKey(newData[targetRowKey] || {}, 'column');
      const newColumnEntry = [colName, []];
      
      const targetColumns = newData[targetRowKey] || {};
      let entries = Object.entries(targetColumns);
      let insertIndex = entries.length; // Default to appending
      
      // Determine insert index based on the active indicator
      if (isIndicatorActive && targetColumnKey) {
        const targetIndex = entries.findIndex(([key]) => key === targetColumnKey);
        
        if (targetIndex !== -1) {
            insertIndex = columnDropIndicator.position === "before" ? targetIndex : targetIndex + 1;
        }
      }
      
      // Insert the new column data
      entries.splice(insertIndex, 0, newColumnEntry); 
      newData[targetRowKey] = Object.fromEntries(entries);
        
      // Initialize height for the new column, preserving order
      setColumnHeights(prevHeights => {
          const newHeights = JSON.parse(JSON.stringify(prevHeights)); 
          const heightsEntries = Object.entries(newHeights[targetRowKey] || {});
          
          heightsEntries.splice(insertIndex, 0, [colName, MIN_COLUMN_HEIGHT]);
          
          return {
              ...newHeights,
              [targetRowKey]: Object.fromEntries(heightsEntries),
          };
      });
    }

    // --- 2. New Item from Sidebar (with unique name generation) ---
    else if (dragInfo.type === "newItem") {
      if (newData[targetRowKey] && newData[targetRowKey][targetColumnKey]) {
        
        const newCounter = itemCounter + 1;
        setItemCounter(newCounter);

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
      }
    }

    // --- 3. Reorder / Move Existing Item ---
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

    // --- 4. Move/Reorder Existing Column ---
    else if (dragInfo.type === "column" && dragInfo.row && dragInfo.column) {
      const sourceColumnKey = dragInfo.column;
      const targetColumnKeyToMoveBefore = columnDropIndicator.columnKey;

      if (dragInfo.row === targetRowKey) {
        // --- Reordering within the same row ---
        
        // Ensure a target indicator is active 
        if (isIndicatorActive && targetColumnKeyToMoveBefore) {
            let columnsData = newData[targetRowKey];
            let entries = Object.entries(columnsData);

            const sourceIndex = entries.findIndex(([key]) => key === sourceColumnKey);
            const targetIndex = entries.findIndex(([key]) => key === targetColumnKeyToMoveBefore);

            if (sourceIndex > -1 && targetIndex > -1) {
                let insertIndex = targetIndex;
                // Adjust insert position based on indicator
                if (columnDropIndicator.position === "after") {
                    insertIndex = targetIndex + 1;
                }

                // 1. Remove the source column entry
                const [sourceColumnEntry] = entries.splice(sourceIndex, 1);
                
                // Calculate the final insertion index *after* removal
                const finalInsertIndex = insertIndex > sourceIndex ? insertIndex - 1 : insertIndex;
                
                // Only proceed if the column is moving to a new spot
                if (finalInsertIndex !== sourceIndex) { 
                    // 2. Insert the source column at the new position
                    entries.splice(finalInsertIndex, 0, sourceColumnEntry);
                    newData[targetRowKey] = Object.fromEntries(entries);

                    // 3. Synchronize columnHeights state using the exact same logic
                    setColumnHeights(prevHeights => {
                        const newHeights = JSON.parse(JSON.stringify(prevHeights));
                        const heightsEntries = Object.entries(newHeights[targetRowKey]);
                        const sourceHeightIndex = heightsEntries.findIndex(([key]) => key === sourceColumnKey);

                        if (sourceHeightIndex > -1) {
                            const [sourceHeightEntry] = heightsEntries.splice(sourceHeightIndex, 1);
                            heightsEntries.splice(finalInsertIndex, 0, sourceHeightEntry);
                            newHeights[targetRowKey] = Object.fromEntries(heightsEntries);
                        }
                        return newHeights;
                    });
                }
            }
        }
      } else {
        // --- Moving to a different row ---
        // 1. Get the column data and height
        const columnToMove = newData[dragInfo.row][dragInfo.column];
        const heightToMove = columnHeights[dragInfo.row][dragInfo.column];
        
        // 2. Delete data from source
        delete newData[dragInfo.row][dragInfo.column];
        
        // 3. Insert data into target (at the end for now, if no indicator used)
        // NOTE: Full insertion logic here would require the columnDropIndicator to be active on the target column, 
        // which isn't currently supported for cross-row moves, so we append.
        newData[targetRowKey] = {
            ...newData[targetRowKey],
            [dragInfo.column]: columnToMove 
        };
        
        // 4. Update heights state
        setColumnHeights(prevHeights => {
            const newHeights = JSON.parse(JSON.stringify(prevHeights));
            
            // Delete height from source
            delete newHeights[dragInfo.row][dragInfo.column];
            
            // Add height to target
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

  // --- Trash Handler (Unchanged) ---
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
                        onDragOver={(e) => onDragOverColumn(e, rowKey, colKey)}
                        // onDragEnter={(e) => onDragEnterColumn(e, rowKey, colKey)} <-- REMOVED
                        // onDragLeave={onDragLeaveColumn} <-- REMOVED
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
                                // onDragEnter={(e) => onDragEnterItem(e, item)} <-- REMOVED
                                onDragOver={(e) => onDragOverItem(e, item, rowKey, colKey)}
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
                        
                        {/* Vertical Resize Handle (Updated: Minimal and smooth) */}
                        <div
                            onMouseDown={(e) => startResizing(e, rowKey, colKey)}
                            title="Resize Column Vertically"
                            // Base style: h-0.5 (2px). Hover style: h-1 (4px).
                            className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gray-300 border-t border-gray-200 
                                        hover:h-1 hover:bg-blue-500 cursor-ns-resize rounded-b-lg transition-all 
                                        duration-150 ease-in-out ${isResizing ? 'bg-blue-600 h-1 shadow-md' : 'shadow-sm'}`}
                        >
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