import { useCallback, useEffect, useState } from "react";

// Helper function to render the different item types
const renderItem = (item) => {
  switch (item.type) {
    case "input":
      return (
        <input
          placeholder={item.label || "Input Field"}
          className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 transition-all bg-white"
          disabled
        />
      );
    case "text":
      return (
        <p className="text-gray-700 px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-md bg-white">
          {item.label}
        </p>
      );
    case "image":
      return (
        <div className="w-full h-14 bg-blue-50 flex items-center justify-center rounded-md text-xs text-blue-500 font-semibold border border-dashed border-blue-300">
          {item.label || "Image Placeholder"}
        </div>
      );
    default:
      return item.id || item;
  }
};

// Helper function to generate a unique key
const getNewUniqueKey = (dataObj, prefix = "entity") => {
  let count = 1;
  let newKey = `${prefix}${count}`;
  while (dataObj.hasOwnProperty(newKey)) {
    count++;
    newKey = `${prefix}${count}`;
  }
  return newKey;
};

// *** UNIVERSAL REORDERING HELPER ***
// Ensures guaranteed ordering for objects stored as [key, value] arrays (used for Rows and Columns)
const moveEntry = (entries, sourceKey, insertIndex) => {
  const sourceEntryIndex = entries.findIndex(([key]) => key === sourceKey);
  if (sourceEntryIndex === -1) return entries;

  // 1. Remove the source entry
  const sourceEntry = entries[sourceEntryIndex];
  const entriesWithoutSource = entries.filter(([key]) => key !== sourceKey);

  // 2. Insert the source entry back at the required index
  const newEntries = [...entriesWithoutSource];

  // If the drop target index is after the source's original index, the index
  // needs to be maintained as the removal shifted the elements. We rely on the
  // fact that entriesWithoutSource is already 1 element shorter.
  newEntries.splice(insertIndex, 0, sourceEntry);

  return newEntries;
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
  const [resizeTarget, setResizeTarget] = useState({
    rowKey: null,
    colKey: null,
    startY: 0,
    startHeight: 0,
  });
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

  // Unique index for new content items
  const [itemCounter, setItemCounter] = useState(6);

  // Indicator States
  const [itemDropIndicator, setItemDropIndicator] = useState({
    show: false,
    position: "before",
    itemId: null,
  });
  const [columnDropIndicator, setColumnDropIndicator] = useState({
    show: false,
    position: "before",
    columnKey: null,
    rowKey: null,
  });
  const [rowDropIndicator, setRowDropIndicator] = useState({
    show: false,
    position: "before",
    rowKey: null,
  });

  // Reset function for all drag/indicator state
  const resetDragState = useCallback(() => {
    setDragInfo({ type: null, row: null, column: null, item: null });
    setItemDropIndicator({ show: false, position: "before", itemId: null });
    setColumnDropIndicator({
      show: false,
      position: "before",
      columnKey: null,
      rowKey: null,
    });
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

  const doResizing = useCallback(
    (e) => {
      if (!isResizing || !resizeTarget.rowKey || !resizeRef) return;

      const deltaY = e.clientY - resizeTarget.startY;
      let newHeight = resizeTarget.startHeight + deltaY;

      newHeight = Math.max(newHeight, MIN_COLUMN_HEIGHT);

      // Update height directly on the DOM element for smooth resizing
      resizeRef.style.height = `${newHeight}px`;
    },
    [isResizing, resizeTarget, resizeRef]
  );

  const stopResizing = useCallback(() => {
    if (isResizing && resizeRef) {
      const finalHeight = resizeRef.offsetHeight;

      // Update React state ONCE with the final height
      setColumnHeights((prevHeights) => ({
        ...prevHeights,
        [resizeTarget.rowKey]: {
          ...prevHeights[resizeTarget.rowKey],
          [resizeTarget.colKey]: finalHeight,
        },
      }));

      // Cleanup
      setIsResizing(false);
      setResizeTarget({
        rowKey: null,
        colKey: null,
        startY: 0,
        startHeight: 0,
      });
      setResizeRef(null);
    }
  }, [isResizing, resizeRef, resizeTarget.rowKey, resizeTarget.colKey]);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", doResizing);
      document.addEventListener("mouseup", stopResizing);
    } else {
      document.removeEventListener("mousemove", doResizing);
      document.removeEventListener("mouseup", stopResizing);
    }
    return () => {
      document.removeEventListener("mousemove", doResizing);
      document.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing, doResizing, stopResizing]);

  // --- Drag & Indicator Logic (Unchanged) ---
  const onDragStart = (e, type, row = null, column = null, item = null) => {
    e.stopPropagation();
    setDragInfo({ type, row, column, item });
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const onDragOverItem = useCallback(
    (e, item) => {
      e.preventDefault();
      e.stopPropagation();
      if (
        (dragInfo.type !== "item" && dragInfo.type !== "newItem") ||
        dragInfo.item?.id === item.id
      )
        return;
      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const position = y < rect.height / 2 ? "before" : "after";
      setItemDropIndicator((prev) => {
        if (prev.show && prev.itemId === item.id && prev.position === position)
          return prev;
        return { show: true, position, itemId: item.id };
      });
    },
    [dragInfo]
  );

  const onDragOverColumn = useCallback(
    (e, rowKey, colKey) => {
      e.preventDefault();
      e.stopPropagation();
      if (dragInfo.type !== "column" && dragInfo.type !== "newColumn") return;
      if (
        dragInfo.type === "column" &&
        dragInfo.column === colKey &&
        dragInfo.row === rowKey
      )
        return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const position = x < rect.width / 2 ? "before" : "after";

      setColumnDropIndicator((prev) => {
        if (
          prev.show &&
          prev.columnKey === colKey &&
          prev.rowKey === rowKey &&
          prev.position === position
        )
          return prev;
        return { show: true, position, columnKey: colKey, rowKey: rowKey };
      });
    },
    [dragInfo]
  );

  const onDragOverRow = useCallback(
    (e, rowKey) => {
      e.preventDefault();
      e.stopPropagation();
      if (
        (dragInfo.type !== "row" && dragInfo.type !== "newRow") ||
        dragInfo.row === rowKey
      )
        return;

      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const position = y < rect.height / 2 ? "before" : "after";

      setRowDropIndicator((prev) => {
        if (prev.show && prev.rowKey === rowKey && prev.position === position)
          return prev;
        return { show: true, position, rowKey: rowKey };
      });
    },
    [dragInfo]
  );

  // --- Drop Handlers ---

  // Handles drops into the main canvas area
  const onDropRow = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (dragInfo.type === "newRow") {
      const newRowKey = getNewUniqueKey(data, "row");

      setData((prevData) => ({
        ...prevData,
        [newRowKey]: { column1: [] },
      }));

      setColumnHeights((prevHeights) => ({
        ...prevHeights,
        [newRowKey]: { column1: MIN_COLUMN_HEIGHT },
      }));
    }

    resetDragState();
  };

  // Handles reordering existing rows AND inserting new rows. (IMMUTABLE)
  const onDropOnRow = (e, targetRowKey) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. Reordering existing rows
    if (dragInfo.type === "row" && dragInfo.row) {
      const sourceRowKey = dragInfo.row;
      if (sourceRowKey === targetRowKey) {
        resetDragState();
        return;
      }

      setData((prevData) => {
        let entries = Object.entries(prevData);
        const targetIndex = entries.findIndex(([key]) => key === targetRowKey);
        let insertIndex =
          rowDropIndicator.show && rowDropIndicator.position === "after"
            ? targetIndex + 1
            : targetIndex;

        const newOrderedDataEntries = moveEntry(
          entries,
          sourceRowKey,
          insertIndex
        );
        return Object.fromEntries(newOrderedDataEntries);
      });

      // 2. Update Heights
      setColumnHeights((prevHeights) => {
        const heightsEntries = Object.entries(prevHeights);
        const targetIndex = heightsEntries.findIndex(
          ([key]) => key === targetRowKey
        );
        let insertIndex =
          rowDropIndicator.show && rowDropIndicator.position === "after"
            ? targetIndex + 1
            : targetIndex;

        const newOrderedHeightsEntries = moveEntry(
          heightsEntries,
          sourceRowKey,
          insertIndex
        );
        return Object.fromEntries(newOrderedHeightsEntries);
      });
    }
    // 3. Inserting a NEW row
    else if (dragInfo.type === "newRow") {
      const newRowKey = getNewUniqueKey(data, "row");
      const newRowEntry = [newRowKey, { column1: [] }];

      setData((prevData) => {
        let entries = Object.entries(prevData);
        const targetIndex = entries.findIndex(([key]) => key === targetRowKey);
        let insertIndex =
          rowDropIndicator.show && rowDropIndicator.position === "after"
            ? targetIndex + 1
            : targetIndex;

        const newEntries = [...entries];
        newEntries.splice(insertIndex, 0, newRowEntry);
        return Object.fromEntries(newEntries);
      });

      // Insert new height entry
      setColumnHeights((prevHeights) => {
        const heightsEntries = Object.entries(prevHeights);
        const targetIndex = heightsEntries.findIndex(
          ([key]) => key === targetRowKey
        );
        let insertIndex =
          rowDropIndicator.show && rowDropIndicator.position === "after"
            ? targetIndex + 1
            : targetIndex;

        const newHeightsEntries = [...heightsEntries];
        newHeightsEntries.splice(insertIndex, 0, [
          newRowKey,
          { column1: MIN_COLUMN_HEIGHT },
        ]);
        return Object.fromEntries(newHeightsEntries);
      });
    }

    resetDragState();
  };

  // Functional Helper to update a column's items array inside the nested state (IMMUTABLE)
  const updateColumnItems = (prevData, rowKey, colKey, updateFn) => {
    if (!prevData[rowKey] || !prevData[rowKey][colKey]) {
      return prevData;
    }

    const newItems = updateFn([...prevData[rowKey][colKey]]);

    return {
      ...prevData,
      [rowKey]: {
        ...prevData[rowKey],
        [colKey]: newItems,
      },
    };
  };

  const onDropColumn = (e, targetRowKey, targetColumnKey) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragInfo.type) {
      resetDragState();
      return;
    }

    const isIndicatorActive =
      columnDropIndicator.show &&
      columnDropIndicator.rowKey === targetRowKey &&
      columnDropIndicator.columnKey === targetColumnKey;

    // --- 1. New Column from Sidebar (IMMUTABLE) ---
    if (dragInfo.type === "newColumn") {
      const colName = getNewUniqueKey(data[targetRowKey] || {}, "column");
      const newColumnEntry = [colName, []];

      setData((prevData) => {
        let entries = Object.entries(prevData[targetRowKey] || {});
        let insertIndex = entries.length;

        if (isIndicatorActive && targetColumnKey) {
          const targetIndex = entries.findIndex(
            ([key]) => key === targetColumnKey
          );
          if (targetIndex !== -1) {
            insertIndex =
              columnDropIndicator.position === "before"
                ? targetIndex
                : targetIndex + 1;
          }
        }

        const newEntries = [...entries];
        newEntries.splice(insertIndex, 0, newColumnEntry);

        return {
          ...prevData,
          [targetRowKey]: Object.fromEntries(newEntries),
        };
      });

      // Initialize height for the new column, preserving order
      setColumnHeights((prevHeights) => {
        let heightsEntries = Object.entries(prevHeights[targetRowKey] || {});
        const targetIndex = heightsEntries.findIndex(
          ([key]) => key === targetColumnKey
        );
        let insertIndex = heightsEntries.length;

        if (isIndicatorActive && targetColumnKey && targetIndex !== -1) {
          insertIndex =
            columnDropIndicator.position === "before"
              ? targetIndex
              : targetIndex + 1;
        }

        const newHeightsEntries = [...heightsEntries];
        newHeightsEntries.splice(insertIndex, 0, [colName, MIN_COLUMN_HEIGHT]);

        return {
          ...prevHeights,
          [targetRowKey]: Object.fromEntries(newHeightsEntries),
        };
      });
    }

    // --- 2. New Item from Sidebar (IMMUTABLE) ---
    else if (dragInfo.type === "newItem") {
      const newCounter = itemCounter + 1;
      setItemCounter(newCounter);

      let baseLabel = dragInfo.item.label.includes("Field")
        ? "Input Field"
        : dragInfo.item.label;

      const newItem = {
        id: `${dragInfo.item.type}_${newCounter}`,
        type: dragInfo.item.type,
        label: `${baseLabel} ${newCounter}`,
      };

      setData((prevData) =>
        updateColumnItems(
          prevData,
          targetRowKey,
          targetColumnKey,
          (targetItems) => {
            if (itemDropIndicator.show && itemDropIndicator.itemId) {
              const targetIndex = targetItems.findIndex(
                (i) => i.id === itemDropIndicator.itemId
              );
              const insertIndex =
                itemDropIndicator.position === "before"
                  ? targetIndex
                  : targetIndex + 1;
              targetItems.splice(insertIndex, 0, newItem);
            } else {
              targetItems.push(newItem);
            }
            return targetItems;
          }
        )
      );
    }

    // --- 3. Reorder / Move Existing Item (Cross-Column or Same-Column) (IMMUTABLE) ---
    else if (
      dragInfo.type === "item" &&
      dragInfo.row &&
      dragInfo.column &&
      dragInfo.item
    ) {
      const sourceRowKey = dragInfo.row;
      const sourceColumnKey = dragInfo.column;
      const movedItemId = dragInfo.item.id;

      setData((prevData) => {
        // 1. Find and retrieve the moved item in a safe way
        let movedItem = null;
        let sourceItems = prevData[sourceRowKey]?.[sourceColumnKey] || [];

        movedItem = sourceItems.find((item) => item.id === movedItemId);

        if (!movedItem) return prevData;

        // 2. Construct the new source items array (item filtered out)
        const newSourceItems = sourceItems.filter(
          (item) => item.id !== movedItemId
        );

        // 3. Construct the new target items array (item inserted)
        let newTargetItems = [
          ...(prevData[targetRowKey]?.[targetColumnKey] || []),
        ];

        if (itemDropIndicator.show && itemDropIndicator.itemId) {
          const targetIndex = newTargetItems.findIndex(
            (i) => i.id === itemDropIndicator.itemId
          );
          const insertIndex =
            itemDropIndicator.position === "before"
              ? targetIndex
              : targetIndex + 1;
          newTargetItems.splice(insertIndex, 0, movedItem);
        } else {
          newTargetItems.push(movedItem);
        }

        // 4. Update state immutably for both rows/columns
        return {
          ...prevData,
          [sourceRowKey]: {
            ...prevData[sourceRowKey],
            [sourceColumnKey]: newSourceItems,
          },
          [targetRowKey]: {
            ...prevData[targetRowKey],
            [targetColumnKey]: newTargetItems,
          },
        };
      });
    }

    // --- 4. Move/Reorder Existing Column (IMMUTABLE) ---
    else if (dragInfo.type === "column" && dragInfo.row && dragInfo.column) {
      const sourceColumnKey = dragInfo.column;
      const sourceRowKey = dragInfo.row;

      if (sourceRowKey === targetRowKey) {
        // --- Reordering within the same row ---

        if (isIndicatorActive && targetColumnKey) {
          // 1. Update Data
          setData((prevData) => {
            let entries = Object.entries(prevData[targetRowKey]);
            const targetIndex = entries.findIndex(
              ([key]) => key === targetColumnKey
            );

            let insertIndex =
              columnDropIndicator.position === "after"
                ? targetIndex + 1
                : targetIndex;

            const newColumnsEntries = moveEntry(
              entries,
              sourceColumnKey,
              insertIndex
            );

            return {
              ...prevData,
              [targetRowKey]: Object.fromEntries(newColumnsEntries),
            };
          });

          // 2. Synchronize columnHeights state
          setColumnHeights((prevHeights) => {
            let heightsEntries = Object.entries(prevHeights[targetRowKey]);
            const targetIndex = heightsEntries.findIndex(
              ([key]) => key === targetColumnKey
            );

            let insertIndex =
              columnDropIndicator.position === "after"
                ? targetIndex + 1
                : targetIndex;

            const newHeightsEntries = moveEntry(
              heightsEntries,
              sourceColumnKey,
              insertIndex
            );

            return {
              ...prevHeights,
              [targetRowKey]: Object.fromEntries(newHeightsEntries),
            };
          });
        }
      } else {
        // --- Moving to a different row (Cross-row move) ---

        // 1. Update Data
        setData((prevData) => {
          const columnToMove = prevData[sourceRowKey][sourceColumnKey];

          // A. Remove from source row immutably
          const newSourceColumns = Object.fromEntries(
            Object.entries(prevData[sourceRowKey]).filter(
              ([key]) => key !== sourceColumnKey
            )
          );

          // B. Add to target row immutably (using insertion logic)
          let targetEntries = Object.entries(prevData[targetRowKey]);

          // Determine insertion index based on indicator
          let insertIndex = targetEntries.length; // Default to append
          if (isIndicatorActive && targetColumnKey) {
            const targetIndex = targetEntries.findIndex(
              ([key]) => key === targetColumnKey
            );
            if (targetIndex !== -1) {
              insertIndex =
                columnDropIndicator.position === "before"
                  ? targetIndex
                  : targetIndex + 1;
            }
          }

          const newColumnEntry = [sourceColumnKey, columnToMove];
          let newTargetEntries = [...targetEntries];
          newTargetEntries.splice(insertIndex, 0, newColumnEntry);

          const newTargetColumns = Object.fromEntries(newTargetEntries);

          return {
            ...prevData,
            [sourceRowKey]: newSourceColumns,
            [targetRowKey]: newTargetColumns,
          };
        });

        // 2. Update Heights state (must mirror data logic)
        setColumnHeights((prevHeights) => {
          const heightToMove = prevHeights[sourceRowKey][sourceColumnKey];

          // A. Remove from source height immutably
          const newSourceHeights = Object.fromEntries(
            Object.entries(prevHeights[sourceRowKey]).filter(
              ([key]) => key !== sourceColumnKey
            )
          );

          // B. Add to target height immutably (using insertion logic)
          let targetHeightEntries = Object.entries(prevHeights[targetRowKey]);

          // Determine insertion index based on indicator (same index as data)
          let insertIndex = targetHeightEntries.length;
          if (isIndicatorActive && targetColumnKey) {
            const targetIndex = targetHeightEntries.findIndex(
              ([key]) => key === targetColumnKey
            );
            if (targetIndex !== -1) {
              insertIndex =
                columnDropIndicator.position === "before"
                  ? targetIndex
                  : targetIndex + 1;
            }
          }

          const newHeightEntry = [sourceColumnKey, heightToMove];
          let newTargetHeightEntries = [...targetHeightEntries];
          newTargetHeightEntries.splice(insertIndex, 0, newHeightEntry);

          const newTargetHeights = Object.fromEntries(newTargetHeightEntries);

          return {
            ...prevHeights,
            [sourceRowKey]: newSourceHeights,
            [targetRowKey]: newTargetHeights,
          };
        });
      }
    }

    resetDragState();
  };

  // --- Trash Handler (IMMUTABLE DELETION) ---
  const onDropToTrash = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragInfo.type) return;

    if (dragInfo.type === "row" && dragInfo.row) {
      setData((prev) => {
        const next = { ...prev };
        delete next[dragInfo.row];
        return next;
      });
      setColumnHeights((prev) => {
        const next = { ...prev };
        delete next[dragInfo.row];
        return next;
      });
    }

    if (dragInfo.type === "column" && dragInfo.row && dragInfo.column) {
      const rowKey = dragInfo.row;
      const colKey = dragInfo.column;

      setData((prev) => {
        const newRow = Object.fromEntries(
          Object.entries(prev[rowKey]).filter(([key]) => key !== colKey)
        );
        // Delete row if empty, otherwise update
        return Object.keys(newRow).length === 0
          ? { ...prev, [rowKey]: {} }
          : { ...prev, [rowKey]: newRow };
      });

      setColumnHeights((prev) => {
        const newRowHeights = Object.fromEntries(
          Object.entries(prev[rowKey]).filter(([key]) => key !== colKey)
        );
        return Object.keys(newRowHeights).length === 0
          ? { ...prev, [rowKey]: {} }
          : { ...prev, [rowKey]: newRowHeights };
      });
    }

    if (
      dragInfo.type === "item" &&
      dragInfo.row &&
      dragInfo.column &&
      dragInfo.item
    ) {
      setData((prev) =>
        updateColumnItems(prev, dragInfo.row, dragInfo.column, (items) => {
          return items.filter((i) => i.id !== dragInfo.item.id);
        })
      );
    }

    resetDragState();
  };

  return (
    <div className="flex gap-4 p-4 min-h-screen w-full bg-gray-50 font-sans">
      {/* Sidebar */}
      <div className="w-[220px] border border-gray-300 p-3 bg-white shadow-xl rounded-lg sticky top-4 h-full flex flex-col justify-between">
        <div className="">
          <h3 className="font-extrabold text-base mb-4 text-blue-700 border-b border-blue-200 pb-2">
            Components
          </h3>

          {/* Row Components */}
          <h4 className="font-bold mb-2 mt-4 text-gray-600 uppercase tracking-wider text-xs">
            Layout
          </h4>
          {sidebar.rows.map((r) => (
            <div
              key={r}
              draggable
              onDragStart={(e) => onDragStart(e, "newRow", r)}
              className="p-3 mb-2 border border-blue-500 bg-blue-100 cursor-grab rounded-lg shadow-md hover:bg-blue-200 transition-all text-sm font-semibold text-blue-800 flex items-center gap-2"
            >
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
              New Row
            </div>
          ))}

          {/* Column Components */}
          <h4 className="font-bold mb-2 mt-4 text-gray-600 uppercase tracking-wider text-xs">
            Structure
          </h4>
          {sidebar.columns.map((c) => (
            <div
              key={c}
              draggable
              onDragStart={(e) => onDragStart(e, "newColumn", null, c)}
              className="p-3 mb-2 border border-green-500 bg-green-100 cursor-grab rounded-lg shadow-md hover:bg-green-200 transition-all text-sm font-semibold text-green-800 flex items-center gap-2"
            >
              <svg
                className="w-5 h-5 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                ></path>
              </svg>
              New Column
            </div>
          ))}

          {/* Content Components */}
          <h4 className="font-bold mb-2 mt-4 text-gray-600 uppercase tracking-wider text-xs">
            Elements
          </h4>
          {sidebar.items.map((i, index) => (
            <div
              key={index}
              draggable
              onDragStart={(e) => onDragStart(e, "newItem", null, null, i)}
              className="p-3 mb-2 border border-purple-500 bg-purple-100 cursor-grab rounded-lg shadow-md hover:bg-purple-200 transition-all"
            >
              {renderItem(i)}
            </div>
          ))}
        </div>
        <div className="">
{/* Branding Section */}
<div className="mt-8 pt-4 border-t border-gray-200 text-left">
    <p className="text-xs text-gray-500 mb-2">Built by</p>
    <p className="font-semibold text-sm text-gray-800">Atiqur Rahman Akash</p>
    <div className="flex gap-3 mt-3">
        <a 
            href="https://github.com/arakash-developer/Roxnor-React-Home-Task" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-blue-600 transition"
            title="GitHub Profile"
        >
            <svg 
                className="w-5 h-5" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.6.111.82-.257.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.2 3.82 17.5 3.82 17.5c-1.087-.744.084-.73.084-.73 1.205.084 1.838 1.238 1.838 1.238 1.07 1.835 2.809 1.305 3.493.996.108-.775.419-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.221-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.404 1.02.005 2.04.137 3 .404 2.295-1.552 3.3-1.23 3.3-1.23.645 1.653.24 2.873.105 3.176.77.84 1.235 1.911 1.235 3.221 0 4.61-2.802 5.624-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.895-.015 3.28 0 .319.21.69.825.575C20.565 21.79 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
        </a>
        <a 
            href="https://www.linkedin.com/in/arakashdeveloper/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-blue-600 transition"
            title="LinkedIn Profile"
        >
            <svg 
                className="w-5 h-5" 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.136-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.355 7 3.994v5.241z"/>
            </svg>
        </a>
    </div>
</div>



        </div>
      </div>

      {/* Main Drag & Drop Canvas */}
      <div
        className="flex-1 min-h-[calc(100vh-32px)]"
        onDragOver={onDragOver}
        onDrop={onDropRow}
      >
        <div className="p-5 bg-white rounded-lg shadow-xl border border-gray-200 min-h-full">
          <h2 className="text-xl font-bold mb-5 text-gray-800 border-b pb-2">
            Layout Builder Canvas
          </h2>

          {Object.entries(data).map(([rowKey, columns]) => (
            <div key={rowKey}>
              {/* Row Drop Indicator (Before) */}
              {rowDropIndicator.show &&
                rowDropIndicator.position === "before" &&
                rowDropIndicator.rowKey === rowKey && (
                  <div className="h-3 my-2 bg-yellow-500 rounded-md animate-pulse"></div>
                )}

              <div
                onDragOver={(e) => onDragOverRow(e, rowKey)}
                onDrop={(e) => onDropOnRow(e, rowKey)}
                className={`border border-gray-300 p-4 mb-4 bg-gray-50 rounded-xl transition-all shadow-md
                  ${
                    dragInfo.type === "row" && dragInfo.row === rowKey
                      ? "ring-2 ring-blue-300 shadow-lg"
                      : "hover:border-blue-400"
                  }`}
              >
                <div className="flex justify-between items-center mb-3 border-b border-gray-300 pb-2">
                  <h3 className="font-semibold text-base text-gray-700">
                    {rowKey}
                  </h3>

                  {/* Row Drag Handle */}
                  <button
                    draggable
                    onDragStart={(e) => onDragStart(e, "row", rowKey)}
                    className="p-2 cursor-grab bg-blue-200 rounded-md hover:bg-blue-300 transition text-blue-700"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6h16M4 12h16M4 18h16"
                      ></path>
                    </svg>
                  </button>
                </div>

                {/* Columns Container */}
                <div className="flex gap-3 items-stretch">
                  {Object.entries(columns).map(([colKey, items]) => (
                    <div key={colKey} className="flex-1 flex">
                      {/* Column Drop Indicator (Before) */}
                      {columnDropIndicator.show &&
                        columnDropIndicator.position === "before" &&
                        columnDropIndicator.columnKey === colKey &&
                        columnDropIndicator.rowKey === rowKey && (
                          <div className="w-3 mx-1 bg-green-500 rounded-md animate-pulse"></div>
                        )}

                      <div
                        onDragOver={(e) => onDragOverColumn(e, rowKey, colKey)}
                        onDrop={(e) => onDropColumn(e, rowKey, colKey)}
                        className={`flex-1 border-2 border-dashed p-3 bg-white rounded-lg transition relative flex flex-col
                          ${
                            (dragInfo.type === "column" ||
                              dragInfo.type === "newColumn") &&
                            columnDropIndicator.columnKey === colKey
                              ? "border-green-600 ring-2 ring-green-300 shadow-inner"
                              : "border-gray-300 hover:border-green-500"
                          }`}
                        style={{
                          height:
                            columnHeights[rowKey]?.[colKey] ||
                            MIN_COLUMN_HEIGHT,
                        }}
                      >
                        <div className="flex justify-between items-center mb-3 pb-1 border-b border-gray-200 flex-shrink-0">
                          <h4 className="font-medium text-sm text-gray-600">
                            {colKey}
                          </h4>

                          {/* Column Drag Handle */}
                          <button
                            draggable
                            onDragStart={(e) =>
                              onDragStart(e, "column", rowKey, colKey)
                            }
                            className="p-1 cursor-grab hover:bg-gray-100 rounded-md transition text-gray-500 hover:text-green-600"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 8h16M4 16h16"
                              ></path>
                            </svg>
                          </button>
                        </div>

                        {/* Items Container */}
                        <div className="space-y-3 overflow-y-auto flex-grow pr-1">
                          {items.map((item) => (
                            <div key={item.id || item}>
                              {/* Item Drop Indicator (Before) */}
                              {itemDropIndicator.show &&
                                itemDropIndicator.position === "before" &&
                                itemDropIndicator.itemId === item.id && (
                                  <div className="h-1.5 bg-purple-500 mb-1 rounded-sm animate-pulse"></div>
                                )}
                              <div
                                onDragOver={(e) =>
                                  onDragOverItem(e, item, rowKey, colKey)
                                }
                                className={`p-2 border border-gray-400 bg-white rounded-md transition-all shadow-sm flex items-start gap-2
                                    hover:shadow-md duration-100 ease-out
                                    ${
                                      (dragInfo.type === "item" ||
                                        dragInfo.type === "newItem") &&
                                      itemDropIndicator.itemId === item.id
                                        ? "ring-2 ring-purple-500"
                                        : ""
                                    }`}
                              >
                                {/* Item Drag Handle */}
                                <button
                                  draggable
                                  onDragStart={(e) =>
                                    onDragStart(e, "item", rowKey, colKey, item)
                                  }
                                  className="p-1 mt-0.5 cursor-grab text-gray-500 hover:text-purple-600 transition rounded-sm"
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M4 7h16M4 12h16m-7 5h7"
                                    ></path>
                                  </svg>
                                </button>
                                <div className="flex-1">{renderItem(item)}</div>
                              </div>
                              {/* Item Drop Indicator (After) */}
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
                          title="Resize Column Vertically"
                          className={`absolute bottom-0 left-0 right-0 h-[5px] bg-gray-300 border-t border-gray-200 
                                        hover:h-[5px] hover:bg-blue-500 cursor-ns-resize rounded-b-lg transition-all 
                                        duration-150 ease-in-out ${
                                          isResizing
                                            ? "bg-blue-600 h-[5px] shadow-md"
                                            : "shadow-sm"
                                        }`}
                        ></div>
                      </div>

                      {/* Column Drop Indicator (After) */}
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

              {/* Row Drop Indicator (After) */}
              {rowDropIndicator.show &&
                rowDropIndicator.position === "after" &&
                rowDropIndicator.rowKey === rowKey && (
                  <div className="h-3 my-2 bg-yellow-500 rounded-md animate-pulse"></div>
                )}
            </div>
          ))}

          {/* JSON and Trash */}
          <div className="flex gap-5 mt-5 pt-5 border-t border-gray-200">
            {/* 1. Live Data Display (JSON) */}
            <div className="w-2/3 p-4 bg-blue-50 rounded-lg shadow-inner border border-blue-300">
              <h3 className="text-sm font-bold mb-3 text-blue-700 border-b border-blue-200 pb-1.5">
                Live Data State (JSON)
              </h3>
              <pre className="text-xs text-gray-800 overflow-x-auto p-3 bg-white rounded-md border border-gray-200 shadow-sm max-h-56">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>

            {/* 2. Trash Area */}
            <div
              className="w-1/3 flex items-center justify-center p-4 border-2 border-red-500 border-dashed bg-red-100 rounded-lg text-center cursor-pointer hover:bg-red-200 transition shadow-md hover:shadow-lg"
              onDragOver={onDragOver}
              onDrop={onDropToTrash}
            >
              <div className="p-1">
                <span className="font-bold text-red-800 text-base flex items-center justify-center gap-2">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    ></path>
                  </svg>
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
