import { useState } from "react";

const CustomNestedDnD = () => {
  const [data, setData] = useState({
    row1: { column1: ["item1", "item2"], column2: ["item3"] },
    row2: { column1: ["item4"] },
  });

  const [sidebar, setSidebar] = useState({
    rows: ["newRow1"],
    columns: ["newColumn1"],
    items: ["newItem1"],
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

  const [dropIndicator, setDropIndicator] = useState({
    show: false,
    position: "before", // "before" or "after"
    item: null,
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

  // --- Drag Enter for Items ---
  const onDragEnterItem = (e, item) => {
    if (dragInfo.type !== "item") return;

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const position = y < rect.height / 2 ? "before" : "after";

    setDropIndicator({
      show: true,
      position,
      item,
    });
  };

  // --- Drag Leave ---
  const onDragLeave = () => {
    setDropIndicator({ show: false, position: "before", item: null });
  };

  // --- Drop Row ---
  const onDropRow = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!dragInfo.type) return;

    const newData = JSON.parse(JSON.stringify(data));

    // Handle new row from sidebar
    if (dragInfo.type === "newRow") {
      const newRow = `${dragInfo.row}_${counters.rows}`;
      if (!newData[newRow]) {
        newData[newRow] = { column1: [] };
      }
      setData(newData);
      setCounters((prev) => ({ ...prev, rows: prev.rows + 1 }));
    }

    // Handle row reordering (dragging existing row to main area)
    if (dragInfo.type === "row" && dragInfo.row) {
      // Just keep the row where it is - reordering happens elsewhere
      // This allows dropping rows back to main area
    }

    setDragInfo({ type: null, row: null, column: null, item: null });
  };

  // --- Drop on Row Container ---
  const onDropOnRow = (e, targetRow) => {
    e.preventDefault();
    e.stopPropagation();

    if (!dragInfo.type || dragInfo.type !== "row" || !dragInfo.row) return;

    const newData = JSON.parse(JSON.stringify(data));
    const entries = Object.entries(newData);

    // Find source and target indices
    const sourceIndex = entries.findIndex(([key]) => key === dragInfo.row);
    const targetIndex = entries.findIndex(([key]) => key === targetRow);

    if (sourceIndex > -1 && targetIndex > -1 && sourceIndex !== targetIndex) {
      // Reorder rows
      const [sourceRow] = entries.splice(sourceIndex, 1);
      entries.splice(targetIndex, 0, sourceRow);
      setData(Object.fromEntries(entries));
    }

    setDragInfo({ type: null, row: null, column: null, item: null });
  };

  // --- Drop Column ---
  const onDropColumn = (e, targetRow, targetColumn) => {
    e.preventDefault();
    e.stopPropagation();

    if (!dragInfo.type) return;

    const newData = JSON.parse(JSON.stringify(data));

    // Handle new row from sidebar - add to target row's columns
    if (dragInfo.type === "newRow") {
      const newRow = `${dragInfo.row}_${counters.rows}`;
      if (!newData[newRow]) {
        newData[newRow] = { column1: [] };
      }
      setData(newData);
      setCounters((prev) => ({ ...prev, rows: prev.rows + 1 }));
      setDragInfo({ type: null, row: null, column: null, item: null });
      return;
    }

    // Handle new column from sidebar
    if (dragInfo.type === "newColumn") {
      const colName = `${dragInfo.column}_${counters.columns}`;
      if (newData[targetRow] && !newData[targetRow][colName]) {
        newData[targetRow][colName] = [];
      }
      setData(newData);
      setCounters((prev) => ({ ...prev, columns: prev.columns + 1 }));
      setDragInfo({ type: null, row: null, column: null, item: null });
      return;
    }

    // Handle column reordering within same row
    if (dragInfo.type === "column" && dragInfo.row && dragInfo.column) {
      if (dragInfo.row === targetRow && dragInfo.column !== targetColumn) {
        // Reorder columns within the same row
        const columns = newData[targetRow];
        const entries = Object.entries(columns);

        const sourceIndex = entries.findIndex(
          ([key]) => key === dragInfo.column
        );
        const targetIndex = entries.findIndex(([key]) => key === targetColumn);

        if (sourceIndex > -1 && targetIndex > -1) {
          const [sourceColumn] = entries.splice(sourceIndex, 1);
          entries.splice(targetIndex, 0, sourceColumn);
          newData[targetRow] = Object.fromEntries(entries);
        }
      } else if (
        dragInfo.row !== targetRow &&
        newData[dragInfo.row] &&
        newData[dragInfo.row][dragInfo.column]
      ) {
        // Move column to different row
        const sourceColumn = newData[dragInfo.row][dragInfo.column];
        newData[targetRow][dragInfo.column] = sourceColumn;
        delete newData[dragInfo.row][dragInfo.column];
      }
      setData(newData);
      setDragInfo({ type: null, row: null, column: null, item: null });
      return;
    }

    // Handle item movement
    if (dragInfo.type === "item" && dragInfo.row && dragInfo.column) {
      if (newData[dragInfo.row] && newData[dragInfo.row][dragInfo.column]) {
        const sourceItems = newData[dragInfo.row][dragInfo.column];
        const itemIndex = sourceItems.indexOf(dragInfo.item);

        if (itemIndex > -1) {
          // If dropping in the same column, reorder items
          if (dragInfo.row === targetRow && dragInfo.column === targetColumn) {
            // Remove item from current position
            sourceItems.splice(itemIndex, 1);
            
            // Find target position based on drop indicator
            const targetItemIndex = sourceItems.indexOf(dropIndicator.item);
            if (targetItemIndex > -1) {
              const insertIndex = dropIndicator.position === "before" ? targetItemIndex : targetItemIndex + 1;
              sourceItems.splice(insertIndex, 0, dragInfo.item);
            } else {
              // If no target item found, add to end
              sourceItems.push(dragInfo.item);
            }
          } else {
            // Moving to a different column
            sourceItems.splice(itemIndex, 1);
            if (newData[targetRow] && newData[targetRow][targetColumn]) {
              newData[targetRow][targetColumn].push(dragInfo.item);
            }
          }
        }
      }
      setData(newData);
      setDropIndicator({ show: false, position: "before", item: null });
      setDragInfo({ type: null, row: null, column: null, item: null });
      return;
    }

    // Handle new item from sidebar
    if (dragInfo.type === "newItem") {
      if (newData[targetRow] && newData[targetRow][targetColumn]) {
        const itemName = `${dragInfo.item}_${counters.items}`;
        newData[targetRow][targetColumn].push(itemName);
        setData(newData);
        setCounters((prev) => ({ ...prev, items: prev.items + 1 }));
      }
    }

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
        {sidebar.items.map((i) => (
          <div
            key={i}
            draggable
            onDragStart={(e) => onDragStart(e, "newItem", null, null, i)}
            className="p-2 mb-2 border bg-purple-200 cursor-move rounded hover:bg-purple-300 transition"
          >
            {i}
          </div>
        ))}
      </div>

      {/* Main Container */}
      <div className="w-full" onDragOver={onDragOver} onDrop={onDropRow}>
        {Object.entries(data).map(([rowKey, columns]) => (
          <div
            key={rowKey}
            draggable
            onDragStart={(e) => onDragStart(e, "row", rowKey)}
            onDragOver={onDragOver}
            onDrop={(e) => onDropOnRow(e, rowKey)}
            className="border-2 border-gray-300 p-4 mb-4 bg-gray-50 rounded cursor-move hover:border-yellow-500 transition"
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-lg">{rowKey}</h3>
            </div>
            <div className="flex gap-4">
              {Object.entries(columns).map(([colKey, items]) => (
                <div
                  key={colKey}
                  draggable
                  onDragStart={(e) => onDragStart(e, "column", rowKey, colKey)}
                  onDragOver={onDragOver}
                  onDrop={(e) => onDropColumn(e, rowKey, colKey)}
                  className="flex-1 border-2 border-dashed border-gray-300 p-4 bg-white rounded min-h-[150px] cursor-move hover:border-blue-500 transition"
                >
                  <h4 className="font-semibold mb-3 pb-2 border-b">{colKey}</h4>
                  <div
                    className="space-y-2"
                    onDragOver={onDragOver}
                    onDrop={(e) => onDropColumn(e, rowKey, colKey)}
                  >
                    {items.map((item) => (
                      <div key={item}>
                        {dropIndicator.show && dropIndicator.position === "before" && dropIndicator.item === item && (
                          <div className="h-1 bg-blue-500 mb-2 rounded"></div>
                        )}
                        <div
                          draggable
                          onDragStart={(e) =>
                            onDragStart(e, "item", rowKey, colKey, item)
                          }
                          onDragEnter={(e) => onDragEnterItem(e, item)}
                          onDragLeave={onDragLeave}
                          onDragOver={onDragOver}
                          className="p-3 border border-gray-400 bg-gradient-to-r from-yellow-100 to-yellow-50 rounded cursor-move hover:shadow-md transition"
                        >
                          {item}
                        </div>
                        {dropIndicator.show && dropIndicator.position === "after" && dropIndicator.item === item && (
                          <div className="h-1 bg-blue-500 mt-2 rounded"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomNestedDnD;
