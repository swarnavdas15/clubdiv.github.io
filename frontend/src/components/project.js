import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Loading from './Loading';

export default function Project() {
  const [projectsData, setProjectsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else if (diffDays <= 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else if (diffDays <= 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  };

  const fetchProjectsData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects data');
      }
      const data = await response.json();
      setProjectsData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectsData();

    // Set up polling to refresh data every 30 seconds
    const interval = setInterval(fetchProjectsData, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) return <Loading message="Loading projects..." />;
  if (error) return <div className="text-center py-20 text-red-500">Error: {error}</div>;

  return (
    <div>
      <section id="projects" className="py-20 bg-gray-900 bg-opacity-80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Featured Projects</h2>
            <p className="text-xl text-gray-300">Discover amazing projects built by our community members.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {projectsData.length > 0 ? (
              projectsData.map((project) => (
                <div key={project._id} className="card-hover bg-gray-800 bg-opacity-80 rounded-xl shadow-md overflow-hidden backdrop-blur-sm min-h-[500px] flex flex-col">
                  {project.imageUrl ? (
                    <div className="h-48 overflow-hidden flex-shrink-0">
                      <img
                        src={`http://localhost:5000${project.imageUrl}`}
                        alt={project.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-48 flex items-center justify-center" style={{ display: 'none' }}>
                        <span className="text-6xl text-white">🌐</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-48 flex items-center justify-center flex-shrink-0">
                      <span className="text-6xl text-white">🌐</span>
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center text-sm text-blue-400 font-semibold mb-2 group cursor-help">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="relative">
                        {project.date ? formatDate(project.date) : 'Date not specified'}
                        {project.date && (
                          <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 border border-gray-700">
                            {new Date(project.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                            <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                          </div>
                        )}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-white">{project.title}</h3>
                    <p className="text-gray-300 mb-4 flex-1">{project.description || "An innovative project built with modern technologies."}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies && project.technologies.map((tech, index) => (
                        <span key={index} className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="mt-auto">
                      <Link
                        to={`/project/${project._id}`}
                        className="inline-flex items-center text-blue-400 font-semibold hover:text-blue-300 transition-colors"
                      >
                        View Project
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-8">
                <p className="text-gray-400">No projects available yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
