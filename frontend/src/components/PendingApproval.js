import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faUserCheck } from '@fortawesome/free-solid-svg-icons';

export default function PendingApproval() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 rounded-2xl shadow-xl p-8 text-center text-white">
        {/* Icon */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-800 rounded-full">
            <FontAwesomeIcon icon={faClock} className="text-indigo-400 text-2xl" />
          </div>
        </div>

        {/* Main Message */}
        <h1 className="text-3xl font-bold mb-4">
          Your Application is Under Process
        </h1>

        {/* Description */}
        <p className="text-gray-300 mb-8 leading-relaxed">
          Thank you for registering with DIV Club! Your application is currently being reviewed by our administrators.
          You'll receive an email notification once your account is approved.
        </p>

        {/* Status Card */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center mb-2">
            <FontAwesomeIcon icon={faUserCheck} className="text-indigo-400 mr-2" />
            <span className="font-medium text-indigo-400">Approval Pending</span>
          </div>
          <p className="text-sm text-indigo-400">
            This usually takes 1-2 business days
          </p>
        </div>

        {/* Additional Info */}
        <div className="text-sm text-gray-500">
          <p>If you have any questions, please contact our support team.</p>
        </div>

        {/* Back to Home Button */}
        <div className="mt-8">
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
