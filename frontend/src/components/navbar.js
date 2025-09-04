import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DefaultAvatar from './DefaultAvatar';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, logout, isAuthenticated } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  }

  return (
    <div>
      <nav className="bg-gray-900 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="logo">
                  <img className="bg-cover" src="/div-logo.png" alt="club logo"/>
                </span>
              </div>
              <span className="text-xl font-bold text-white">club <span className='text-orange-600'>&lt;</span> div <span className='text-orange-600'>&gt;</span>
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8">
              <ul className="flex space-x-12">
                <Link to="/" className="nav-link text-white font-medium">Home</Link>
                <Link to="/about" className="nav-link text-white font-medium">About</Link>
                <Link to="/event" className="nav-link text-white font-medium">Events</Link>
                <Link to="/project" className="nav-link text-white font-medium">Projects</Link>
                <Link to="/blog" className="nav-link text-white font-medium">Blog</Link>
                <Link to="/contact" className="nav-link text-white font-medium">Contact</Link>
              </ul>
            </div>
            
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  {user && user.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      className="text-white hover:text-indigo-300 font-medium transition-colors"
                    >
                      Admin
                    </Link>
                  )}
                  <Link 
                    to="/dashboard" 
                    className="text-white hover:text-indigo-300 font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-white hover:text-indigo-300 font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-indigo-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Join Club
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {/* Hamburger icon */}
                {!isMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          <div className={`fixed inset-0 z-40 ${isMenuOpen ? 'block' : 'hidden'}`}>
            {/* Overlay */}
            <div 
              className={`fixed inset-0 bg-black bg-opacity-50 overlay ${isMenuOpen ? 'open' : ''}`}
              onClick={toggleMenu}
            />
            
            {/* Side Menu */}
            <div className={`fixed right-0 top-0 h-full w-64 bg-gray-800 shadow-lg side-menu ${isMenuOpen ? 'open' : ''}`}>
              <div className="px-4 pt-4 pb-3 space-y-1">
                {isAuthenticated && user && (
                  <div className="flex items-center space-x-3 mb-6 px-2 py-3 bg-gray-700 rounded-lg">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt="Profile"
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <DefaultAvatar className="w-12 h-12 rounded-full" />
                    )}
                    <div className="flex flex-col">
                      <span className="text-gray-200 font-semibold text-lg">
                        {user.firstName && user.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user.username || 'User'}
                      </span>
                      <span className="text-gray-400 text-sm truncate max-w-xs">{user.email}</span>
                    </div>
                  </div>
                )}
                <Link to="/" className="block px-3 py-2 text-gray-300 font-medium hover:text-blue-400" onClick={toggleMenu}>Home</Link>
                <Link to="/about" className="block px-3 py-2 text-gray-300 font-medium hover:text-blue-400" onClick={toggleMenu}>About</Link>
                <Link to="/event" className="block px-3 py-2 text-gray-300 font-medium hover:text-blue-400" onClick={toggleMenu}>Events</Link>
                <Link to="/project" className="block px-3 py-2 text-gray-300 font-medium hover:text-blue-400" onClick={toggleMenu}>Projects</Link>
                <Link to="/blog" className="block px-3 py-2 text-gray-300 font-medium hover:text-blue-400" onClick={toggleMenu}>Blog</Link>
                <Link to="/contact" className="block px-3 py-2 text-gray-300 font-medium hover:text-blue-400" onClick={toggleMenu}>Contact</Link>
                
                {isAuthenticated ? (
                  <>
                    {user && user.role === 'admin' && (
                      <Link to="/admin" className="block px-3 py-2 text-gray-300 font-medium hover:text-blue-400" onClick={toggleMenu}>
                        Admin Panel
                      </Link>
                    )}
                    <Link to="/dashboard" className="block px-3 py-2 text-gray-300 font-medium hover:text-blue-400" onClick={toggleMenu}>
                      Dashboard
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="block px-3 py-2 text-gray-300 font-medium hover:text-blue-400" onClick={toggleMenu}>
                      Login
                    </Link>
                    <Link to="/register" className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors text-center block" onClick={toggleMenu}>
                      Join Club
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}
