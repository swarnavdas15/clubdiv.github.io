import React from 'react';

export default function Privacy() {
  return (
    <div className="py-20 bg-gray-900 bg-opacity-80 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-300">Your privacy is important to us</p>
        </div>

        <div className="bg-gray-800 bg-opacity-80 backdrop-blur-sm rounded-lg p-8 shadow-lg">
          <div className="prose prose-lg prose-invert max-w-none">
            <h2 className="text-2xl font-bold text-white mb-4">Information We Collect</h2>
            <p className="text-gray-300 mb-6">
              We collect information you provide directly to us, such as when you create an account,
              participate in our events, or contact us for support. This may include your name,
              email address, and any other information you choose to provide.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">How We Use Your Information</h2>
            <p className="text-gray-300 mb-6">
              We use the information we collect to:
            </p>
            <ul className="text-gray-300 mb-6 list-disc list-inside space-y-2">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send you technical notices and support messages</li>
              <li>Communicate with you about products, services, and events</li>
              <li>Monitor and analyze trends and usage</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mb-4">Information Sharing</h2>
            <p className="text-gray-300 mb-6">
              We do not sell, trade, or otherwise transfer your personal information to third parties
              without your consent, except as described in this policy. We may share your information
              in the following circumstances:
            </p>
            <ul className="text-gray-300 mb-6 list-disc list-inside space-y-2">
              <li>With service providers who assist us in operating our website</li>
              <li>When required by law or to protect our rights</li>
              <li>In connection with a business transfer or acquisition</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mb-4">Data Security</h2>
            <p className="text-gray-300 mb-6">
              We implement appropriate security measures to protect your personal information against
              unauthorized access, alteration, disclosure, or destruction. However, no method of
              transmission over the internet is 100% secure.
            </p>

            <h2 className="text-2xl font-bold text-white mb-4">Your Rights</h2>
            <p className="text-gray-300 mb-6">
              You have the right to:
            </p>
            <ul className="text-gray-300 mb-6 list-disc list-inside space-y-2">
              <li>Access and update your personal information</li>
              <li>Request deletion of your personal information</li>
              <li>Opt out of marketing communications</li>
              <li>Request data portability</li>
            </ul>

            <h2 className="text-2xl font-bold text-white mb-4">Contact Us</h2>
            <p className="text-gray-300 mb-6">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <div className="bg-gray-700 bg-opacity-50 rounded-lg p-4">
              <p className="text-gray-300">
                Email: divfoundation958@gmail.com<br />
                Address: Chouksey Engineering College, Bilaspur, CG
              </p><br />
            </div>

            <h2 className="text-2xl font-bold space-y text-white mb-4">Changes to This Policy</h2>
            <p className="text-gray-300">
              We may update this Privacy Policy from time to time. We will notify you of any changes
              by posting the new Privacy Policy on this page and updating the April 2025.
            </p>

            <p className="text-gray-400 text-sm mt-8">
              Last updated: September 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
