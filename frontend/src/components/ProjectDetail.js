import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Loading from './Loading';

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchProjectDetail = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/projects/${id}?t=${Date.now()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch project details');
      }
      const data = await response.json();
      setProject(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProjectDetail();
    }
  }, [id, refreshKey]);

  // Add automatic polling to refresh project details every 30 seconds
  useEffect(() => {
    if (id) {
      const interval = setInterval(fetchProjectDetail, 30000);
      return () => clearInterval(interval);
    }
  }, [id]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading) return <Loading message="Loading project details..." />;
  if (error) return (
    <div className="min-h-screen bg-gray-900 bg-opacity-80 backdrop-blur-sm py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="bg-red-500 text-white p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Error Loading Project</h2>
            <p className="mb-6">{error}</p>
            <Link
              to="/project"
              className="bg-white text-red-500 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Back to Projects
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  if (!project) return (
    <div className="min-h-screen bg-gray-900 bg-opacity-80 backdrop-blur-sm py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="bg-gray-800 text-white p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
            <p className="mb-6">The project you're looking for doesn't exist.</p>
            <Link
              to="/project"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Back to Projects
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 bg-opacity-80 backdrop-blur-sm py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button and Refresh */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            to="/project"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Projects
          </Link>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Refreshing...' : 'Refresh Project'}
          </button>
        </div>

        {/* Project Header */}
        <div className="bg-gray-800 bg-opacity-80 rounded-xl shadow-lg overflow-hidden backdrop-blur-sm mb-8">
          {/* Project Image */}
          <div className="relative h-96 bg-gradient-to-r from-blue-500 to-purple-600">
            {project.imageUrl ? (
              <img
                src={project.imageUrl.startsWith('/uploads/') ? `http://localhost:5000${project.imageUrl}` : project.imageUrl}
                alt={project.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center" style={{ display: project.imageUrl ? 'none' : 'flex' }}>
              <span className="text-8xl text-white">🌐</span>
            </div>

            {/* Status Badge */}
            <div className="absolute top-6 right-6">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                project.status === 'active' ? 'bg-green-500 text-white' :
                project.status === 'completed' ? 'bg-blue-500 text-white' :
                'bg-yellow-500 text-white'
              }`}>
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Project Info */}
          <div className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-white mb-6">{project.title}</h1>

                {/* Redesigned Description Section */}
                <div className="bg-gray-700 bg-opacity-50 rounded-lg p-6 mb-6 border-l-4 border-blue-500">
                  <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Description
                  </h2>
                  <div className="text-gray-200 leading-relaxed">
                    {project.description && project.description.length > 200 ? (
                      <>
                        <p className={`text-lg ${!showFullDescription ? 'line-clamp-3' : ''}`}>
                          {showFullDescription ? project.description : `${project.description.substring(0, 200)}...`}
                        </p>
                        <button
                          onClick={() => setShowFullDescription(!showFullDescription)}
                          className="mt-3 text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200 flex items-center"
                        >
                          {showFullDescription ? (
                            <>
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                              Show Less
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                              Read More
                            </>
                          )}
                        </button>
                      </>
                    ) : (
                      <p className="text-lg">{project.description || "No description available."}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Technologies */}
            {project.technologies && project.technologies.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-4">Technologies Used</h3>
                <div className="flex flex-wrap gap-3">
                  {project.technologies.map((tech, index) => (
                    <span
                      key={index}
                      className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  View on GitHub
                </a>
              )}

              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Live Demo
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Project Details Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Project Overview */}
          <div className="bg-gray-800 bg-opacity-80 rounded-xl shadow-lg p-8 backdrop-blur-sm">
            <h3 className="text-2xl font-bold text-white mb-6">Project Overview</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-700">
                <span className="text-gray-300 font-medium">Status</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  project.status === 'active' ? 'bg-green-500 text-white' :
                  project.status === 'completed' ? 'bg-blue-500 text-white' :
                  'bg-yellow-500 text-white'
                }`}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
              </div>

              {project.author && (
                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-300 font-medium">Author</span>
                  <span className="text-white text-right">{project.author}</span>
                </div>
              )}

              <div className="flex justify-between items-center py-3 border-b border-gray-700">
                <span className="text-gray-300 font-medium">Technologies</span>
                <span className="text-white text-right">
                  {project.technologies ? project.technologies.length : 0} technologies
                </span>
              </div>

              {project.githubUrl && (
                <div className="flex justify-between items-center py-3 border-b border-gray-700">
                  <span className="text-gray-300 font-medium">Repository</span>
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    View Source
                  </a>
                </div>
              )}

              {project.liveUrl && (
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-300 font-medium">Live Demo</span>
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Visit Site
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Technologies Detail */}
          {project.technologies && project.technologies.length > 0 && (
            <div className="bg-gray-800 bg-opacity-80 rounded-xl shadow-lg p-8 backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-white mb-6">Technology Stack</h3>
              <div className="grid grid-cols-2 gap-4">
                {project.technologies.map((tech, index) => (
                  <div key={index} className="bg-gray-700 bg-opacity-50 rounded-lg p-4 text-center">
                    <span className="text-white font-medium">{tech}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Related Projects Section */}
        <div className="mt-12">
          <div className="text-center">
            <Link
              to="/project"
              className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              View All Projects
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
