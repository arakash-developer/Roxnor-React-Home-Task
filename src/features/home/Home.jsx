const Home = () => {
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
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

      {/* Main Area */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-2">
              Layout Builder
            </h1>
            <p className="text-gray-600 font-medium">
              Design and organize your components
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-10 border border-slate-200">
            {/* Row 0 */}
            <div className="border-2 border-indigo-200 rounded-2xl p-8 mb-12 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg hover:shadow-xl transition duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-gradient-to-b from-indigo-600 to-purple-600 rounded"></div>
                <p className="text-lg font-bold text-indigo-900">Row 0</p>
              </div>
              <div className="border-2 border-indigo-200 rounded-xl p-6 bg-white shadow-md hover:shadow-lg transition duration-300 border-l-4 border-l-indigo-600">
                <p className="text-gray-800 font-semibold text-base">
                  Column 0
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Primary content area
                </p>
              </div>
            </div>

            {/* Row 1 */}
            <div className="border-2 border-purple-200 rounded-2xl p-8 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg hover:shadow-xl transition duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-6 bg-gradient-to-b from-purple-600 to-pink-600 rounded"></div>
                <p className="text-lg font-bold text-purple-900">Row 1</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Column 0 */}
                <div className="border-2 border-purple-200 rounded-2xl p-8 shadow-md bg-white hover:shadow-xl transition duration-300">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-1 h-5 bg-purple-600 rounded"></div>
                    <p className="text-purple-900 font-bold text-lg">
                      Column 0
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="border-l-4 border-l-indigo-500 border border-indigo-100 rounded-lg p-5 bg-gradient-to-br from-indigo-50 to-blue-50 shadow-sm hover:shadow-md transition duration-300">
                      <p className="font-semibold text-indigo-900">
                        Component 0
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        Input field element
                      </p>
                    </div>

                    <div className="border-l-4 border-l-purple-500 border border-purple-100 rounded-lg p-5 bg-gradient-to-br from-purple-50 to-pink-50 shadow-sm hover:shadow-md transition duration-300">
                      <p className="font-semibold text-purple-900">
                        Component 1
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        Image display element
                      </p>
                    </div>
                  </div>
                </div>

                {/* Column 1 */}
                <div className="border-2 border-pink-200 rounded-2xl p-8 shadow-md bg-white hover:shadow-xl transition duration-300">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-1 h-5 bg-pink-600 rounded"></div>
                    <p className="text-pink-900 font-bold text-lg">Column 1</p>
                  </div>
                  <div className="border-l-4 border-l-pink-500 border border-pink-100 rounded-lg p-5 bg-gradient-to-br from-pink-50 to-rose-50 shadow-sm hover:shadow-md transition duration-300">
                    <p className="font-semibold text-pink-900">rWGSOvT1</p>
                    <p className="text-gray-500 text-sm mt-1">
                      Media content block
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trash Box */}
          <div className="w-full flex justify-center mt-12">
            <div className="h-32 w-32 border-3 border-dashed border-red-400 rounded-2xl bg-gradient-to-br from-red-50 to-pink-50 flex flex-col items-center justify-center text-red-700 font-bold shadow-lg hover:shadow-xl hover:scale-105 transition duration-300 cursor-pointer group">
              <svg
                className="w-10 h-10 mb-2 group-hover:scale-110 transition"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              <span className="text-sm">TRASH</span>
            </div>
          </div>

          <p className="text-center mt-6 text-gray-500 text-sm font-medium">
            📋 Sample layout structure — Drag components to organize
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
