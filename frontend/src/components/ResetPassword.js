import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  const { email, otp } = location.state || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        // Navigate to login page after successful password reset
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  if (!email || !otp) {
    return (
      <div className="py-20 bg-gray-900 bg-opacity-80 backdrop-blur-sm">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-800 bg-opacity-80 p-8 rounded-lg shadow-lg text-center backdrop-blur-sm">
            <h2 className="text-3xl font-bold text-white mb-4">Invalid Access</h2>
            <p className="text-gray-300">Please complete the OTP verification process first.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20 bg-gray-900 bg-opacity-80 backdrop-blur-sm">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-800 bg-opacity-80 p-8 rounded-lg shadow-lg backdrop-blur-sm">
          <h2 className="text-3xl font-bold text-center mb-8 text-white">Reset Password</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>
              <input 
                type="password" 
                id="newPassword"
                name="newPassword"
                placeholder="Enter new password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 bg-opacity-80 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white backdrop-blur-sm"
                minLength="6"
                required
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <input 
                type="password" 
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm new password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 bg-opacity-80 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white backdrop-blur-sm"
                minLength="6"
                required
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Reset Password
            </button>
            {message && <div className="bg-green-900 bg-opacity-80 border border-green-700 text-green-300 px-4 py-3 rounded backdrop-blur-sm">{message}</div>}
            {error && <div className="bg-red-900 bg-opacity-80 border border-red-700 text-red-300 px-4 py-3 rounded backdrop-blur-sm">{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}
