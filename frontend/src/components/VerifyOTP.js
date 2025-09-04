import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import OTPVerificationCard from './OTPVerificationCard';

export default function VerifyOTP() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (otpValue) => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp: otpValue }),
      });

      const data = await response.json();
      if (response.ok) {
        // Navigate to reset password page with email and otp
        navigate('/reset-password', {
          state: { email, otp: otpValue }
        });
      } else {
        throw new Error(data.message || 'OTP verification failed');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error; // Re-throw to let OTPVerificationCard handle the error display
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return (
      <div className="py-20 bg-gray-900 bg-opacity-80 backdrop-blur-sm">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-800 bg-opacity-80 p-8 rounded-lg shadow-lg text-center backdrop-blur-sm">
            <h2 className="text-3xl font-bold text-white mb-4">Invalid Access</h2>
            <p className="text-gray-300 mb-6">Please start the password reset process from the login page.</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <OTPVerificationCard
      email={email}
      onVerify={handleVerify}
      isLoading={isLoading}
    />
  );
}
