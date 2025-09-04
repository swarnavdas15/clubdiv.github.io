import React from 'react';
import './Loading.css';

const Loading = ({ message = "Loading awesome content..." }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-indigo-500 flex items-center justify-center">
      <div className="text-center">
        {/* Animated spinner */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="absolute inset-4 border-4 border-transparent border-b-purple-600 rounded-full animate-spin-reverse"></div>
          
          {/* Club logo in center */}
          <div className="absolute inset-4 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center p-1">
              <img 
                src="/div-logo.png" 
                alt="Club Logo" 
                className="w-10 h-10 object-contain"
              />
            </div>
          </div>
        </div>
        
        {/* Loading text with animation */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2 animate-pulse">
          {message}
        </h2>
        
        {/* Dots animation */}
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        
        {/* Subtle message */}
        <p className="text-gray-900 text-sm mt-4">
          Good things take time...
        </p>
      </div>
    </div>
  );
};

export default Loading;
