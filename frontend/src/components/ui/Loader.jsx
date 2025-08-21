import React from "react";

const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center space-y-4">
        {/* Spinner */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-b-transparent animate-spin"></div>
          <div className="absolute inset-2 bg-blue-100 rounded-full opacity-40 blur-sm animate-pulse"></div>
        </div>

        {/* Optional loading text */}
        <p className="text-sm text-gray-600 font-medium">{text}</p>
      </div>
    </div>
  );
};

export default Loader;
