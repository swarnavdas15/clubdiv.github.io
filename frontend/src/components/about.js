import React, { useState, useEffect } from 'react';
import Loading from './Loading';

export default function About() {
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/about');
        if (!response.ok) {
          throw new Error('Failed to fetch about data');
        }
        const data = await response.json();
        setAboutData(data[0]); // Assuming we get an array with one about object
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  if (loading) return <Loading message="Loading about content..." />;
  if (error) return <div className="text-center py-20 text-red-500">Error: {error}</div>;

  return (
    <div>
      <section id="about" className="py-20 bg-gray-900 bg-opacity-80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              {aboutData?.title || "About <div>"}
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {aboutData?.description || "We're a vibrant community of tech enthusiasts dedicated to learning, building, and innovating together."}
            </p>
          </div>
          
          <div className="space-y-8">
            {/* First row with three cards */}
            <div className="grid md:grid-cols-3 gap-8">
              {aboutData?.cards && aboutData.cards.length > 0 ? (
                <>
                  {aboutData.cards.slice(0, 3).map((card, index) => (
                    <div key={index} className="card-hover bg-gray-800 bg-opacity-80 p-8 rounded-xl text-center backdrop-blur-sm">
                      <div className="text-4xl mb-4">{card.icon}</div>
                      <h3 className="text-xl font-semibold mb-4 text-white">{card.title}</h3>
                      <p className="text-gray-300">{card.description}</p>
                    </div>
                  ))}
                  {aboutData.cards.length > 3 && (
                    <div className="card-hover bg-gray-800 bg-opacity-80 p-8 rounded-xl text-center backdrop-blur-sm md:col-span-3 lg:col-span-1">
                      <div className="text-4xl mb-4">{aboutData.cards[3].icon}</div>
                      <h3 className="text-xl font-semibold mb-4 text-white">{aboutData.cards[3].title}</h3>
                      <p className="text-gray-300">{aboutData.cards[3].description}</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="card-hover bg-gray-800 bg-opacity-80 p-8 rounded-xl text-center backdrop-blur-sm">
                    <div className="text-4xl mb-4">🚀</div>
                    <h3 className="text-xl font-semibold mb-4 text-white">Innovation</h3>
                    <p className="text-gray-300">Pushing boundaries with cutting-edge technology and creative solutions.</p>
                  </div>

                  <div className="card-hover bg-gray-800 bg-opacity-80 p-8 rounded-xl text-center backdrop-blur-sm">
                    <div className="text-4xl mb-4">🤝</div>
                    <h3 className="text-xl font-semibold mb-4 text-white">Community</h3>
                    <p className="text-gray-300">Building lasting connections with like-minded tech enthusiasts.</p>
                  </div>

                  <div className="card-hover bg-gray-800 bg-opacity-80 p-8 rounded-xl text-center backdrop-blur-sm">
                    <div className="text-4xl mb-4">📚</div>
                    <h3 className="text-xl font-semibold mb-4 text-white">Learning</h3>
                    <p className="text-gray-300">Continuous growth through workshops, hackathons, and peer learning.</p>
                  </div>
                </>
              )}
            </div>

            {/* Second row with "Why Join DIV?" card */}
            <div className="flex justify-center">
              <div className="card-hover bg-gradient-to-r from-blue-600 to-slate-800 bg-opacity-80 p-8 rounded-xl text-center backdrop-blur-sm max-w-3xl w-full">
                <div className="text-4xl mb-4">🛠️</div>
                <h3 className="text-xl font-semibold mb-4 text-white">Why Join DIV?</h3>
                <p className="text-gray-100 text-ellipsis">Learn new skills & emerging technologies.<br/>Collaborate with like-minded peers. <br/>Showcase your talent on big platforms .<br/>Be part of a community that drives innovation.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
