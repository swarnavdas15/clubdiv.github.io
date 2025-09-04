import dotenv from 'dotenv';

dotenv.config();

// SendPulse API configuration
const SENDPULSE_CLIENT_ID = process.env.SENDPULSE_CLIENT_ID;
const SENDPULSE_CLIENT_SECRET = process.env.SENDPULSE_CLIENT_SECRET;
const SENDPULSE_FROM_EMAIL = process.env.SENDPULSE_FROM_EMAIL || 'noreply@yourdomain.com';
const SENDPULSE_FROM_NAME = process.env.SENDPULSE_FROM_NAME || 'Club <div> Team';

// Cache for access token
let accessToken = null;
let tokenExpiresAt = null;

// Function to get SendPulse access token
async function getSendPulseAccessToken() {
  try {
    if (accessToken && tokenExpiresAt && Date.now() < tokenExpiresAt) {
      return accessToken;
    }

    const response = await fetch('https://api.sendpulse.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: SENDPULSE_CLIENT_ID,
        client_secret: SENDPULSE_CLIENT_SECRET,
      }),
    });

    if (!response.ok) {
      throw new Error(`SendPulse API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    accessToken = data.access_token;
    // Token expires in 1 hour, but we'll refresh 5 minutes early
    tokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000;

    return accessToken;
  } catch (error) {
    console.error('Error getting SendPulse access token:', error);
    throw error;
  }
}

// Function to send email via SendPulse
async function sendSendPulseEmail(to, subject, html) {
  try {
    const token = await getSendPulseAccessToken();

    const response = await fetch('https://api.sendpulse.com/smtp/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        email: {
          from: {
            email: SENDPULSE_FROM_EMAIL,
            name: SENDPULSE_FROM_NAME,
          },
          to: [
            {
              email: to,
            },
          ],
          subject: subject,
          html: html,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`SendPulse send email error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    console.log('SendPulse email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Error sending email via SendPulse:', error);
    throw error;
  }
}

// Fallback to mock mode if SendPulse credentials are not provided
const useSendPulse = SENDPULSE_CLIENT_ID && SENDPULSE_CLIENT_SECRET;

// Mock email service for development/testing
function createMockTransporter() {
  return {
    sendMail: async (mailOptions) => {
      const otp = mailOptions.html.match(/\d{6}/)?.[0] || 'No OTP found';
      console.log('Mock email sent:', {
        to: mailOptions.to,
        subject: mailOptions.subject,
        otp: otp
      });
      console.log('OTP for testing:', otp);
      return { messageId: 'mock-message-id' };
    },
  };
}

const mockTransporter = createMockTransporter();

// Function to send OTP email
export const sendOTPEmail = async (email, otp) => {
  try {
    const subject = 'Password Reset OTP - Club <div>';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5; text-align: center;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>You have requested to reset your password for your Club <div> account.</p>
        <p>Your One-Time Password (OTP) is:</p>
        <div style="background-color: #F3F4F6; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #4F46E5; font-size: 32px; letter-spacing: 8px; margin: 0;">${otp}</h1>
        </div>
        <p>This OTP will expire in 10 minutes for security reasons.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <br>
        <p>Best regards,<br>Club <div> Team</p>
        <hr>
        <p style="color: #6B7280; font-size: 12px;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `;

    if (useSendPulse) {
      const result = await sendSendPulseEmail(email, subject, html);
      console.log('OTP email sent successfully to:', email, 'via SendPulse');
      return { success: true, messageId: result.id || 'sendpulse-message-id' };
    } else {
      console.log('Using mock email service for development/testing');
      const result = await mockTransporter.sendMail({ to: email, subject, html });
      console.log('OTP email sent successfully to:', email, 'via mock');
      return { success: true, messageId: result.messageId };
    }
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
};

// Function to verify email configuration
export const verifyEmailConfig = async () => {
  try {
    if (useSendPulse) {
      // Test SendPulse by getting access token
      await getSendPulseAccessToken();
      console.log('SendPulse email service is ready to send messages');
      return true;
    } else {
      console.log('Using mock email service for development/testing');
      return true;
    }
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
};
