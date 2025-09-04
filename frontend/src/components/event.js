import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Loading from './Loading';

export default function Event() {
  const [eventsData, setEventsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventsData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/events');
        if (!response.ok) {
          throw new Error('Failed to fetch events data');
        }
        const data = await response.json();
        setEventsData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEventsData();
  }, []);

  if (loading) return <Loading message="Loading events..." />;
  if (error) return <div className="text-center py-20 text-red-500">Error: {error}</div>;

  return (
    <div>
      <section id="events" className="py-20 bg-gray-900 bg-opacity-80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Upcoming Events</h2>
            <p className="text-xl text-gray-300">Join us for exciting tech events and learning opportunities.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {eventsData.length > 0 ? (
              eventsData.map((event) => (
                <div key={event._id} className="card-hover bg-gray-800 bg-opacity-80 rounded-xl shadow-md overflow-hidden backdrop-blur-sm">
                  {event.image ? (
                    <img
                      src={event.image.startsWith('http') ? event.image : `http://localhost:5000${event.image}`}
                      alt={event.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`bg-gradient-to-r from-blue-500 to-purple-600 h-48 flex items-center justify-center ${event.image ? 'hidden' : ''}`}>
                    <span className="text-6xl">💻</span>
                  </div>
                  <div className="p-6">
                    <div className="text-sm text-blue-400 font-semibold mb-2">
                      {new Date(event.date).toLocaleDateString()}
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white">{event.title}</h3>
                    <p className="text-gray-300 mb-4">{event.description || 'Join us for this exciting event!'}</p>
                    <p className="text-sm text-gray-400 mb-4">Location: {event.location}</p>
                    <Link
                      to={`/event/${event._id}`}
                      className="text-blue-400 font-semibold hover:text-blue-300 transition-colors"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-gray-400">No upcoming events scheduled.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
