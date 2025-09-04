import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function ErrorPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white p-6 relative overflow-hidden rounded-lg mx-4 my-8">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        <div
          className="absolute w-64 h-64 bg-purple-500 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{
            top: `${mousePosition.y * 20}%`,
            left: `${mousePosition.x * 20}%`,
            transform: `translate(-50%, -50%)`,
          }}
        />
        <div
          className="absolute w-48 h-48 bg-indigo-500 rounded-full opacity-15 blur-2xl animate-pulse"
          style={{
            top: `${mousePosition.y * 30 + 20}%`,
            right: `${mousePosition.x * 25}%`,
            animationDelay: '1s',
          }}
        />
        <div
          className="absolute w-40 h-40 bg-blue-500 rounded-full opacity-10 blur-2xl animate-pulse"
          style={{
            bottom: `${mousePosition.y * 25}%`,
            left: `${mousePosition.x * 30 + 10}%`,
            animationDelay: '2s',
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-lg">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 bg-white rounded-full opacity-30 animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        {/* Main 404 number with glow effect */}
        <div className="relative mb-8">
          <h1 className="text-8xl md:text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 animate-pulse">
            404
          </h1>
          <div className="absolute inset-0 text-8xl md:text-9xl font-extrabold text-purple-300 opacity-20 blur-sm animate-pulse">
            404
          </div>
        </div>

        {/* Error message */}
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
          Oops! Page Not Found
        </h2>

        <p className="text-lg md:text-xl max-w-2xl text-center mb-8 text-gray-300 leading-relaxed">
          The page you're looking for seems to have wandered off into the digital void.
          Don't worry, it happens to the best of us!
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link
            to="/"
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-indigo-500/25"
          >
            🏠 Go Back Home
          </Link>
          <Link
            to="/contact"
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-purple-500/25"
          >
            📞 Contact Support
          </Link>
        </div>

        {/* Fun illustration */}
        <div className="relative w-full max-w-lg mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-white/20">
            <div className="text-center">
              <div className="text-6xl mb-4">🚀</div>
              <p className="text-gray-300 text-sm">
                While you're here, why not explore our amazing community?
              </p>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-bounce"></div>
          <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-1/2 -right-6 w-4 h-4 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Quick navigation */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
          {[
            { to: '/about', label: 'About', icon: 'ℹ️' },
            { to: '/blog', label: 'Blog', icon: '📝' },
            { to: '/project', label: 'Projects', icon: '💻' },
            { to: '/contact', label: 'Contact', icon: '📧' },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg p-4 text-center transition-all duration-300 transform hover:scale-105 border border-white/10"
            >
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="text-sm font-medium text-white">{item.label}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
