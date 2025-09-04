import React from 'react'
import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <div className='my-12 sm:my-16 md:my-20 lg:my-[5rem]'>
          <section id="home" className="bg-gray-800 bg-opacity-80 h-auto min-h-[30rem] text-white py-12 sm:py-16 md:py-20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl sm:text-5xl space-y-2 md:text-4xl font-bold mb-6">
               <span className ="text-blue-400 md:text-8xl">
                     We are  
                  <span className='sign-animation'> &lt;</span>div<span className='sign-animation'>&gt;</span>
                  </span>
                  <br />
                Innovation Starts <span className="pulse-animation">Here</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 text-indigo-100 max-w-3xl mx-auto">
                Join a community of passionate developers, designers, and tech enthusiasts building the future together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/register" 
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
                >
                  Get Started
                </Link>
                <Link 
                  to="/about" 
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors text-center"
                >
                  Learn More
                </Link>
            </div>
        </div>
    </section>
    </div>
  )
}
