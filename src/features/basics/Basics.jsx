import React, { useState } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { useSortable, SortableContext, verticalListSortingStrategy, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';

const FullDnDExample = () => {
  // Initial grid data
  const [gridData, setGridData] = useState([
    {
      id: 'row-1',
      columns: [
        { id: 'col-1', width: 200, items: [{ id: 'item-1', name: 'Item 1' }] },
        { id: 'col-2', width: 200, items: [{ id: 'item-2', name: 'Item 2' }] },
      ],
    },
  ]);

  const [selectedItem, setSelectedItem] = useState(null);

  // Drag end handler
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    // Remove item if dragged to trash
    if (over.id === 'trash') {
      setGridData((prev) =>
        prev.map((row) => ({
          ...row,
          columns: row.columns.map((col) => ({
            ...col,
            items: col.items.filter((item) => item.id !== active.id),
          })),
        }))
      );
      return;
    }

    // Example: simple reorder within same column (for simplicity)
    setGridData((prev) =>
      prev.map((row) => ({
        ...row,
        columns: row.columns.map((col) => {
          if (col.items.find((i) => i.id === active.id)) {
            // Reorder in same column
            const oldIndex = col.items.findIndex((i) => i.id === active.id);
            const newIndex = col.items.findIndex((i) => i.id === over.id);
            const newItems = [...col.items];
            newItems.splice(oldIndex, 1);
            newItems.splice(newIndex, 0, col.items[oldIndex]);
            return { ...col, items: newItems };
          }
          return col;
        }),
      }))
    );
  };

  // Add row
  const addRow = () => {
    const newRow = { id: `row-${Date.now()}`, columns: [] };
    setGridData((prev) => [...prev, newRow]);
  };

  // Add column to last row
  const addColumn = () => {
    const newCol = { id: `col-${Date.now()}`, width: 200, items: [] };
    setGridData((prev) => {
      const lastRow = prev[prev.length - 1];
      lastRow.columns.push(newCol);
      return [...prev];
    });
  };

  // Add item to first column
  const addItem = () => {
    const newItem = { id: `item-${Date.now()}`, name: `Item ${Date.now()}` };
    setGridData((prev) => {
      if (prev[0].columns[0]) prev[0].columns[0].items.push(newItem);
      return [...prev];
    });
  };

  // Sortable Item
  const SortableItem = ({ item }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      padding: '6px',
      margin: '4px',
      backgroundColor: '#f0f0f0',
      border: '1px solid #ccc',
      borderRadius: '4px',
      cursor: 'grab',
    };
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => setSelectedItem(item)}
      >
        {item.name}
      </div>
    );
  };

  // Sortable Column
  const SortableColumn = ({ col }) => (
    <ResizableBox
      width={col.width}
      height={300}
      axis="x"
      onResizeStop={(e, data) => {
        col.width = data.size.width;
        setGridData([...gridData]);
      }}
      minConstraints={[100, 100]}
      maxConstraints={[500, 1000]}
      className="p-2 border border-gray-300 m-1"
    >
      <SortableContext items={col.items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        {col.items.map((item) => (
          <SortableItem key={item.id} item={item} />
        ))}
      </SortableContext>
    </ResizableBox>
  );

  // Sortable Row
  const SortableRow = ({ row }) => (
    <div className="flex mb-4">
      <SortableContext items={row.columns.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
        {row.columns.map((col) => (
          <SortableColumn key={col.id} col={col} />
        ))}
      </SortableContext>
    </div>
  );

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">DnD Grid Example</h2>

      {/* Sidebar buttons */}
      <div className="flex gap-2 mb-4">
        <button onClick={addRow} className="p-2 bg-blue-500 text-white rounded">Add Row</button>
        <button onClick={addColumn} className="p-2 bg-green-500 text-white rounded">Add Column</button>
        <button onClick={addItem} className="p-2 bg-purple-500 text-white rounded">Add Item</button>
      </div>

      {/* Drag-and-drop grid */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {gridData.map((row) => (
          <SortableRow key={row.id} row={row} />
        ))}
      </DndContext>

      {/* Trash box */}
      <div
        id="trash"
        className="mt-4 p-4 bg-red-300 text-center rounded cursor-pointer"
      >
        Trash Box (Drag items here to remove)
      </div>

      {/* Modal */}
      {selectedItem && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-4 rounded">
            <h3 className="font-bold mb-2">Item Details</h3>
            <p>ID: {selectedItem.id}</p>
            <button
              className="mt-2 px-2 py-1 bg-red-500 text-white rounded"
              onClick={() => setSelectedItem(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* JSON Output */}
      <textarea
        className="mt-4 w-full h-40 border p-2"
        readOnly
        value={JSON.stringify(gridData, null, 2)}
      />
    </div>
  );
};

export default FullDnDExample;
