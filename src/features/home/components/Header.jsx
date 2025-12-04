const Header = () => {
  return (
    <>
      {/* Header */}
      <div className="mb-1 xs:mb-1.5 sm:mb-2 md:mb-3 lg:mb-4">
        <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-0.5 lg:mb-1">
          Layout Builder
        </h1>
        <p className="text-gray-600 font-medium text-xs xs:text-xs sm:text-sm md:text-base">
          Design your components
        </p>
      </div>
    </>
  );
};

export default Header;
