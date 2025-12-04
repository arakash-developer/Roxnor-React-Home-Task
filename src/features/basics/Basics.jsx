import { useState } from "react";

const Basics = () => {
  let [columns, setColumns] = useState({
    column1: ["item1", "item2", "item3"],
    column2: ["item4", "item5", "item6"],
  });

  // Track which index the user is hovering over for drop
  let [dragOver, setDragOver] = useState({ column: null, index: null });

  const onDragStart = (event, item, fromColumn) => {
    event.dataTransfer.setData("item", item);
    event.dataTransfer.setData("fromColumn", fromColumn);
  };

  const onDrop = (event, toColumn) => {
    const item = event.dataTransfer.getData("item");
    const fromColumn = event.dataTransfer.getData("fromColumn");

    setColumns((prev) => {
      // Remove from original column
      const fromData = prev[fromColumn].filter((i) => i !== item);
      const toData = [...prev[toColumn]];

      // Insert at tracked index
      const insertIndex =
        dragOver.column === toColumn && dragOver.index !== null
          ? dragOver.index
          : toData.length;

      toData.splice(insertIndex, 0, item);

      return {
        ...prev,
        [fromColumn]: fromData,
        [toColumn]: toData,
      };
    });

    setDragOver({ column: null, index: null });
  };

  const onDragEnterItem = (column, idx) => {
    setDragOver({ column, index: idx });
  };

  const onCreateNewItem = (event, column) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.target));
    setColumns((prev) => ({
      ...prev,
      [column]: [...prev[column], data[column]],
    }));
    event.target.reset();
  };

  const createColumn = (e) => {
    e.preventDefault();
    const totalColumns = Object.keys(columns).length;
    const newColumnName = `column${totalColumns + 1}`;
    setColumns((prev) => ({
      ...prev,
      [newColumnName]: [],
    }));
  };

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      {Object.keys(columns).map((column, colIdx) => (
        <div
          key={colIdx}
          style={{
            minWidth: "150px",
            padding: "10px",
            border: "1px solid #333",
          }}
          onDrop={(e) => onDrop(e, column)}
          onDragOver={(e) => e.preventDefault()}
        >
          <h4>{column}</h4>
          {columns[column].map((item, idx) => (
            <div key={idx} style={{ position: "relative" }}>
              {/* Indicator */}
              {dragOver.column === column && dragOver.index === idx && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "3px",
                    background: "red",
                    zIndex: 10,
                  }}
                ></div>
              )}

              <div
                draggable
                onDragStart={(e) => onDragStart(e, item, column)}
                onDragEnter={() => onDragEnterItem(column, idx)}
                style={{
                  padding: "5px",
                  margin: "5px 0",
                  border: "1px solid #999",
                  background: "#eee",
                  cursor: "grab",
                }}
              >
                {item}
              </div>
            </div>
          ))}

          {/* Show indicator at end if hovering below last item */}
          {dragOver.column === column &&
            dragOver.index === columns[column].length && (
              <div
                style={{
                  height: "3px",
                  background: "red",
                  marginTop: "2px",
                }}
              ></div>
            )}

          <form onSubmit={(e) => onCreateNewItem(e, column)}>
            <input type="text" name={column} placeholder="Add item" />
          </form>
        </div>
      ))}

      <button onClick={createColumn} style={{ height: "40px" }}>
        Create New Column
      </button>
    </div>
  );
};

export default Basics;
