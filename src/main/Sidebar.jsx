const Sidebar = () => {
  return (
    <>
      {/* Sidebar */}
      <div className="w-72 bg-gradient-to-b from-indigo-900 to-purple-900 p-8 shadow-2xl flex flex-col h-screen sticky top-0">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Components</h2>
          <div className="h-1 w-12 bg-gradient-to-r from-indigo-400 to-purple-400 rounded"></div>
        </div>

        <nav className="space-y-3 flex-1">
          <button className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-lg shadow-lg font-semibold transition duration-300 transform hover:scale-105 active:scale-95 text-left pl-4">
            Row
          </button>
          <button className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition duration-300 transform hover:scale-105 active:scale-95 text-left pl-4 border border-white/20">
            Column
          </button>
          <button className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition duration-300 transform hover:scale-105 active:scale-95 text-left pl-4 border border-white/20">
            Demo Item
          </button>
          <button className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition duration-300 transform hover:scale-105 active:scale-95 text-left pl-4 border border-white/20">
            Image
          </button>
          <button className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition duration-300 transform hover:scale-105 active:scale-95 text-left pl-4 border border-white/20">
            Input
          </button>
        </nav>

        <div className="pt-6 border-t border-white/20">
          <p className="text-white/60 text-xs font-medium">Build your layout</p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
