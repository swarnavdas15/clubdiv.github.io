import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    college: '',
    branch: '',
    email: '',
    number: '',
    password: '',
    profileImage: '/Avatars/icons8-boy-64.png',
    securityQuestions: [
      { question: '', answer: '' },
      { question: '', answer: '' }
    ]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const navigate = useNavigate();

  const securityQuestionOptions = [
    "What was the name of your first pet?",
    "What is your mother's maiden name?",
    "What was the name of your first school?",
    "What is your favorite childhood memory?",
    "What was your childhood nickname?",
    "What is the name of the city where you were born?",
    "What was your favorite subject in school?",
    "What is the name of your favorite book?",
    "What was the make of your first car?",
    "What is your favorite movie?"
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSecurityQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.securityQuestions];
    updatedQuestions[index][field] = value;
    setFormData({
      ...formData,
      securityQuestions: updatedQuestions
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    // Validate security questions
    if (!formData.securityQuestions[0].question || !formData.securityQuestions[0].answer ||
        !formData.securityQuestions[1].question || !formData.securityQuestions[1].answer) {
      setSubmitStatus('validation_error');
      setIsSubmitting(false);
      return;
    }

    // Check if questions are different
    if (formData.securityQuestions[0].question === formData.securityQuestions[1].question) {
      setSubmitStatus('duplicate_questions');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          username: '',
          name: '',
          college: '',
          branch: '',
          email: '',
          number: '',
          password: '',
          profileImage: '/Avatars/icons8-boy-64.png',
          securityQuestions: [
            { question: '', answer: '' },
            { question: '', answer: '' }
          ]
        });
        navigate('/pending-approval');
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthLogin = (provider) => {
    window.location.href = `http://localhost:5000/api/auth/${provider}`;
  };

  return (
    <div className="py-20 bg-gray-800 bg-opacity-80 backdrop-blur-sm min-h-screen flex items-center justify-center">
      <div className="max-w-xl w-full px-6">
        <div className="bg-gray-900 bg-opacity-90 p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-center mb-8 text-white">Join Our Club</h2>

          {/* OAuth Buttons */}
          <div className="mb-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-400">Continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 mb-6">
              <button
                onClick={() => handleOAuthLogin('google')}
                className="group relative w-full flex justify-center py-3 px-4 border border-gray-600 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
              >
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </span>
                <span className="ml-2">Continue with Google</span>
              </button>

              <button
                onClick={() => handleOAuthLogin('github')}
                className="group relative w-full flex justify-center py-3 px-4 border border-gray-600 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
              >
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </span>
                <span className="ml-2">Continue with GitHub</span>
              </button>

              <button
                onClick={() => handleOAuthLogin('linkedin')}
                className="group relative w-full flex justify-center py-3 px-4 border border-gray-600 text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
              >
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </span>
                <span className="ml-2">Continue with LinkedIn</span>
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-400">Or register with email</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700 bg-opacity-80 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white backdrop-blur-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Your full name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700 bg-opacity-80 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white backdrop-blur-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="college" className="block text-sm font-medium text-gray-300 mb-2">
                College
              </label>
              <input
                type="text"
                id="college"
                name="college"
                placeholder="Your college name"
                value={formData.college}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700 bg-opacity-80 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white backdrop-blur-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="branch" className="block text-sm font-medium text-gray-300 mb-2">
                Branch
              </label>
              <input
                type="text"
                id="branch"
                name="branch"
                placeholder="Your branch"
                value={formData.branch}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700 bg-opacity-80 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white backdrop-blur-sm"
                required
              />
            </div>
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
                className="w-full px-4 py-3 bg-gray-700 bg-opacity-80 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white backdrop-blur-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="number" className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                id="number"
                name="number"
                placeholder="Your phone number"
                value={formData.number}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700 bg-opacity-80 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white backdrop-blur-sm"
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
                placeholder="Create a password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-700 bg-opacity-80 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white backdrop-blur-sm"
                required
              />
            </div>

            {/* Security Questions Section */}
            <div className="space-y-4">
              <div className="border-t border-gray-600 pt-6">
                <h3 className="text-lg font-medium text-gray-300 mb-4">Security Questions</h3>
                <p className="text-sm text-gray-400 mb-4">
                  These will be used to verify your identity if you forget your password.
                </p>

                {[0, 1].map((index) => (
                  <div key={index} className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Security Question {index + 1}
                    </label>
                    <select
                      value={formData.securityQuestions[index].question}
                      onChange={(e) => handleSecurityQuestionChange(index, 'question', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 bg-opacity-80 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white backdrop-blur-sm mb-2"
                      required
                    >
                      <option value="">Select a security question</option>
                      {securityQuestionOptions.map((question, qIndex) => (
                        <option key={qIndex} value={question}>
                          {question}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Your answer"
                      value={formData.securityQuestions[index].answer}
                      onChange={(e) => handleSecurityQuestionChange(index, 'answer', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700 bg-opacity-80 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white backdrop-blur-sm"
                      required
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Choose Your Avatar
              </label>
              <div className="flex justify-center space-x-6">
                <div
                  onClick={() => setFormData({ ...formData, profileImage: '/Avatars/icons8-boy-64.png' })}
                  className={`cursor-pointer p-2 rounded-lg border-2 transition-colors ${
                    formData.profileImage === '/Avatars/icons8-boy-64.png'
                      ? 'border-indigo-500 bg-indigo-500 bg-opacity-20'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <img
                    src="/Avatars/icons8-boy-64.png"
                    alt="Boy Avatar"
                    className="w-16 h-16 rounded-full"
                  />
                </div>
                <div
                  onClick={() => setFormData({ ...formData, profileImage: '/Avatars/icons8-student-64.png' })}
                  className={`cursor-pointer p-2 rounded-lg border-2 transition-colors ${
                    formData.profileImage === '/Avatars/icons8-student-64.png'
                      ? 'border-indigo-500 bg-indigo-500 bg-opacity-20'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <img
                    src="/Avatars/icons8-student-64.png"
                    alt="Student Avatar"
                    className="w-16 h-16 rounded-full"
                  />
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>

            {submitStatus === 'success' && (
              <div className="bg-green-900 bg-opacity-80 border border-green-700 text-green-300 px-4 py-3 rounded mt-4 backdrop-blur-sm">
                Registration successful! Welcome to the club.
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="bg-red-900 bg-opacity-80 border border-red-700 text-red-300 px-4 py-3 rounded mt-4 backdrop-blur-sm">
                There was an error during registration. Please try again.
              </div>
            )}

            {submitStatus === 'validation_error' && (
              <div className="bg-red-900 bg-opacity-80 border border-red-700 text-red-300 px-4 py-3 rounded mt-4 backdrop-blur-sm">
                Please fill in all security questions and answers.
              </div>
            )}

            {submitStatus === 'duplicate_questions' && (
              <div className="bg-red-900 bg-opacity-80 border border-red-700 text-red-300 px-4 py-3 rounded mt-4 backdrop-blur-sm">
                Please select different security questions.
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-300">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
