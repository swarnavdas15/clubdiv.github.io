import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Loading from './Loading';
import { useAuth } from '../context/AuthContext';

const BlogPost = () => {
  const { id } = useParams();
  const { user, token } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [likesCount, setLikesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);
  const [userLiked, setUserLiked] = useState(false);
  const [userDisliked, setUserDisliked] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/blog-posts/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch blog post');
        }
        const data = await response.json();
        setPost(data);
        setLikesCount(data.likesCount || data.likes.length);
        setDislikesCount(data.dislikesCount || data.dislikes.length);
        // Use backend response for user state if available, otherwise fallback to array check
        if (user) {
          setUserLiked(data.userLiked !== undefined ? data.userLiked : data.likes.some(uid => uid === user.id || uid === user._id));
          setUserDisliked(data.userDisliked !== undefined ? data.userDisliked : data.dislikes.some(uid => uid === user.id || uid === user._id));
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/blog-posts/${id}/comments`);
        if (response.ok) {
          const commentsData = await response.json();
          setComments(commentsData);
        }
      } catch (err) {
        console.error('Error fetching comments:', err);
      }
    };

    fetchPost();
    fetchComments();
  }, [id, user]);

  useEffect(() => {
    if (post) {
      document.title = post.title;

      const setMetaTag = (property, content) => {
        let element = document.querySelector(`meta[property='${property}']`);
        if (!element) {
          element = document.createElement('meta');
          element.setAttribute('property', property);
          document.head.appendChild(element);
        }
        element.setAttribute('content', content);
      };

      setMetaTag('og:title', post.title);
      setMetaTag('og:description', post.content ? post.content.substring(0, 150) : '');
      setMetaTag('og:url', window.location.href);
      if (post.image) {
        setMetaTag('og:image', `http://localhost:5000${post.image}`);
      }
    }
  }, [post]);

  const handleLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      const headers = {};
      if (user && token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      headers['Content-Type'] = 'application/json';

      const response = await fetch(`http://localhost:5000/api/blog-posts/${id}/like`, {
        method: 'POST',
        headers: headers
      });

      if (response.ok) {
        const data = await response.json();
        setLikesCount(data.likesCount);
        setDislikesCount(data.dislikesCount);
        // Update user state from backend response
        setUserLiked(data.userLiked);
        setUserDisliked(data.userDisliked);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDislike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      const headers = {};
      if (user && token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      headers['Content-Type'] = 'application/json';

      const response = await fetch(`http://localhost:5000/api/blog-posts/${id}/dislike`, {
        method: 'POST',
        headers: headers
      });

      if (response.ok) {
        const data = await response.json();
        setLikesCount(data.likesCount);
        setDislikesCount(data.dislikesCount);
        // Update user state from backend response
        setUserLiked(data.userLiked);
        setUserDisliked(data.userDisliked);
      }
    } catch (error) {
      console.error('Error disliking post:', error);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!user || !newComment.trim() || commentLoading) return;
    setCommentLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/blog-posts/${id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newComment })
      });

      if (response.ok) {
        const newCommentData = await response.json();
        setComments([newCommentData.comment, ...comments]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading blog post..." />;
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
        <h1 className="text-4xl font-bold text-white mb-4">{post.title}</h1>
        <p className="text-gray-300 text-sm mb-1">
          Published on {new Date(post.createdAt).toLocaleDateString()}
        </p>
        <p className="text-gray-400 text-sm mb-4 italic">
          By {post.author?.firstName} {post.author?.lastName} ({post.author?.username})
        </p>
        {post.image && (
          <img
            src={`http://localhost:5000${post.image}`}
            alt={post.title}
            className="w-full h-auto rounded-lg mb-6 shadow-lg"
          />
        )}
        <div className="prose text-gray-200 bg-gray-800 bg-opacity-80 p-6 rounded-lg backdrop-blur-sm">
          <p>{post.content}</p>
        </div>

        {/* Like/Dislike Buttons */}
        <div className="mt-6 flex items-center space-x-4">
          <button
            onClick={handleLike}
            disabled={likeLoading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              userLiked
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <span>{likesCount}</span>
          </button>

          <button
            onClick={handleDislike}
            disabled={likeLoading}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              userDisliked
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.65l1.45 1.32C18.6 8.64 22 11.72 22 15.5c0 3.08-2.42 5.5-5.5 5.5-1.74 0-3.41-.81-4.5-2.09C11.91 20.19 10.24 21 8.5 21 5.42 21 3 18.58 3 15.5c0-3.78 3.4-6.86 8.55-11.54L12 2.65z"/>
            </svg>
            <span>{dislikesCount}</span>
          </button>
        </div>

        {/* Comments Section */}
        <div className="mt-8">
          <h3 className="text-white text-xl font-semibold mb-4">Comments ({comments.length})</h3>

          {/* Add Comment */}
          {user ? (
            <div className="mb-6">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim() || commentLoading}
                className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {commentLoading ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          ) : (
            <p className="text-gray-400 mb-4">Login to add a comment</p>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment._id} className="bg-gray-800 bg-opacity-80 p-4 rounded-lg backdrop-blur-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-white font-medium">{comment.author.firstName} {comment.author.lastName}</span>
                  <span className="text-gray-400 text-sm">@{comment.author.username}</span>
                  <span className="text-gray-500 text-sm">{new Date(comment.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-200">{comment.content}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-white text-lg font-semibold mb-3">Share this post:</h3>
          <div className="flex flex-wrap gap-3">
            {/* LinkedIn Share */}
            <button
              onClick={() => {
                const currentUrl = window.location.href;
                // For development, replace localhost with your production domain if needed
                const shareUrl = encodeURIComponent(currentUrl);
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, '_blank');
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              <span>LinkedIn</span>
            </button>

            {/* Copy Link */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                  .then(() => {
                    setCopySuccess(true);
                    setTimeout(() => setCopySuccess(false), 2000);
                  })
                  .catch(() => {
                    alert('Failed to copy link. Please copy manually.');
                  });
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>{copySuccess ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
