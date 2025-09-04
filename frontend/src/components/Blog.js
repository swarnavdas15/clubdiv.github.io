import React, { useState, useEffect } from 'react';
import Loading from './Loading';

const Blog = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/blog-posts');
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
    };

    fetchBlogPosts();
  }, []);

  if (loading) {
    return <Loading message="Loading blog posts..." />;
  }

  if (error) {
    return (
      <div className="py-20 bg-gray-900 bg-opacity-80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Error</h2>
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 bg-gray-900 bg-opacity-80 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center text-white mb-12">Blog</h1>
        
        {blogPosts.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-400">No blog posts available yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {blogPosts.map((post) => (
              <div key={post._id} className="bg-gray-800 bg-opacity-80 p-6 rounded-lg shadow-lg backdrop-blur-sm">
                <h2 className="text-2xl font-bold text-white mb-3">{post.title}</h2>
                <p className="text-gray-300 text-sm mb-1">
                  Published on {new Date(post.createdAt).toLocaleDateString()}
                </p>
                <p className="text-gray-400 text-sm mb-4 italic">
                  By {post.author?.firstName} {post.author?.lastName} ({post.author?.username})
                </p>
                <p className="text-gray-200 mb-4">{post.content?.substring(0, 200)}...</p>
                <a
                  href={`/blog/${post._id}`}
                  className="text-blue-400 hover:text-blue-300 font-semibold"
                >
                  Read more →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
