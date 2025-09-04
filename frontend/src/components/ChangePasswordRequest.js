import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ChangePasswordRequest() {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

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

    // Validate passwords
    if (formData.newPassword !== formData.confirmPassword) {
      setSubmitStatus('passwordMismatch');
      setIsSubmitting(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setSubmitStatus('passwordTooShort');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/request-password-change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
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
           style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/login-bg.webp)` }}>
        <div className="w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white p-8">
            <h1 className="text-4xl font-bold mb-4">Change Password</h1>
            <p className="text-xl opacity-90">Request a password change that requires admin approval</p>
          </div>
        </div>
      </div>

      {/* Right Pane with Password Change Form */}
      <div className="w-full lg:w-2/3 bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-center mb-8 text-white">Request Password Change</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  id="oldPassword"
                  name="oldPassword"
                  placeholder="Enter your current password"
                  value={formData.oldPassword}
                  onChange={handleInputChange}
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
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your new password"
                  value={formData.confirmPassword}
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
                {isSubmitting ? 'Submitting Request...' : 'Request Password Change'}
              </button>

              {submitStatus === 'success' && (
                <div className="bg-green-900 border border-green-700 text-green-300 px-4 py-3 rounded">
                  Password change request submitted successfully! It will be reviewed by an admin.
                </div>
              )}

              {submitStatus === 'passwordMismatch' && (
                <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded">
                  New passwords do not match. Please try again.
                </div>
              )}

              {submitStatus === 'passwordTooShort' && (
                <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded">
                  New password must be at least 6 characters long.
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded">
                  Failed to submit password change request. Please check your current password and try again.
                </div>
              )}
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-300">
                <Link to="/dashboard" className="text-indigo-400 hover:text-indigo-300 font-semibold">
                  Back to dashboard
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
