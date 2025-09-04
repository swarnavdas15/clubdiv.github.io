import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProjectManager() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    technologies: '',
    githubUrl: '',
    liveUrl: '',
    imageUrl: '',
    status: 'active'
  });
  const [editingId, setEditingId] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/projects');
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTechnologiesChange = (e) => {
    setFormData(prev => ({
      ...prev,
      technologies: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingId 
        ? `http://localhost:5000/api/projects/${editingId}`
        : 'http://localhost:5000/api/projects';
        
      const method = editingId ? 'PUT' : 'POST';
      
      const projectData = {
        ...formData,
        technologies: formData.technologies.split(',').map(tech => tech.trim()).filter(tech => tech)
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(projectData)
      });

      if (!response.ok) {
        throw new Error(editingId ? 'Failed to update project' : 'Failed to create project');
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        technologies: '',
        githubUrl: '',
        liveUrl: '',
        imageUrl: '',
        status: 'active'
      });
      setEditingId(null);
      
      // Refresh projects list
      fetchProjects();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (project) => {
    setFormData({
      title: project.title,
      description: project.description || '',
      technologies: project.technologies ? project.technologies.join(', ') : '',
      githubUrl: project.githubUrl || '',
      liveUrl: project.liveUrl || '',
      imageUrl: project.imageUrl || '',
      status: project.status || 'active'
    });
    setEditingId(project._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      // Note: You would need to implement the DELETE endpoint in the backend
      const response = await fetch(`http://localhost:5000/api/projects/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      // Refresh projects list
      fetchProjects();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      technologies: '',
      githubUrl: '',
      liveUrl: '',
      imageUrl: '',
      status: 'active'
    });
    setEditingId(null);
  };

  if (loading) return <div className="py-20 bg-gray-900 bg-opacity-80 backdrop-blur-sm">Loading projects...</div>;
  if (error) return <div className="py-20 bg-gray-900 bg-opacity-80 backdrop-blur-sm text-red-500">Error: {error}</div>;

  return (
    <div className="py-20 bg-gray-900 bg-opacity-80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Manage Projects</h2>
          <p className="text-xl text-gray-300">Create and update your projects</p>
        </div>

        {/* Project Form */}
        <div className="mb-16 bg-gray-800 bg-opacity-80 p-8 rounded-lg shadow-lg backdrop-blur-sm">
          <h3 className="text-2xl font-bold text-white mb-6">
            {editingId ? 'Edit Project' : 'Add New Project'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 bg-opacity-80 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 bg-opacity-80 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="upcoming">Upcoming</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-3 bg-gray-700 bg-opacity-80 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white"
              ></textarea>
            </div>

            <div>
              <label htmlFor="technologies" className="block text-sm font-medium text-gray-300 mb-2">
                Technologies (comma separated)
              </label>
              <input
                type="text"
                id="technologies"
                name="technologies"
                value={formData.technologies}
                onChange={handleTechnologiesChange}
                className="w-full px-4 py-3 bg-gray-700 bg-opacity-80 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white"
                placeholder="React, Node.js, MongoDB"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-300 mb-2">
                  GitHub URL
                </label>
                <input
                  type="url"
                  id="githubUrl"
                  name="githubUrl"
                  value={formData.githubUrl}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 bg-opacity-80 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white"
                />
              </div>
              <div>
                <label htmlFor="liveUrl" className="block text-sm font-medium text-gray-300 mb-2">
                  Live URL
                </label>
                <input
                  type="url"
                  id="liveUrl"
                  name="liveUrl"
                  value={formData.liveUrl}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 bg-opacity-80 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-300 mb-2">
                Image URL
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700 bg-opacity-80 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                {editingId ? 'Update Project' : 'Create Project'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Projects List */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-6">Existing Projects</h3>
          {projects.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-8">
              {projects.map((project) => (
                <div key={project._id} className="bg-gray-800 bg-opacity-80 rounded-xl shadow-md overflow-hidden backdrop-blur-sm">
                  <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 h-32 flex items-center justify-center">
                    {project.imageUrl ? (
                      <>
                        <img
                          src={project.imageUrl.startsWith('/uploads/') ? `http://localhost:5000${project.imageUrl}` : project.imageUrl}
                          alt={project.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center" style={{ display: 'none' }}>
                          <span className="text-4xl text-white">🌐</span>
                        </div>
                      </>
                    ) : (
                      <span className="text-4xl text-white">🌐</span>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xl font-bold text-white">{project.title}</h4>
                      <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs">
                        {project.status}
                      </span>
                    </div>
                    <p className="text-gray-300 mb-4">{project.description || "No description provided."}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies && project.technologies.map((tech, index) => (
                        <span key={index} className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleEdit(project)}
                        className="text-blue-400 font-semibold hover:text-blue-300 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(project._id)}
                        className="text-red-400 font-semibold hover:text-red-300 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No projects available yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
