import React, { useState, useEffect } from 'react';

export default function TwoFactorAuth() {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState(null);
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [backupCodes, setBackupCodes] = useState([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  useEffect(() => {
    // Fetch current 2FA status on mount
    const fetch2FAStatus = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/2fa/status', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setIs2FAEnabled(data.twoFactorEnabled);
        } else {
          setMessage('Failed to fetch 2FA status.');
        }
      } catch (error) {
        setMessage('Error fetching 2FA status.');
      }
    };
    fetch2FAStatus();
  }, []);

  const handleSetup2FA = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('http://localhost:5000/api/2fa/enable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setQrCode(data.qrCodeUrl);
        setSecret(data.secret);
        setMessage('Scan the QR code with your authenticator app and enter the code below.');
      } else {
        setMessage(data.message || 'Failed to setup 2FA.');
      }
    } catch (error) {
      setMessage('Error setting up 2FA.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('http://localhost:5000/api/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ token: otp }),
      });
      const data = await response.json();
      if (response.ok) {
        setIs2FAEnabled(true);
        setQrCode(null);
        setSecret(null);
        setOtp('');
        setBackupCodes(data.backupCodes);
        setShowBackupCodes(true);
        setMessage('Two-Factor Authentication enabled successfully! Save your backup codes.');
      } else {
        setMessage(data.message || 'Failed to verify and enable 2FA.');
      }
    } catch (error) {
      setMessage('Error verifying 2FA.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('http://localhost:5000/api/2fa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        setIs2FAEnabled(false);
        setQrCode(null);
        setSecret(null);
        setOtp('');
        setMessage('Two-Factor Authentication disabled.');
      } else {
        const data = await response.json();
        setMessage(data.message || 'Failed to disable 2FA.');
      }
    } catch (error) {
      setMessage('Error disabling 2FA.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow-md text-white">
      <h2 className="text-2xl font-semibold mb-4">Two-Factor Authentication (2FA)</h2>
      {message && (
        <div className="mb-4 p-3 rounded bg-blue-600">
          {message}
        </div>
      )}

      {showBackupCodes && backupCodes.length > 0 && (
        <div className="mb-4 p-4 bg-yellow-900 border border-yellow-700 rounded">
          <h3 className="text-lg font-semibold mb-2">⚠️ Save Your Backup Codes</h3>
          <p className="text-sm mb-3">These codes can be used to access your account if you lose your device. Store them securely!</p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {backupCodes.map((code, index) => (
              <code key={index} className="bg-gray-700 p-2 rounded text-center text-sm">
                {code}
              </code>
            ))}
          </div>
          <button
            onClick={() => setShowBackupCodes(false)}
            className="w-full bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded text-sm"
          >
            I've Saved These Codes
          </button>
        </div>
      )}

      {is2FAEnabled ? (
        <div>
          <p className="mb-4">Two-Factor Authentication is currently <strong>enabled</strong> on your account.</p>
          <button
            onClick={handleDisable}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            {loading ? 'Disabling...' : 'Disable 2FA'}
          </button>
        </div>
      ) : (
        <div>
          <p className="mb-4">Two-Factor Authentication is currently <strong>disabled</strong>.</p>
          {!qrCode ? (
            <button
              onClick={handleSetup2FA}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
            >
              {loading ? 'Setting up...' : 'Setup 2FA'}
            </button>
          ) : (
            <div>
              <div className="mb-4">
                <p>Scan this QR code with your authenticator app:</p>
                <img src={qrCode} alt="2FA QR Code" className="mx-auto my-2 border border-gray-600 rounded" />
                <p className="text-sm text-gray-300 mt-2">Or enter this secret key manually: <code className="bg-gray-700 p-1 rounded">{secret}</code></p>
              </div>
              <div className="mb-4">
                <label htmlFor="otp" className="block mb-1">Enter the 6-digit code from your authenticator app:</label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="w-full px-3 py-2 rounded text-black"
                  placeholder="000000"
                />
              </div>
              <button
                onClick={handleVerifyAndEnable}
                disabled={loading || otp.length !== 6}
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Enable 2FA'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
