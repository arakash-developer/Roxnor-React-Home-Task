const Sidebar = ({ onClose }) => {
  return (
    <>
      {/* Sidebar */}
      <div className="w-full bg-gradient-to-b from-indigo-900 to-purple-900 p-2 sm:p-3 md:p-4 lg:p-7 xl:p-8 shadow-xl lg:shadow-2xl flex flex-col h-screen overflow-y-auto">
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="md:hidden absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-lg transition"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="mb-2 sm:mb-2.5 md:mb-3 lg:mb-6 flex-shrink-0">
          <h2 className="text-lg sm:text-lg md:text-xl lg:text-3xl font-bold text-white mb-1 lg:mb-2">
            Components
          </h2>
          <div className="h-1 w-6 sm:w-8 md:w-10 lg:w-16 bg-gradient-to-r from-indigo-400 to-purple-400 rounded"></div>
        </div>

        <nav className="space-y-1 sm:space-y-1.5 md:space-y-1.5 lg:space-y-3 flex-1 flex-shrink-0">
          <button className="w-full px-2 sm:px-3 md:px-4 lg:px-6 py-1 sm:py-1.5 md:py-1.5 lg:py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-md lg:rounded-lg shadow-md lg:shadow-lg font-semibold transition duration-300 transform hover:scale-105 active:scale-95 text-left pl-2 sm:pl-2 md:pl-3 lg:pl-4 text-xs sm:text-xs md:text-sm lg:text-base">
            Row
          </button>
          <button className="w-full px-2 sm:px-3 md:px-4 lg:px-6 py-1 sm:py-1.5 md:py-1.5 lg:py-3 bg-white/10 hover:bg-white/20 text-white rounded-md lg:rounded-lg font-semibold transition duration-300 transform hover:scale-105 active:scale-95 text-left pl-2 sm:pl-2 md:pl-3 lg:pl-4 border border-white/20 text-xs sm:text-xs md:text-sm lg:text-base">
            Column
          </button>
          <button className="w-full px-2 sm:px-3 md:px-4 lg:px-6 py-1 sm:py-1.5 md:py-1.5 lg:py-3 bg-white/10 hover:bg-white/20 text-white rounded-md lg:rounded-lg font-semibold transition duration-300 transform hover:scale-105 active:scale-95 text-left pl-2 sm:pl-2 md:pl-3 lg:pl-4 border border-white/20 text-xs sm:text-xs md:text-sm lg:text-base">
            Demo Item
          </button>
          <button className="w-full px-2 sm:px-3 md:px-4 lg:px-6 py-1 sm:py-1.5 md:py-1.5 lg:py-3 bg-white/10 hover:bg-white/20 text-white rounded-md lg:rounded-lg font-semibold transition duration-300 transform hover:scale-105 active:scale-95 text-left pl-2 sm:pl-2 md:pl-3 lg:pl-4 border border-white/20 text-xs sm:text-xs md:text-sm lg:text-base">
            Image
          </button>
          <button className="w-full px-2 sm:px-3 md:px-4 lg:px-6 py-1 sm:py-1.5 md:py-1.5 lg:py-3 bg-white/10 hover:bg-white/20 text-white rounded-md lg:rounded-lg font-semibold transition duration-300 transform hover:scale-105 active:scale-95 text-left pl-2 sm:pl-2 md:pl-3 lg:pl-4 border border-white/20 text-xs sm:text-xs md:text-sm lg:text-base">
            Input
          </button>
        </nav>

        <div className="pt-2 sm:pt-2.5 md:pt-3 lg:pt-6 border-t border-white/20 flex-shrink-0">
          <p className="text-white/60 text-xs lg:text-sm font-medium">
            Build your layout
          </p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
