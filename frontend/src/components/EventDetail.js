import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Loading from './Loading';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/events/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch event details');
        }
        const data = await response.json();
        setEvent(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) return <Loading message="Loading event details..." />;
  if (error) return (
    <div className="py-20 bg-gray-900 bg-opacity-80 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Error</h2>
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => navigate('/event')}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Back to Events
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="py-20 bg-gray-900 bg-opacity-80 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/event')}
          className="mb-6 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Events</span>
        </button>

        {/* Event Header */}
        <div className="bg-gray-800 bg-opacity-80 rounded-xl shadow-md overflow-hidden backdrop-blur-sm mb-8">
                  {event.image ? (
                    <img
                      src={event.image.startsWith('http') ? event.image : `http://localhost:5000${event.image}`}
                      alt={event.title}
                      className="w-full h-64 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
          <div className={`bg-gradient-to-r from-blue-500 to-purple-600 h-64 flex items-center justify-center ${event.image ? 'hidden' : ''}`}>
            <span className="text-8xl">💻</span>
          </div>
          <div className="p-8">
            <h1 className="text-4xl font-bold text-white mb-4">{event.title}</h1>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Date & Time</h3>
                <p className="text-gray-300 text-lg">
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-gray-400">
                  {new Date(event.date).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Location</h3>
                <p className="text-gray-300 text-lg">{event.location}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Event Description */}
        <div className="bg-gray-800 bg-opacity-80 rounded-xl shadow-md overflow-hidden backdrop-blur-sm mb-8">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-white mb-4">About This Event</h2>
            <div className="prose prose-lg text-gray-200 max-w-none">
              <p className="text-lg leading-relaxed">
                {event.description || 'Join us for this exciting tech event! We\'ll be exploring the latest trends and technologies in the industry.'}
              </p>
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-800 bg-opacity-80 rounded-xl shadow-md overflow-hidden backdrop-blur-sm p-6">
            <h3 className="text-xl font-bold text-white mb-4">What to Expect</h3>
            {event.whatToExpect && event.whatToExpect.length > 0 ? (
              <ul className="space-y-3 text-gray-300">
                {event.whatToExpect.map((item, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start space-x-3">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Interactive sessions with industry experts</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Networking opportunities with fellow tech enthusiasts</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Hands-on workshops and demonstrations</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-blue-400 mt-1">•</span>
                  <span>Refreshments and snacks provided</span>
                </li>
              </ul>
            )}
          </div>

          <div className="bg-gray-800 bg-opacity-80 rounded-xl shadow-md overflow-hidden backdrop-blur-sm p-6">
            <h3 className="text-xl font-bold text-white mb-4">Event Information</h3>
            <div className="space-y-4">
              {event.registrationInfo ? (
                <div className="text-gray-300">
                  <p className="text-sm text-gray-400 mb-2">Registration Details</p>
                  <p className="leading-relaxed">{event.registrationInfo}</p>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-sm text-gray-400">Event Type</p>
                    <p className="text-gray-300 font-medium">Tech Conference</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Target Audience</p>
                    <p className="text-gray-300 font-medium">Developers, Students, Tech Enthusiasts</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Duration</p>
                    <p className="text-gray-300 font-medium">Full Day Event</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Registration</p>
                    <p className="text-gray-300 font-medium">Free (Limited Seats)</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Registration Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-md overflow-hidden backdrop-blur-sm p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Join Us?</h2>
          <p className="text-xl text-blue-100 mb-6">
            Don't miss out on this amazing opportunity to learn and connect with fellow tech enthusiasts!
          </p>
          <button className="px-8 py-4 bg-white text-blue-600 font-bold text-lg rounded-lg hover:bg-gray-100 transition-colors transform hover:scale-105">
            Register Now
          </button>
          <p className="text-blue-200 mt-4 text-sm">
            Registration is free and opens 24 hours before the event
          </p>
        </div>

        {/* Share Event */}
        <div className="mt-8 text-center">
          <h3 className="text-white text-lg font-semibold mb-4">Share this event:</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => {
                const shareUrl = encodeURIComponent(window.location.href);
                const shareText = encodeURIComponent(`Check out this event: ${event.title}`);
                window.open(`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`, '_blank');
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              <span>Twitter</span>
            </button>

            <button
              onClick={() => {
                const shareUrl = encodeURIComponent(window.location.href);
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank');
              }}
              className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Facebook</span>
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                  .then(() => alert('Event link copied to clipboard!'))
                  .catch(() => alert('Failed to copy link. Please copy manually.'));
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy Link</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
