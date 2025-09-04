import React from 'react'

import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full bg-gray-900 text-white py-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="logo">
                <img className="bg-cover" src="/div-logo.png" alt="club logo" />
              </span>
            </div>
            <span className="text-lg font-bold">Club &lt;div</span>
          </div>
          
          <div className="flex space-x-6">
            <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms</Link>
            <Link to="https://github.com/swarnavdas15/divvlub.github.io" className="text-gray-400 hover:text-white transition-colors">GitHub</Link>
            <Link to="https://www.linkedin.com/company/div-techclub" className="text-gray-400 hover:text-white transition-colors">LinkedIn</Link>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 Club &lt;div/&gt; . All rights reserved. Built with passion for innovation.</p>
        </div>
      </div>
    </footer>
  )
}
