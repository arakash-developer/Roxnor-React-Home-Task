export default function Sidebar() {
  const items = ["row", "column", "demo item", "image", "input"];

  return (
    <div className="w-56 bg-gray-200 p-4 shadow-inner h-screen sticky top-0">
      <h2 className="text-xl font-bold mb-4 text-center">Sidebar</h2>

      <div className="space-y-3">
        {items.map((item) => (
          <button
            key={item}
            className="w-full px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md shadow-sm"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
