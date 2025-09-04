import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function BlogManager() {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [editingId, setEditingId] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchBlogPosts();
  }, [fetchBlogPosts]);

  const fetchBlogPosts = React.useCallback(async () => {
    try {
      // Use user blog posts endpoint for both admin and regular users
      // This returns all blog posts by the authenticated user with all statuses
      const response = await fetch('http://localhost:5000/api/user/blog-posts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch blog posts');
      }
      const data = await response.json();
      setBlogPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingId 
        ? `http://localhost:5000/api/blog-posts/${editingId}`
        : 'http://localhost:5000/api/blog-posts';
        
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(editingId ? 'Failed to update blog post' : 'Failed to create blog post');
      }

      // Reset form
      setFormData({
        title: '',
        content: ''
      });
      setEditingId(null);
      
      // Refresh blog posts list
      fetchBlogPosts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (post) => {
    setFormData({
      title: post.title,
      content: post.content
    });
    setEditingId(post._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/admin/blog-posts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete blog post');
      }

      // Refresh blog posts list
      fetchBlogPosts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      content: ''
    });
    setEditingId(null);
  };

  if (loading) return <div className="py-20 bg-gray-900 bg-opacity-80 backdrop-blur-sm">Loading blog posts...</div>;
  if (error) return <div className="py-20 bg-gray-900 bg-opacity-80 backdrop-blur-sm text-red-500">Error: {error}</div>;

  return (
    <div className="py-20 bg-gray-900 bg-opacity-80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Manage Blog Posts</h2>
          <p className="text-xl text-gray-300">Create and update your blog posts</p>
        </div>

        {/* Blog Post Form */}
        <div className="mb-16 bg-gray-800 bg-opacity-80 p-8 rounded-lg shadow-lg backdrop-blur-sm">
          <h3 className="text-2xl font-bold text-white mb-6">
            {editingId ? 'Edit Blog Post' : 'Add New Blog Post'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                className="w-full px-4 py-3 bg-gray-700 bg-opacity-80 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white backdrop-blur-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
                Content *
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows="10"
                className="w-full px-4 py-3 bg-gray-700 bg-opacity-80 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white backdrop-blur-sm"
                required
              ></textarea>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                {editingId ? 'Update Post' : 'Create Post'}
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

        {/* Blog Posts List */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-6">Existing Blog Posts</h3>
          {blogPosts.length > 0 ? (
            <div className="space-y-8">
              {blogPosts.map((post) => (
                <div key={post._id} className="bg-gray-800 bg-opacity-80 rounded-xl shadow-md overflow-hidden backdrop-blur-sm">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-2xl font-bold text-white">{post.title}</h4>
                      <span className="text-gray-400 text-sm">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-gray-300 mb-6 prose prose-invert max-w-none">
                      {post.content.substring(0, 300)}...
                    </div>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleEdit(post)}
                        className="text-blue-400 font-semibold hover:text-blue-300 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post._id)}
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
              <p className="text-gray-400">No blog posts available yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
