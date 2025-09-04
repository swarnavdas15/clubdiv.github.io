import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setMessage('');

    if (newPassword.length < 6) {
      setSubmitStatus('error');
      setMessage('New password must be at least 6 characters long.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, oldPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setMessage(data.message);
      } else {
        setSubmitStatus('error');
        setMessage(data.message || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setSubmitStatus('error');
      setMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Pane with Background Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-cover bg-center"
           style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/login-bg.webp)` }}>
        <div className="w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white p-8">
            <h1 className="text-4xl font-bold mb-4">Reset Password</h1>
            <p className="text-xl opacity-90">Change your password securely</p>
          </div>
        </div>
      </div>

      {/* Right Pane with Reset Password Form */}
      <div className="w-full lg:w-2/3 bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-center mb-8 text-white">Reset Password</h2>
            <p className="text-gray-300 text-center mb-6">
              Enter your email, current password, and new password to reset.
            </p>

            {message && (
              <div
                className={`mb-4 rounded-lg border p-4 text-sm ${
                  submitStatus === 'success'
                    ? 'border-green-600 bg-green-900/50 text-green-200'
                    : 'border-red-600 bg-red-900/50 text-red-200'
                }`}
              >
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  id="oldPassword"
                  name="oldPassword"
                  placeholder="Enter your current password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white"
                  required
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-300">
                Remember your password?{' '}
                <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">
                  Back to login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
