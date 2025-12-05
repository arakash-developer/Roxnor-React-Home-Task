import { useState } from "react";

// Helper to render the different item types
const renderItem = (item) => {
  switch (item.type) {
    case "input":
      return (
        <input
          placeholder="Input field"
          className="w-full p-2 border rounded"
          disabled
        />
      );
    case "text":
      return <p className="text-gray-800">{item.label}</p>;
    case "image":
      return (
        <div className="w-full h-24 bg-gray-200 flex items-center justify-center rounded">
          Img
        </div>
      );
    default:
      return item.id || item;
  }
};

const CustomNestedDnD = () => {
  const [data, setData] = useState({
    row1: {
      column1: [
        { id: "comp1", type: "input" },
        { id: "comp2", type: "image" },
      ],
      column2: [
        { id: "comp3", type: "input" },
        { id: "comp4", type: "image" },
      ],
    },
    row2: {
      column1: [
        { id: "comp5", type: "input" },
        { id: "comp6", type: "image" },
      ],
    },
  });

  const [sidebar] = useState({
    rows: ["newRow"],
    columns: ["newColumn"],
    items: [
      { type: "input", label: "Input Field" },
      { type: "text", label: "Text" },
      { type: "image", label: "Image" },
    ],
  });

  const [dragInfo, setDragInfo] = useState({
    type: null,
    row: null,
    column: null,
    item: null,
  });

  const [counters, setCounters] = useState({
    rows: 1,
    columns: 1,
    items: 1,
  });

  // ITEM drop indicator state
  const [itemDropIndicator, setItemDropIndicator] = useState({
    show: false,
    position: "before", // "before" or "after"
    itemId: null,
  });

  // COLUMN drop indicator state
  const [columnDropIndicator, setColumnDropIndicator] = useState({
    show: false,
    position: "before", // "before" or "after"
    columnKey: null,
    rowKey: null,
  });

  // ROW drop indicator state
  const [rowDropIndicator, setRowDropIndicator] = useState({
    show: false,
    position: "before", // "before" or "after"
    rowKey: null,
  });

  // --- Drag Start ---
  const onDragStart = (e, type, row = null, column = null, item = null) => {
    e.stopPropagation();
    setDragInfo({ type, row, column, item });
    e.dataTransfer.effectAllowed = "move";
  };

  // --- Drag Over ---
  const onDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // --- Drag Enter for Items (Shows Indicator) ---
  const onDragEnterItem = (e, item) => {
    if (dragInfo.type !== "item" && dragInfo.type !== "newItem") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const position = y < rect.height / 2 ? "before" : "after";
    setItemDropIndicator({
      show: true,
      position,
      itemId: item.id,
    });
  };

  // --- Drag Leave for Items (Hides Indicator) ---
  const onDragLeaveItem = () => {
    setItemDropIndicator({ show: false, position: "before", itemId: null });
  };

  // --- Drag Enter for Columns (Shows Indicator) ---
  const onDragEnterColumn = (e, rowKey, colKey) => {
    if (dragInfo.type !== "column") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const position = x < rect.width / 2 ? "before" : "after";

    setColumnDropIndicator({
      show: true,
      position,
      columnKey: colKey,
      rowKey: rowKey,
    });
  };

  // --- Drag Leave for Columns (Hides Indicator) ---
  const onDragLeaveColumn = () => {
    setColumnDropIndicator({
      show: false,
      position: "before",
      columnKey: null,
      rowKey: null,
    });
  };

  // --- Drag Enter for Rows (Shows Indicator) ---
  const onDragEnterRow = (e, rowKey) => {
    if (dragInfo.type !== "row") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const position = y < rect.height / 2 ? "before" : "after";

    setRowDropIndicator({
      show: true,
      position,
      rowKey: rowKey,
    });
  };

  // --- Drag Leave for Rows (Hides Indicator) ---
  const onDragLeaveRow = () => {
    setRowDropIndicator({ show: false, position: "before", rowKey: null });
  };


  // --- Drop Row from Sidebar ---
  const onDropRow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragInfo.type !== "newRow") return;

    const newData = JSON.parse(JSON.stringify(data));
    const newRowKey = `row${counters.rows + 2}`; // Ensure unique key
    if (!newData[newRowKey]) {
      newData[newRowKey] = { column1: [] };
    }
    setData(newData);
    setCounters((prev) => ({ ...prev, rows: prev.rows + 1 }));
    setDragInfo({ type: null, row: null, column: null, item: null });
  };

  // --- Drop on Row Container (Reorder Rows) ---
  const onDropOnRow = (e, targetRowKey) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. Reordering existing rows
    if (dragInfo.type === "row" && dragInfo.row) {
      const newData = JSON.parse(JSON.stringify(data));
      const entries = Object.entries(newData);
      const sourceIndex = entries.findIndex(([key]) => key === dragInfo.row);
      const targetIndex = entries.findIndex(([key]) => key === targetRowKey);
      
      // Determine insertion point based on indicator
      let insertIndex = targetIndex;
      if (rowDropIndicator.show && rowDropIndicator.position === "after") {
          insertIndex = targetIndex + 1;
      }
      
      if (sourceIndex > -1 && targetIndex > -1 && sourceIndex !== insertIndex && sourceIndex !== insertIndex - 1) {
          const [sourceRow] = entries.splice(sourceIndex, 1);
          entries.splice(insertIndex > sourceIndex ? insertIndex - 1 : insertIndex, 0, sourceRow);
          setData(Object.fromEntries(entries));
      }
    }

    // 2. Clear state
    setRowDropIndicator({ show: false, position: "before", rowKey: null });
    setDragInfo({ type: null, row: null, column: null, item: null });
  };

  // --- Drop Column / Item Logic ---
  const onDropColumn = (e, targetRowKey, targetColumnKey) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragInfo.type) return;

    const newData = JSON.parse(JSON.stringify(data));

    // 1. New Column from Sidebar
    if (dragInfo.type === "newColumn") {
      const colName = `${dragInfo.column}_${counters.columns}`;
      if (newData[targetRowKey] && !newData[targetRowKey][colName]) {
        newData[targetRowKey][colName] = [];
      }
      setData(newData);
      setCounters((prev) => ({ ...prev, columns: prev.columns + 1 }));
    }

    // 2. New Item from Sidebar
    else if (dragInfo.type === "newItem") {
      if (newData[targetRowKey] && newData[targetRowKey][targetColumnKey]) {
        const newItem = {
          id: `${dragInfo.item.type}_${counters.items}`,
          type: dragInfo.item.type,
          label: dragInfo.item.label,
        };
        const targetItems = newData[targetRowKey][targetColumnKey];
        
        // Handle insertion based on item drop indicator, or push to end if none
        if (itemDropIndicator.show && itemDropIndicator.itemId) {
            const targetIndex = targetItems.findIndex(i => i.id === itemDropIndicator.itemId);
            const insertIndex = itemDropIndicator.position === "before" ? targetIndex : targetIndex + 1;
            targetItems.splice(insertIndex, 0, newItem);
        } else {
            targetItems.push(newItem);
        }
        
        setCounters((prev) => ({ ...prev, items: prev.items + 1 }));
      }
    }

    // 3. Reorder / Move Existing Item
    else if (
      dragInfo.type === "item" &&
      dragInfo.row &&
      dragInfo.column &&
      dragInfo.item
    ) {
      const sourceItems = newData[dragInfo.row][dragInfo.column];
      const itemIndex = sourceItems.findIndex((i) => i.id === dragInfo.item.id);

      if (itemIndex > -1) {
        // Remove item from source
        sourceItems.splice(itemIndex, 1);

        const targetItems = newData[targetRowKey][targetColumnKey];

        // Drop before/after another item based on itemDropIndicator
        if (itemDropIndicator.show && itemDropIndicator.itemId) {
          const targetIndex = targetItems.findIndex(
            (i) => i.id === itemDropIndicator.itemId
          );
          const insertIndex =
            itemDropIndicator.position === "before" ? targetIndex : targetIndex + 1;
          targetItems.splice(insertIndex, 0, dragInfo.item);
        } else {
          // Drop to end of column if no item indicator is visible
          targetItems.push(dragInfo.item);
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

          // Determine insertion point based on indicator
          let insertIndex = targetIndex;
          if (columnDropIndicator.position === "after") {
              insertIndex = targetIndex + 1;
          }
          
          if (sourceIndex > -1 && targetIndex > -1 && sourceIndex !== insertIndex && sourceIndex !== insertIndex - 1) {
              const [sourceColumn] = entries.splice(sourceIndex, 1);
              // Adjust index after splice if source was before target
              entries.splice(insertIndex > sourceIndex ? insertIndex - 1 : insertIndex, 0, sourceColumn);
              newData[targetRowKey] = Object.fromEntries(entries);
          }
        }
      } else {
        // Moving to a different row (only if dropped on a column area)
        const columnToMove = newData[dragInfo.row][dragInfo.column];
        delete newData[dragInfo.row][dragInfo.column];
        newData[targetRowKey][dragInfo.column] = columnToMove;
      }
    }

    // 5. Clear state
    setData(newData);
    setItemDropIndicator({ show: false, position: "before", itemId: null });
    setColumnDropIndicator({ show: false, position: "before", columnKey: null, rowKey: null });
    setDragInfo({ type: null, row: null, column: null, item: null });
  };

  // --- Trash ---
  const onDropToTrash = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragInfo.type) return;

    const newData = JSON.parse(JSON.stringify(data));

    if (dragInfo.type === "row" && dragInfo.row) delete newData[dragInfo.row];
    if (dragInfo.type === "column" && dragInfo.row && dragInfo.column) {
      delete newData[dragInfo.row][dragInfo.column];
    }
    if (dragInfo.type === "item" && dragInfo.row && dragInfo.column && dragInfo.item) {
      newData[dragInfo.row][dragInfo.column] = newData[dragInfo.row][
        dragInfo.column
      ].filter((i) => i.id !== dragInfo.item.id);
    }

    setData(newData);
    setDragInfo({ type: null, row: null, column: null, item: null });
  };

  return (
    <div className="flex gap-4 p-4 w-full">
      {/* Sidebar */}
      <div className="w-[20%] border p-4 bg-gray-100 rounded h-fit">
        <h4 className="font-bold mb-2">Rows</h4>
        {sidebar.rows.map((r) => (
          <div
            key={r}
            draggable
            onDragStart={(e) => onDragStart(e, "newRow", r)}
            className="p-2 mb-2 border bg-blue-200 cursor-move rounded hover:bg-blue-300 transition"
          >
            {r}
          </div>
        ))}

        <h4 className="font-bold mb-2 mt-4">Columns</h4>
        {sidebar.columns.map((c) => (
          <div
            key={c}
            draggable
            onDragStart={(e) => onDragStart(e, "newColumn", null, c)}
            className="p-2 mb-2 border bg-green-200 cursor-move rounded hover:bg-green-300 transition"
          >
            {c}
          </div>
        ))}

        <h4 className="font-bold mb-2 mt-4">Items</h4>
        {sidebar.items.map((i, index) => (
          <div
            key={index}
            draggable
            onDragStart={(e) => onDragStart(e, "newItem", null, null, i)}
            className="p-2 mb-2 border bg-purple-200 cursor-move rounded hover:bg-purple-300 transition"
          >
            {renderItem(i)}
          </div>
        ))}
      </div>

      {/* Main Area */}
      <div className="w-full" onDragOver={onDragOver} onDrop={onDropRow}>
        {Object.entries(data).map(([rowKey, columns]) => (
          <div key={rowKey}>
             {/* Row Drop Indicator (Before) */}
             {rowDropIndicator.show &&
              rowDropIndicator.position === "before" &&
              rowDropIndicator.rowKey === rowKey && (
                <div className="h-2 my-2 bg-yellow-500 rounded"></div>
              )}

            <div
              draggable
              onDragStart={(e) => onDragStart(e, "row", rowKey)}
              onDragOver={onDragOver}
              onDragEnter={(e) => onDragEnterRow(e, rowKey)}
              onDragLeave={onDragLeaveRow}
              onDrop={(e) => onDropOnRow(e, rowKey)}
              className="border-2 border-gray-300 p-4 mb-4 bg-gray-50 rounded cursor-move hover:border-yellow-500 transition"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-lg">{rowKey}</h3>
              </div>
              
              {/* Columns Container */}
              <div className="flex gap-4">
                {Object.entries(columns).map(([colKey, items]) => (
                  <div key={colKey} className="flex-1 flex">
                    {/* Column Drop Indicator (Before) */}
                    {columnDropIndicator.show &&
                      columnDropIndicator.position === "before" &&
                      columnDropIndicator.columnKey === colKey &&
                      columnDropIndicator.rowKey === rowKey && (
                        <div className="w-2 mx-1 bg-green-500 rounded"></div>
                      )}

                    <div
                      draggable
                      onDragStart={(e) => onDragStart(e, "column", rowKey, colKey)}
                      onDragOver={onDragOver}
                      onDragEnter={(e) => onDragEnterColumn(e, rowKey, colKey)}
                      onDragLeave={onDragLeaveColumn}
                      onDrop={(e) => onDropColumn(e, rowKey, colKey)}
                      className="flex-1 border-2 border-dashed border-gray-300 p-4 bg-white rounded min-h-[150px] cursor-move hover:border-blue-500 transition"
                    >
                      <h4 className="font-semibold mb-3 pb-2 border-b">{colKey}</h4>
                      <div className="space-y-2">
                        {items.map((item) => (
                          <div key={item.id || item}>
                            {/* Item Drop Indicator (Before) */}
                            {itemDropIndicator.show &&
                              itemDropIndicator.position === "before" &&
                              itemDropIndicator.itemId === item.id && (
                                <div className="h-1 bg-blue-500 mb-2 rounded"></div>
                              )}
                            <div
                              draggable
                              onDragStart={(e) =>
                                onDragStart(e, "item", rowKey, colKey, item)
                              }
                              onDragEnter={(e) => onDragEnterItem(e, item)}
                              onDragLeave={onDragLeaveItem}
                              onDragOver={onDragOver}
                              className="p-3 border border-gray-400 bg-gradient-to-r from-yellow-100 to-yellow-50 rounded cursor-move hover:shadow-md transition"
                            >
                              {renderItem(item)}
                            </div>
                            {/* Item Drop Indicator (After) */}
                            {itemDropIndicator.show &&
                              itemDropIndicator.position === "after" &&
                              itemDropIndicator.itemId === item.id && (
                                <div className="h-1 bg-blue-500 mt-2 rounded"></div>
                              )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Column Drop Indicator (After) - Only show if it's the last column in the row */}
                    {columnDropIndicator.show &&
                      columnDropIndicator.position === "after" &&
                      columnDropIndicator.columnKey === colKey &&
                      columnDropIndicator.rowKey === rowKey &&
                      Object.keys(columns)[Object.keys(columns).length - 1] === colKey && (
                        <div className="w-2 mx-1 bg-green-500 rounded"></div>
                      )}
                  </div>
                ))}
              </div>
            </div>

            {/* Row Drop Indicator (After) */}
            {rowDropIndicator.show &&
              rowDropIndicator.position === "after" &&
              rowDropIndicator.rowKey === rowKey && (
                <div className="h-2 my-2 bg-yellow-500 rounded"></div>
              )}
          </div>
        ))}

        {/* Trash */}
        <div
          className="w-full flex justify-end mb-4"
          onDragOver={onDragOver}
          onDrop={onDropToTrash}
        >
          <div className="p-4 w-[200px] border-2 border-red-400 bg-red-100 rounded-lg text-center cursor-pointer hover:bg-red-200 transition">
            🗑️ <span className="font-bold">Trash</span>
            <p className="text-sm text-gray-700">Drag here to delete</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomNestedDnD;