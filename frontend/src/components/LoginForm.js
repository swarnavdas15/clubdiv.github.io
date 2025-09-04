import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [oauthError, setOauthError] = useState(null);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for OAuth error messages in URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const error = urlParams.get('error');
    const message = urlParams.get('message');

    if (error && message) {
      let errorMessage = decodeURIComponent(message);

      // Format specific error messages for better UX
      if (error === 'github' && errorMessage.includes('Email is required')) {
        errorMessage = 'GitHub login failed: Please ensure your GitHub account has a public email address. Go to GitHub Settings > Emails and make sure you have at least one email address set as public.';
      }

      setOauthError(errorMessage);

      // Clean up URL parameters
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [location.search]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const result = await login(formData.email, formData.password);

      if (result.success) {
        setSubmitStatus('success');
        setFormData({ email: '', password: '' });
        // The AuthContext will handle redirect to pending-approval if user is not active
        // Only navigate if user is active and 2FA not required
        if (result.requiresTwoFactor) {
          // Redirect handled in AuthContext login function
        } else if (user && user.isActive !== false) {
          if (user.role === 'admin') {
            navigate('/admin');
          } else {
            // Always navigate to user dashboard after successful login
            navigate('/dashboard');
          }
        }
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Pane with Background Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-cover bg-center"
           style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/login-bg.jpg)` }}>
        <div className="w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white p-8">
            <h1 className="text-4xl backdrop-blur-1 text-orange-500 font-bold mb-4">Welcome to &lt;div&gt;</h1>
            <p className="text-xl  opacity-90">Join our community of developers and innovators</p>
          </div>
        </div>
      </div>

      {/* Right Pane with Login Form */}
      <div className="w-full lg:w-2/3 bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-center mb-8 text-white">Login to Your Account</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Your email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>

              {submitStatus === 'success' && (
                <div className="bg-green-900 border border-green-700 text-green-300 px-4 py-3 rounded">
                  Login successful! Welcome back.
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded">
                  Invalid email or password. Please try again.
                </div>
              )}

              {oauthError && (
                <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded">
                  <div className="font-semibold mb-2">OAuth Login Error:</div>
                  <div className="text-sm">{oauthError}</div>
                  <button
                    onClick={() => setOauthError(null)}
                    className="mt-2 text-red-400 hover:text-red-300 text-sm underline"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-300">
                Don't have an account?{' '}
                <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold">
                  Register here
                </Link>
              </p>
              <p className="text-sm text-gray-300 mt-2">
                <Link to="/forgot-password" className="text-indigo-400 hover:text-indigo-300 font-semibold">
                  Forgot your password?
                </Link>
              </p>
            </div>


            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <button
                  onClick={() => window.location.href = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/auth/google`}
                  className="group relative w-full flex justify-center py-3 px-4 border border-gray-600 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                >
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <FontAwesomeIcon icon={faGoogle} size="lg" />
                  </span>
                  <span className="ml-2">Google</span>
                </button>

                <button
                  onClick={() => window.location.href = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/auth/github`}
                  className="group relative w-full flex justify-center py-3 px-4 border border-gray-600 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                >
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <FontAwesomeIcon icon={faGithub} size="lg" />
                  </span>
                  <span className="ml-2">GitHub</span>
                </button>

                <button
                  onClick={() => window.location.href = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000'}/api/auth/linkedin`}
                  className="group relative w-full flex justify-center py-3 px-4 border border-gray-600 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
                >
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <FontAwesomeIcon icon={faLinkedin} size="lg" />
                  </span>
                  <span className="ml-2">LinkedIn</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
