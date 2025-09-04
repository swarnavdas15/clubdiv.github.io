import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function ChangePassword({ onClose }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [message, setMessage] = useState('');

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
    setMessage('');

    // Frontend validation
    if (formData.newPassword !== formData.confirmPassword) {
      setSubmitStatus('error');
      setMessage('New passwords do not match');
      setIsSubmitting(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setSubmitStatus('error');
      setMessage('New password must be at least 6 characters long');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('=== Frontend Password Change Debug ===');
      console.log('User ID:', user?._id);
      console.log('Old password length:', formData.oldPassword.length);
      console.log('New password length:', formData.newPassword.length);

      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);

      const response = await fetch('http://localhost:5000/api/request-password-change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword
        })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        setSubmitStatus('success');
        setMessage(data.message || 'Password change request submitted successfully');
        setFormData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setSubmitStatus('error');
        setMessage(data.message || 'Failed to submit password change request. Please check your current password and try again.');
      }
    } catch (error) {
      console.error('Password change error:', error);
      setSubmitStatus('error');
      setMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-100">Change Password</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-2xl"
          >
            &times;
          </button>
        </div>

        {message && (
          <div
            className={`mb-4 rounded-lg border p-4 text-sm ${
              submitStatus === 'success'
                ? 'border-green-600 bg-green-900/50 text-green-200'
                : 'border-red-600 bg-red-900/50 text-red-200'
            }`}
          >
            {submitStatus === 'success' ? (
              <div className="flex items-center">
                <CheckCircleIcon className="mr-2 h-5 w-5" />
                {message}
              </div>
            ) : (
              <div className="flex items-center">
                <XCircleIcon className="mr-2 h-5 w-5" />
                {message}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Current Password
            </label>
            <input
              type="password"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white"
              placeholder="Enter your current password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white"
              placeholder="Enter your new password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white"
              placeholder="Confirm your new password"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Change Password'}
            </button>
          </div>
        </form>

        <div className="mt-4 text-xs text-gray-400">
          <p>Note: Password change requests require admin approval before taking effect.</p>
        </div>
      </div>
    </div>
  );
}
