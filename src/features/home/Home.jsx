import Header from "@features/home/components/Header";

const Home = () => {
  return (
    // {/* Main Area */}
    <div className="flex-1 p-1 xs:p-1.5 sm:p-2 md:p-3 lg:p-5 xl:p-8 overflow-hidden flex flex-col mt-12 md:mt-0">
      <div className="flex-1 overflow-y-auto">
        <Header />

        <div className="bg-white rounded-lg xs:rounded-xl sm:rounded-2xl md:rounded-2xl lg:rounded-3xl shadow-md sm:shadow-lg md:shadow-xl lg:shadow-2xl p-1.5 xs:p-2 sm:p-2.5 md:p-4 lg:p-6 border border-slate-200">
          {/* Row 0 */}
          <div className="border-2 border-indigo-200 rounded-lg xs:rounded-lg sm:rounded-xl md:rounded-2xl p-1.5 xs:p-2 sm:p-2.5 md:p-3 lg:p-5 mb-1.5 xs:mb-2 sm:mb-2.5 md:mb-3 lg:mb-6 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-sm sm:shadow-md hover:shadow-md sm:hover:shadow-lg transition duration-300">
            <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 md:gap-2 lg:gap-3 mb-1 xs:mb-1.5 sm:mb-2 md:mb-2.5 lg:mb-4">
              <div className="w-0.5 h-3 xs:h-3 sm:h-4 md:h-4 lg:h-6 bg-gradient-to-b from-indigo-600 to-purple-600 rounded"></div>
              <p className="text-xs xs:text-xs sm:text-sm md:text-base lg:text-lg font-bold text-indigo-900">
                Row 0
              </p>
            </div>
            <div className="border-2 border-indigo-200 rounded-md xs:rounded-lg sm:rounded-lg md:rounded-xl p-1 xs:p-1.5 sm:p-2 md:p-2.5 lg:p-4 bg-white shadow-sm hover:shadow-md transition duration-300 border-l-4 border-l-indigo-600">
              <p className="text-gray-800 font-semibold text-xs xs:text-xs sm:text-xs md:text-sm lg:text-base">
                Column 0
              </p>
              <p className="text-gray-500 text-xs sm:text-xs md:text-xs lg:text-sm mt-0.5">
                Primary content area
              </p>
            </div>
          </div>

          {/* Row 1 */}
          <div className="border-2 border-purple-200 rounded-lg xs:rounded-lg sm:rounded-xl md:rounded-2xl p-1.5 xs:p-2 sm:p-2.5 md:p-3 lg:p-5 bg-gradient-to-br from-purple-50 to-pink-50 shadow-sm sm:shadow-md hover:shadow-md sm:hover:shadow-lg transition duration-300">
            <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 md:gap-2 lg:gap-3 mb-1 xs:mb-1.5 sm:mb-2 md:mb-2.5 lg:mb-4">
              <div className="w-0.5 h-3 xs:h-3 sm:h-4 md:h-4 lg:h-6 bg-gradient-to-b from-purple-600 to-pink-600 rounded"></div>
              <p className="text-xs xs:text-xs sm:text-sm md:text-base lg:text-lg font-bold text-purple-900">
                Row 1
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3 lg:gap-5 xl:gap-6">
              {/* Column 0 */}
              <div className="border-2 border-purple-200 rounded-lg xs:rounded-lg sm:rounded-xl md:rounded-2xl p-1.5 xs:p-2 sm:p-2.5 md:p-3 lg:p-5 shadow-sm hover:shadow-sm sm:hover:shadow-md transition duration-300 bg-white">
                <div className="flex items-center gap-1 xs:gap-1.5 mb-1 xs:mb-1.5 sm:mb-2 md:mb-2 lg:mb-3">
                  <div className="w-0.5 h-3 xs:h-3 sm:h-3 md:h-4 lg:h-5 bg-purple-600 rounded"></div>
                  <p className="text-purple-900 font-bold text-xs xs:text-xs sm:text-xs md:text-sm lg:text-base">
                    Column 0
                  </p>
                </div>

                <div className="space-y-1 xs:space-y-1.5 sm:space-y-1.5 md:space-y-2 lg:space-y-3">
                  <div className="border-l-3 border-l-indigo-500 border border-indigo-100 rounded-sm xs:rounded-md sm:rounded-md p-1 xs:p-1.5 sm:p-2 md:p-2.5 lg:p-3 bg-gradient-to-br from-indigo-50 to-blue-50 shadow-sm hover:shadow-sm transition duration-300">
                    <p className="font-semibold text-indigo-900 text-xs xs:text-xs sm:text-xs md:text-sm lg:text-base">
                      Component 0
                    </p>
                    <p className="text-gray-500 text-xs sm:text-xs md:text-xs lg:text-sm mt-0.5">
                      Input field
                    </p>
                  </div>

                  <div className="border-l-3 border-l-purple-500 border border-purple-100 rounded-sm xs:rounded-md sm:rounded-md p-1 xs:p-1.5 sm:p-2 md:p-2.5 lg:p-3 bg-gradient-to-br from-purple-50 to-pink-50 shadow-sm hover:shadow-sm transition duration-300">
                    <p className="font-semibold text-purple-900 text-xs xs:text-xs sm:text-xs md:text-sm lg:text-base">
                      Component 1
                    </p>
                    <p className="text-gray-500 text-xs sm:text-xs md:text-xs lg:text-sm mt-0.5">
                      Image display
                    </p>
                  </div>
                </div>
              </div>

              {/* Column 1 */}
              <div className="border-2 border-pink-200 rounded-lg xs:rounded-lg sm:rounded-xl md:rounded-2xl p-1.5 xs:p-2 sm:p-2.5 md:p-3 lg:p-5 shadow-sm hover:shadow-sm sm:hover:shadow-md transition duration-300 bg-white">
                <div className="flex items-center gap-1 xs:gap-1.5 mb-1 xs:mb-1.5 sm:mb-2 md:mb-2 lg:mb-3">
                  <div className="w-0.5 h-3 xs:h-3 sm:h-3 md:h-4 lg:h-5 bg-pink-600 rounded"></div>
                  <p className="text-pink-900 font-bold text-xs xs:text-xs sm:text-xs md:text-sm lg:text-base">
                    Column 1
                  </p>
                </div>
                <div className="border-l-3 border-l-pink-500 border border-pink-100 rounded-sm xs:rounded-md sm:rounded-md p-1 xs:p-1.5 sm:p-2 md:p-2.5 lg:p-3 bg-gradient-to-br from-pink-50 to-rose-50 shadow-sm hover:shadow-sm transition duration-300">
                  <p className="font-semibold text-pink-900 text-xs xs:text-xs sm:text-xs md:text-sm lg:text-base">
                    rWGSOvT1
                  </p>
                  <p className="text-gray-500 text-xs sm:text-xs md:text-xs lg:text-sm mt-0.5">
                    Media block
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trash Box */}
      <div className="w-full flex flex-col items-center gap-1 xs:gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 py-1 xs:py-1 sm:py-1.5 md:py-2 lg:py-3 border-t border-gray-200 bg-white/50 flex-shrink-0">
        <div className="h-12 w-12 xs:h-14 xs:w-14 sm:h-16 sm:w-16 md:h-20 md:w-20 lg:h-28 lg:w-28 border border-dashed border-red-400 rounded-lg xs:rounded-lg sm:rounded-lg md:rounded-xl lg:rounded-2xl bg-gradient-to-br from-red-50 to-pink-50 flex flex-col items-center justify-center text-red-700 font-bold shadow-md hover:shadow-lg hover:scale-105 transition duration-300 cursor-pointer group">
          <svg
            className="w-3 xs:w-3.5 sm:w-4 md:w-6 lg:w-8 h-3 xs:h-3.5 sm:h-4 md:h-6 lg:h-8 mb-0.5 group-hover:scale-110 transition"
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
          <span className="text-xs xs:text-xs sm:text-xs md:text-xs lg:text-sm">
            TRASH
          </span>
        </div>

        <p className="text-center text-gray-500 text-xs sm:text-xs md:text-sm lg:text-sm font-medium px-1">
          📋 Layout
        </p>
      </div>
    </div>
  );
};

export default Home;
