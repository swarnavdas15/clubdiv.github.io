import React, { useState } from 'react';

const OTPVerificationCard = ({ email, onVerify, isLoading = false }) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState(null);

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(value);
    setError(null); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      await onVerify(otp);
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    }
  };

  const handleResendOTP = async () => {
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        setError(null); // Clear any existing error
        // You could add a success message here if needed
      } else {
        setError(data.message || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    }
  };

  return (
    <div className="py-20 bg-gray-900 bg-opacity-80 backdrop-blur-sm">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-800 bg-opacity-80 p-8 rounded-lg shadow-lg backdrop-blur-sm">
          <h2 className="text-3xl font-bold text-center mb-8 text-white">Verify OTP</h2>
          <p className="text-sm text-gray-300 text-center mb-6">
            Enter the 6-digit OTP sent to <span className="text-indigo-400 font-medium">{email}</span>
          </p>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-300 mb-2">
                OTP Code
              </label>
              <input
                type="text"
                id="otp"
                name="otp"
                placeholder="000000"
                value={otp}
                onChange={handleOtpChange}
                className="w-full px-4 py-3 bg-gray-700 bg-opacity-80 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-center text-2xl tracking-widest text-white backdrop-blur-sm"
                maxLength="6"
                required
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold transition-colors"
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </button>
            {error && (
              <div className="bg-red-900 bg-opacity-80 border border-red-700 text-red-300 px-4 py-3 rounded backdrop-blur-sm">
                {error}
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400 mb-2">Didn't receive the OTP?</p>
            <button
              onClick={handleResendOTP}
              disabled={isLoading}
              className="text-indigo-400 hover:text-indigo-300 text-sm font-medium disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              Resend OTP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationCard;
