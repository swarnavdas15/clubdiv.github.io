import dotenv from 'dotenv';

// Load environment variables FIRST - CRITICAL for OAuth configuration
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import passport from 'passport';
import session from 'express-session';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import About from './models/About.js';
import User from './models/User.js';
import bcrypt from 'bcrypt';
import Event from './models/Event.js';
import Project from './models/Project.js';
import Team from './models/Team.js';
import Contact from './models/Contact.js';
import Blog from './models/Blog.js';
import Comment from './models/Comment.js';
import Memory from './models/Memory.js';
import PasswordChangeRequest from './models/PasswordChangeRequest.js';

import { authenticateToken, generateToken, checkAdmin, checkActiveUser } from './middleware/auth.js';

// Import passport configuration AFTER dotenv and other imports
import './config/passport.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection using environment variable
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB Atlas connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend build files statically
app.use(express.static(path.join(__dirname, '../frontend/build')));

// In-memory storage for OTPs (in production, use Redis)
const otpStorage = new Map();

// Function to generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to clean expired OTPs
function cleanExpiredOTPs() {
  const now = Date.now();
  for (const [email, data] of otpStorage.entries()) {
    if (now > data.expiresAt) {
      otpStorage.delete(email);
    }
  }
}

// Clean expired OTPs every 5 minutes
setInterval(cleanExpiredOTPs, 5 * 60 * 1000);



// Forgot Password Routes
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Email, current password, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Check if there's already a pending request for this user
    const existingRequest = await PasswordChangeRequest.findOne({
      userId: user._id,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending password change request' });
    }

    // Hash the new password for storage
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Create password change request
    const passwordChangeRequest = new PasswordChangeRequest({
      userId: user._id,
      oldPassword: user.password, // Store current hashed password for reference
      newPassword: hashedNewPassword,
      status: 'pending'
    });

    await passwordChangeRequest.save();

    res.json({ message: 'Password change request submitted successfully and is pending admin approval' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// Authentication Routes
// User Registration
app.post('/api/register', async (req, res) => {
  try {
    const { username, name, college, branch, email, number, password, profileImage, securityQuestions } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email or username' });
    }

    // Validate security questions
    if (!securityQuestions || securityQuestions.length !== 2) {
      return res.status(400).json({ message: 'Two security questions are required' });
    }

    for (const sq of securityQuestions) {
      if (!sq.question || !sq.answer) {
        return res.status(400).json({ message: 'All security questions and answers are required' });
      }
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Split name into firstName and lastName
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      college,
      branch,
      number,
      profileImage,
      securityQuestions,
      role: 'member',
      isActive: false,
      lastLogin: new Date(),
      loginStreak: 1,
      totalLogins: 1
    });

    await newUser.save();

    // Generate token
    const token = generateToken(newUser._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        college: newUser.college,
        branch: newUser.branch,
        number: newUser.number,
        bio: newUser.bio,
        profileImage: newUser.profileImage,
        lastLogin: newUser.lastLogin,
        loginStreak: newUser.loginStreak,
        totalLogins: newUser.totalLogins,
        role: newUser.role,
        isActive: newUser.isActive
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// User Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account not active. Please wait for admin approval.' });
    }

    // Check if 2FA is enabled and not temporarily disabled
    if (user.twoFactorEnabled && !user.twoFactorTemporarilyDisabled) {
      return res.json({
        message: '2FA required',
        requiresTwoFactor: true,
        email: user.email
      });
    }

    // Update login stats
    const now = new Date();
    const lastLogin = new Date(user.lastLogin);
    const daysSinceLastLogin = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));

    if (daysSinceLastLogin === 1) {
      user.loginStreak += 1;
    } else if (daysSinceLastLogin > 1) {
      user.loginStreak = 1;
    }

    user.lastLogin = now;
    user.totalLogins += 1;
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        profileImage: user.profileImage,
        lastLogin: user.lastLogin,
        loginStreak: user.loginStreak,
        totalLogins: user.totalLogins,
        role: user.role,
        isActive: user.isActive,
        twoFactorEnabled: user.twoFactorEnabled
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user profile
app.get('/api/profile', authenticateToken, checkActiveUser, async (req, res) => {
  try {
    res.json({
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      bio: req.user.bio,
      profileImage: req.user.profileImage,
      lastLogin: req.user.lastLogin,
      loginStreak: req.user.loginStreak,
      totalLogins: req.user.totalLogins,
      role: req.user.role,
      isActive: req.user.isActive,
      twoFactorEnabled: req.user.twoFactorEnabled,
      createdAt: req.user.createdAt
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user profile
app.post('/api/profile/update', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, bio, profileImage, college, branch, number } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, bio, profileImage, college, branch, number },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// OAuth Routes
// Google OAuth - Enhanced configuration check
const isGoogleConfigured = () => {
  const hasClientId = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id';
  const hasClientSecret = process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CLIENT_SECRET !== 'your-google-client-secret';
  const hasStrategy = passport._strategies && passport._strategies['google'];

  return hasClientId && hasClientSecret && hasStrategy;
};

if (isGoogleConfigured()) {
  console.log('✅ Google OAuth routes enabled successfully');

  app.get('/api/auth/google', (req, res, next) => {
    console.log('Google OAuth authentication initiated');
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
  });

  app.get('/api/auth/google/callback',
    (req, res, next) => {
      passport.authenticate('google', { failureRedirect: '/login' })(req, res, next);
    },
    async (req, res) => {
      try {
        // Check if user is active
        if (!req.user.isActive) {
          // User is not active, redirect to pending approval page
          const userData = encodeURIComponent(JSON.stringify({
            id: req.user._id,
            username: req.user.username,
            email: req.user.email,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            isActive: req.user.isActive
          }));
          res.redirect(`http://localhost:3000/pending-approval?user=${userData}`);
          return;
        }

        // Check if 2FA is enabled and not temporarily disabled
        if (req.user.twoFactorEnabled && !req.user.twoFactorTemporarilyDisabled) {
          // User needs 2FA verification
          const userData = encodeURIComponent(JSON.stringify({
            id: req.user._id,
            username: req.user.username,
            email: req.user.email,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            isActive: req.user.isActive,
            requiresTwoFactor: true
          }));
          res.redirect(`http://localhost:3000/login?oauth=true&user=${userData}`);
          return;
        }

        // User is active, proceed with normal login
        const token = generateToken(req.user._id);
        const userData = encodeURIComponent(JSON.stringify({
          id: req.user._id,
          username: req.user.username,
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          isActive: req.user.isActive
        }));
        res.redirect(`http://localhost:3000/?token=${token}&user=${userData}`);
      } catch (error) {
        console.error('Error in Google OAuth callback:', error);
        res.status(500).json({ message: 'Authentication error' });
      }
    }
  );
} else {
  console.warn('❌ Google OAuth routes disabled - configuration incomplete');

  app.get('/api/auth/google', (req, res) => {
    console.log('Google OAuth attempted but not configured');
    res.status(501).json({
      message: 'Google OAuth not configured. Please contact administrator to set up Google OAuth credentials.',
      configured: false
    });
  });

  app.get('/api/auth/google/callback', (req, res) => {
    console.log('Google OAuth callback attempted but not configured');
    res.status(501).json({
      message: 'Google OAuth not configured. Please contact administrator to set up Google OAuth credentials.',
      configured: false
    });
  });
}

if (passport._strategies['github']) {
  app.get('/api/auth/github', passport.authenticate('github', { scope: ['user:email', 'read:user'] }));

  app.get('/api/auth/github/callback',
    (req, res, next) => {
      passport.authenticate('github', (err, user, info) => {
        if (err) {
          console.error('GitHub OAuth Error:', err.message);
          // Redirect to login with error message
          const errorMessage = encodeURIComponent(err.message);
          return res.redirect(`http://localhost:3000/login?error=github&message=${errorMessage}`);
        }
        if (!user) {
          console.error('GitHub OAuth failed: No user returned');
          return res.redirect('http://localhost:3000/login?error=github&message=Authentication failed');
        }
        // Log the user in manually
        req.logIn(user, (err) => {
          if (err) {
            console.error('Error logging in user:', err);
            return next(err);
          }
          return next();
        });
      })(req, res, next);
    },
    async (req, res) => {
      try {
        console.log('GitHub OAuth successful for user:', req.user.email);

        // Check if user is active
        if (!req.user.isActive) {
          // User is not active, redirect to pending approval page
          const userData = encodeURIComponent(JSON.stringify({
            id: req.user._id,
            username: req.user.username,
            email: req.user.email,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            isActive: req.user.isActive
          }));
          res.redirect(`http://localhost:3000/pending-approval?user=${userData}`);
          return;
        }

        // Check if 2FA is enabled and not temporarily disabled
        if (req.user.twoFactorEnabled && !req.user.twoFactorTemporarilyDisabled) {
          // User needs 2FA verification
          const userData = encodeURIComponent(JSON.stringify({
            id: req.user._id,
            username: req.user.username,
            email: req.user.email,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            isActive: req.user.isActive,
            requiresTwoFactor: true
          }));
          res.redirect(`http://localhost:3000/login?oauth=true&user=${userData}`);
          return;
        }

        // User is active, proceed with normal login
        const token = generateToken(req.user._id);
        const userData = encodeURIComponent(JSON.stringify({
          id: req.user._id,
          username: req.user.username,
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          isActive: req.user.isActive
        }));
        res.redirect(`http://localhost:3000/?token=${token}&user=${userData}`);
      } catch (error) {
        console.error('Error in GitHub OAuth callback:', error);
        res.redirect('http://localhost:3000/login?error=github&message=Internal server error during authentication');
      }
    }
  );
} else {
  console.warn('❌ GitHub OAuth strategy not registered');
  app.get('/api/auth/github', (req, res) => {
    res.status(501).json({ message: 'GitHub OAuth not configured. Please contact administrator to set up GitHub OAuth credentials.' });
  });
  app.get('/api/auth/github/callback', (req, res) => {
    res.status(501).json({ message: 'GitHub OAuth not configured. Please contact administrator to set up GitHub OAuth credentials.' });
  });
}

// Custom LinkedIn OAuth Routes - Manual implementation using LinkedIn's REST API
if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_ID !== 'your-linkedin-client-id') {
  console.log('✅ Custom LinkedIn OAuth routes enabled');

  // Step 1: Initiate LinkedIn OAuth
  app.get('/api/auth/linkedin', (req, res) => {
    console.log('=== LinkedIn OAuth Initiation ===');

    // Generate a random state for CSRF protection
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Store state in session for verification
    req.session.linkedinState = state;

    // LinkedIn OAuth2 authorization URL
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
      `response_type=code&` +
      `client_id=${process.env.LINKEDIN_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent('http://localhost:5000/api/auth/linkedin/callback')}&` +
      `scope=${encodeURIComponent('openid profile email')}&` +
      `state=${state}`;

    console.log('Redirecting to LinkedIn OAuth URL');
    res.redirect(authUrl);
  });

  // Step 2: Handle LinkedIn OAuth callback
  app.get('/api/auth/linkedin/callback', async (req, res) => {
    try {
      console.log('=== LinkedIn OAuth Callback ===');
      console.log('Query params:', req.query);

      const { code, state, error, error_description } = req.query;

      // Check for errors from LinkedIn
      if (error) {
        console.error('LinkedIn OAuth error:', error, error_description);
        const errorMessage = encodeURIComponent(`LinkedIn OAuth failed: ${error_description || error}`);
        return res.redirect(`http://localhost:3000/login?error=linkedin&message=${errorMessage}`);
      }

      // Verify state parameter for CSRF protection
      if (!state || state !== req.session.linkedinState) {
        console.error('LinkedIn OAuth state mismatch');
        const errorMessage = encodeURIComponent('Security error: Invalid state parameter');
        return res.redirect(`http://localhost:3000/login?error=linkedin&message=${errorMessage}`);
      }

      if (!code) {
        console.error('No authorization code received from LinkedIn');
        const errorMessage = encodeURIComponent('No authorization code received');
        return res.redirect(`http://localhost:3000/login?error=linkedin&message=${errorMessage}`);
      }

      console.log('Authorization code received, exchanging for access token...');

      // Step 3: Exchange authorization code for access token
      const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: 'http://localhost:5000/api/auth/linkedin/callback',
          client_id: process.env.LINKEDIN_CLIENT_ID,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text();
        console.error('Failed to get access token:', errorData);
        const errorMessage = encodeURIComponent('Failed to obtain access token from LinkedIn');
        return res.redirect(`http://localhost:3000/login?error=linkedin&message=${errorMessage}`);
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      if (!accessToken) {
        console.error('No access token in response');
        const errorMessage = encodeURIComponent('No access token received from LinkedIn');
        return res.redirect(`http://localhost:3000/login?error=linkedin&message=${errorMessage}`);
      }

      console.log('Access token obtained successfully');

      // Step 4: Get user profile information
      console.log('Fetching user profile from LinkedIn...');

      const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!profileResponse.ok) {
        const errorData = await profileResponse.text();
        console.error('Failed to get user profile:', errorData);
        const errorMessage = encodeURIComponent('Failed to get user profile from LinkedIn');
        return res.redirect(`http://localhost:3000/login?error=linkedin&message=${errorMessage}`);
      }

      const profileData = await profileResponse.json();
      console.log('LinkedIn profile data received:', JSON.stringify(profileData, null, 2));

      // Extract user information
      const linkedinId = profileData.sub;
      const email = profileData.email;
      const firstName = profileData.given_name || '';
      const lastName = profileData.family_name || '';
      const displayName = profileData.name || `${firstName} ${lastName}`.trim();

      if (!linkedinId) {
        console.error('No LinkedIn ID found in profile');
        const errorMessage = encodeURIComponent('Unable to retrieve LinkedIn profile information');
        return res.redirect(`http://localhost:3000/login?error=linkedin&message=${errorMessage}`);
      }

      if (!email) {
        console.error('No email found in LinkedIn profile');
        const errorMessage = encodeURIComponent('Email is required for registration. Please ensure your LinkedIn account has an email address.');
        return res.redirect(`http://localhost:3000/login?error=linkedin&message=${errorMessage}`);
      }

      console.log('Extracted user data:', { linkedinId, email, displayName });

      // Step 5: Check if user exists or create new user
      let user = await User.findOne({ linkedinId: linkedinId });

      if (user) {
        console.log('✅ Existing user found with LinkedIn ID:', user.email);
      } else {
        // Check if user exists with this email
        user = await User.findOne({ email: email });

        if (user) {
          console.log('✅ Existing user found with email, updating LinkedIn ID');
          // Update user with LinkedIn ID
          user.linkedinId = linkedinId;
          await user.save();
        } else {
          // Create new user
          console.log('🆕 Creating new user from LinkedIn OAuth with email:', email);
          user = new User({
            linkedinId: linkedinId,
            username: displayName.replace(/\s+/g, '').toLowerCase() || `linkedin_${linkedinId}`,
            email: email,
            firstName: firstName,
            lastName: lastName,
            // Generate a random password for OAuth users
            password: Math.random().toString(36).slice(-8),
            isActive: false, // Require admin approval for OAuth users
            role: 'member'
          });

          await user.save();
          console.log('✅ New user created successfully from LinkedIn OAuth:', user.email);
        }
      }

      // Step 6: Handle user authentication and redirect
      if (!user.isActive) {
        // User is not active, redirect to pending approval page
        const userData = encodeURIComponent(JSON.stringify({
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isActive: user.isActive
        }));
        return res.redirect(`http://localhost:3000/pending-approval?user=${userData}`);
      }

      // User is active, proceed with normal login
      const authToken = generateToken(user._id);
      const userData = encodeURIComponent(JSON.stringify({
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive
      }));

      console.log('✅ LinkedIn OAuth successful, redirecting to frontend');
      res.redirect(`http://localhost:3000/?token=${authToken}&user=${userData}`);

    } catch (error) {
      console.error('❌ Error in LinkedIn OAuth callback:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);

      const errorMessage = encodeURIComponent('Internal server error during LinkedIn authentication');
      res.redirect(`http://localhost:3000/login?error=linkedin&message=${errorMessage}`);
    }
  });
} else {
  console.warn('❌ LinkedIn OAuth not configured - missing or invalid LINKEDIN_CLIENT_ID');
  app.get('/api/auth/linkedin', (req, res) => {
    res.status(501).json({ message: 'LinkedIn OAuth not configured. Please contact administrator to set up LinkedIn OAuth credentials.' });
  });
  app.get('/api/auth/linkedin/callback', (req, res) => {
    res.status(501).json({ message: 'LinkedIn OAuth not configured. Please contact administrator to set up LinkedIn OAuth credentials.' });
  });
}

// Existing API Routes
app.get('/api/about', async (req, res) => {
  try {
    const aboutData = await About.find();
    res.json(aboutData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin Routes - About Management
// Get all about entries (admin only)
app.get('/api/admin/about', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const aboutEntries = await About.find().sort({ createdAt: -1 });
    res.json(aboutEntries);
  } catch (error) {
    console.error('Error fetching about entries:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new about entry (admin only)
app.post('/api/admin/about', authenticateToken, checkAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, content, imageUrl } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : imageUrl;

    const newAboutEntry = new About({
      title,
      content,
      imageUrl: image
    });

    await newAboutEntry.save();
    res.status(201).json({ message: 'About entry created successfully', aboutEntry: newAboutEntry });
  } catch (error) {
    console.error('Error creating about entry:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update an existing about entry (admin only)
app.put('/api/admin/about/:id', authenticateToken, checkAdmin, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, imageUrl } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : imageUrl;

    const updatedAboutEntry = await About.findByIdAndUpdate(id, {
      title,
      content,
      imageUrl: image
    }, { new: true });

    if (!updatedAboutEntry) {
      return res.status(404).json({ message: 'About entry not found' });
    }

    res.json({ message: 'About entry updated successfully', aboutEntry: updatedAboutEntry });
  } catch (error) {
    console.error('Error updating about entry:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete an about entry (admin only)
app.delete('/api/admin/about/:id', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const aboutEntry = await About.findByIdAndDelete(id);

    if (!aboutEntry) {
      return res.status(404).json({ message: 'About entry not found' });
    }

    res.json({ message: 'About entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting about entry:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const eventsData = await Event.find();
    res.json(eventsData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single event by ID
app.get('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get team members
app.get('/api/team', async (req, res) => {
  try {
    const teamData = await Team.find();
    res.json(teamData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single project by ID
app.get('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin Routes - Project Management
// Get all projects (admin only)
app.get('/api/admin/projects', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new project (admin only)
app.post('/api/admin/projects', authenticateToken, checkAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, description, technologies, githubLink, liveDemo, image: imageUrl, author } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : imageUrl;

    // Parse technologies if it's a string
    let parsedTechnologies = [];
    if (technologies) {
      if (typeof technologies === 'string') {
        try {
          parsedTechnologies = JSON.parse(technologies);
        } catch (e) {
          // If JSON parsing fails, treat as comma-separated string
          parsedTechnologies = technologies.split(',').map(tech => tech.trim()).filter(tech => tech !== '');
        }
      } else if (Array.isArray(technologies)) {
        parsedTechnologies = technologies;
      }
    }

    const newProject = new Project({
      title,
      description,
      technologies: parsedTechnologies,
      githubUrl: githubLink,
      liveUrl: liveDemo,
      imageUrl: image,
      author,  // Added author field
      status: 'active',
    });

    await newProject.save();
    res.status(201).json({ message: 'Project created successfully', project: newProject });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update an existing project (admin only)
app.put('/api/admin/projects/:id', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, technologies, githubUrl, liveUrl, imageUrl, status, author } = req.body;

    const updatedProject = await Project.findByIdAndUpdate(id, {
      title,
      description,
      technologies,
      githubUrl,
      liveUrl,
      imageUrl,
      status,
      author,  // Added author field
    }, { new: true });

    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ message: 'Project updated successfully', project: updatedProject });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a project (admin only)
app.delete('/api/admin/projects/:id', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new project
app.post('/api/projects', async (req, res) => {
  try {
    const { title, description, technologies, githubUrl, liveUrl, imageUrl, status, author } = req.body;

    const newProject = new Project({
      title,
      description,
      technologies,
      githubUrl,
      liveUrl,
      imageUrl,
      status,
      author,  // Added author field
    });

    await newProject.save();
    res.status(201).json({ message: 'Project created successfully', project: newProject });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update an existing project
app.put('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, technologies, githubUrl, liveUrl, imageUrl, status, author } = req.body;

    const updatedProject = await Project.findByIdAndUpdate(id, {
      title,
      description,
      technologies,
      githubUrl,
      liveUrl,
      imageUrl,
      status,
      author,  // Added author field
    }, { new: true });

    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ message: 'Project updated successfully', project: updatedProject });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin Routes - Team Management
// Get all team members (admin only)
app.get('/api/admin/team', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const teamMembers = await Team.find();
    res.json(teamMembers);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new team member (admin only)
app.post('/api/admin/team', authenticateToken, checkAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, role, email, linkedinUrl, githubUrl, bio, image: imageUrl } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : imageUrl;

    const newTeamMember = new Team({
      name,
      role,
      email,
      linkedinUrl,
      githubUrl,
      bio,
      image
    });

    await newTeamMember.save();
    res.status(201).json({ message: 'Team member created successfully', teamMember: newTeamMember });
  } catch (error) {
    console.error('Error creating team member:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update an existing team member (admin only)
app.put('/api/admin/team/:id', authenticateToken, checkAdmin, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, email, linkedinUrl, githubUrl, bio, image: imageUrl } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : imageUrl;

    const updatedTeamMember = await Team.findByIdAndUpdate(id, {
      name,
      role,
      email,
      linkedinUrl,
      githubUrl,
      bio,
      image
    }, { new: true });

    if (!updatedTeamMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    res.json({ message: 'Team member updated successfully', teamMember: updatedTeamMember });
  } catch (error) {
    console.error('Error updating team member:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a team member (admin only)
app.delete('/api/admin/team/:id', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const teamMember = await Team.findByIdAndDelete(id);

    if (!teamMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    res.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    console.error('Error deleting team member:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all approved blog posts (public)
app.get('/api/blog-posts', async (req, res) => {
  try {
    const blogPosts = await Blog.find({ status: 'approved' }).populate('author', 'username firstName lastName');
    res.json(blogPosts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single approved blog post by ID (public)
app.get('/api/blog-posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const blogPost = await Blog.findOne({ _id: id, status: 'approved' }).populate('author', 'username firstName lastName');

    if (!blogPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    res.json(blogPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's own blog posts (authenticated users)
app.get('/api/user/blog-posts', authenticateToken, async (req, res) => {
  try {
    const blogPosts = await Blog.find({ author: req.user._id }).populate('author', 'username firstName lastName').populate('reviewedBy', 'username firstName lastName');
    res.json(blogPosts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new blog post (authenticated users)
app.post('/api/blog-posts', authenticateToken, checkActiveUser, upload.single('image'), async (req, res) => {
  try {
    const { title, content } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const newBlogPost = new Blog({
      title,
      content,
      image,
      author: req.user._id,
      status: 'pending',
      likes: [],
      dislikes: []
    });

    await newBlogPost.save();
    const populatedPost = await Blog.findById(newBlogPost._id).populate('author', 'username firstName lastName');
    res.status(201).json({ message: 'Blog post submitted successfully and is pending approval', blogPost: populatedPost });
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add a comment to a blog post
app.post('/api/blog-posts/:id/comments', authenticateToken, checkActiveUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const blogPost = await Blog.findById(id);
    if (!blogPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    const newComment = new Comment({
      content,
      author: req.user._id,
      blogPost: id,
      likes: [],
      dislikes: []
    });

    await newComment.save();
    res.status(201).json({ message: 'Comment added successfully', comment: newComment });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Like a blog post (public - allows non-authenticated users)
app.post('/api/blog-posts/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    let userId = null;
    let identifier = null;

    // Try to authenticate user if token is provided
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.userId);
        if (user) {
          userId = user._id;
          identifier = userId;
        }
      } catch (error) {
        // Token is invalid, continue as non-authenticated user
      }
    }

    // For non-authenticated users, use IP address
    if (!identifier) {
      const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
      identifier = `ip_${clientIP}`;
    }

    // Use MongoDB atomic operations for better performance
    const updateQuery = userId ?
      // For authenticated users
      {
        $addToSet: { likes: userId },
        $pull: { dislikes: userId }
      } :
      // For non-authenticated users
      {
        $addToSet: { likes: identifier },
        $pull: { dislikes: identifier }
      };

    const blogPost = await Blog.findByIdAndUpdate(
      id,
      updateQuery,
      { new: true, runValidators: false }
    );

    if (!blogPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Check if user liked/disliked
    const userLiked = blogPost.likes.some(like =>
      userId ? (like && like.toString() === userId.toString()) : like === identifier
    );
    const userDisliked = blogPost.dislikes.some(dislike =>
      userId ? (dislike && dislike.toString() === userId.toString()) : dislike === identifier
    );

    res.json({
      message: userLiked ? 'Blog post liked successfully' : 'Blog post unliked successfully',
      likesCount: blogPost.likes.length,
      dislikesCount: blogPost.dislikes.length,
      userLiked,
      userDisliked
    });
  } catch (error) {
    console.error('Error liking blog post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Dislike a blog post (public - allows non-authenticated users)
app.post('/api/blog-posts/:id/dislike', async (req, res) => {
  try {
    const { id } = req.params;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    let userId = null;
    let identifier = null;

    // Try to authenticate user if token is provided
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User.findById(decoded.userId);
        if (user) {
          userId = user._id;
          identifier = userId;
        }
      } catch (error) {
        // Token is invalid, continue as non-authenticated user
      }
    }

    // For non-authenticated users, use IP address
    if (!identifier) {
      const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
      identifier = `ip_${clientIP}`;
    }

    // Use MongoDB atomic operations for better performance
    const updateQuery = userId ?
      // For authenticated users
      {
        $addToSet: { dislikes: userId },
        $pull: { likes: userId }
      } :
      // For non-authenticated users
      {
        $addToSet: { dislikes: identifier },
        $pull: { likes: identifier }
      };

    const blogPost = await Blog.findByIdAndUpdate(
      id,
      updateQuery,
      { new: true, runValidators: false }
    );

    if (!blogPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    // Check if user liked/disliked
    const userLiked = blogPost.likes.some(like =>
      userId ? (like && like.toString() === userId.toString()) : like === identifier
    );
    const userDisliked = blogPost.dislikes.some(dislike =>
      userId ? (dislike && dislike.toString() === userId.toString()) : dislike === identifier
    );

    res.json({
      message: userDisliked ? 'Blog post disliked successfully' : 'Blog post undisliked successfully',
      likesCount: blogPost.likes.length,
      dislikesCount: blogPost.dislikes.length,
      userLiked,
      userDisliked
    });
  } catch (error) {
    console.error('Error disliking blog post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get comments for a blog post
app.get('/api/blog-posts/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await Comment.find({ blogPost: id }).populate('author', 'username firstName lastName').sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update an existing blog post (only by author, if still pending)
app.put('/api/blog-posts/:id', authenticateToken, checkActiveUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    const blogPost = await Blog.findById(id);
    if (!blogPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    if (blogPost.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own blog posts' });
    }

    if (blogPost.status !== 'pending') {
      return res.status(400).json({ message: 'You can only edit pending blog posts' });
    }

    const updatedBlogPost = await Blog.findByIdAndUpdate(id, {
      title,
      content,
    }, { new: true }).populate('author', 'username firstName lastName');

    res.json({ message: 'Blog post updated successfully', blogPost: updatedBlogPost });
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin Routes - Memory Management
// Get all memories (admin only)
app.get('/api/admin/memories', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const memories = await Memory.find().populate('author', 'username firstName lastName email');
    res.json(memories);
  } catch (error) {
    console.error('Error fetching memories:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new memory (admin only)
app.post('/api/admin/memories', authenticateToken, checkAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, imageUrl, eventDate, author } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : imageUrl;

    const newMemory = new Memory({
      title,
      imageUrl: image,
      eventDate: eventDate || new Date(),
      author: author || req.user._id
    });

    await newMemory.save();
    const populatedMemory = await Memory.findById(newMemory._id).populate('author', 'username firstName lastName email');
    res.status(201).json({ message: 'Memory created successfully', memory: populatedMemory });
  } catch (error) {
    console.error('Error creating memory:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update an existing memory (admin only)
app.put('/api/admin/memories/:id', authenticateToken, checkAdmin, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, imageUrl, eventDate, author } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : imageUrl;

    const updatedMemory = await Memory.findByIdAndUpdate(id, {
      title,
      imageUrl: image,
      eventDate,
      author
    }, { new: true }).populate('author', 'username firstName lastName email');

    if (!updatedMemory) {
      return res.status(404).json({ message: 'Memory not found' });
    }

    res.json({ message: 'Memory updated successfully', memory: updatedMemory });
  } catch (error) {
    console.error('Error updating memory:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a memory (admin only)
app.delete('/api/admin/memories/:id', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const memory = await Memory.findByIdAndDelete(id);

    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }

    res.json({ message: 'Memory deleted successfully' });
  } catch (error) {
    console.error('Error deleting memory:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin Routes - Blog Management
// Get all blog posts (admin only)
app.get('/api/admin/blog-posts', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const allPosts = await Blog.find().populate('author', 'username firstName lastName email').populate('reviewedBy', 'username firstName lastName').sort({ createdAt: -1 });
    res.json(allPosts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all pending blog posts (admin only)
app.get('/api/admin/blog-posts/pending', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const pendingPosts = await Blog.find({ status: 'pending' }).populate('author', 'username firstName lastName email');
    res.json(pendingPosts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve a blog post (admin only)
app.put('/api/admin/blog-posts/:id/approve', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewNote } = req.body;

    const updatedBlogPost = await Blog.findByIdAndUpdate(id, {
      status: 'approved',
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
      reviewNote: reviewNote || ''
    }, { new: true }).populate('author', 'username firstName lastName').populate('reviewedBy', 'username firstName lastName');

    if (!updatedBlogPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    res.json({ message: 'Blog post approved successfully', blogPost: updatedBlogPost });
  } catch (error) {
    console.error('Error approving blog post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reject a blog post (admin only)
app.put('/api/admin/blog-posts/:id/reject', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewNote } = req.body;

    const updatedBlogPost = await Blog.findByIdAndUpdate(id, {
      status: 'rejected',
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
      reviewNote: reviewNote || ''
    }, { new: true }).populate('author', 'username firstName lastName').populate('reviewedBy', 'username firstName lastName');

    if (!updatedBlogPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    res.json({ message: 'Blog post rejected', blogPost: updatedBlogPost });
  } catch (error) {
    console.error('Error rejecting blog post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a blog post (admin only)
app.delete('/api/admin/blog-posts/:id', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBlogPost = await Blog.findByIdAndDelete(id);

    if (!deletedBlogPost) {
      return res.status(404).json({ message: 'Blog post not found' });
    }

    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin Routes - User Management
// Get all users (admin only)
app.get('/api/admin/users', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Activate user account (admin only)
app.put('/api/admin/users/:id/activate', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(
      id,
      { isActive: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User activated successfully', user });
  } catch (error) {
    console.error('Error activating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Deactivate user account (admin only)
app.put('/api/admin/users/:id/deactivate', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deactivated successfully', user });
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete user account (admin only)
app.delete('/api/admin/users/:id', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (req.user._id.toString() === id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    // Delete all related data for this user
    await Blog.deleteMany({ author: id });
    await Comment.deleteMany({ author: id });
    await Memory.deleteMany({ author: id });
    await PasswordChangeRequest.deleteMany({ userId: id });

    // Finally, delete the user account
    await User.findByIdAndDelete(id);

    res.json({ message: 'User account deleted successfully' });
  } catch (error) {
    console.error('Error deleting user account:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete user account (authenticated users can delete their own account)
app.delete('/api/user/delete-account', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete all blog posts by this user
    await Blog.deleteMany({ author: userId });

    // Delete all comments by this user
    await Comment.deleteMany({ author: userId });

    // Delete all memories by this user
    await Memory.deleteMany({ author: userId });

    // Delete all password change requests by this user
    await PasswordChangeRequest.deleteMany({ userId });

    // Finally, delete the user account
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting user account:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all contacts
app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new contact
app.post('/api/contacts', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    const newContact = new Contact({
      name,
      email,
      message
    });

    await newContact.save();
    res.status(201).json({ message: 'Contact created successfully', contact: newContact });
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin Routes - Contact Management
// Get all contacts (admin only)
app.get('/api/admin/contacts', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a contact (admin only)
app.delete('/api/admin/contacts/:contactId', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const { contactId } = req.params;
    const contact = await Contact.findByIdAndDelete(contactId);

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all memories
app.get('/api/memories', async (req, res) => {
  try {
    const memories = await Memory.find();
    res.json(memories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new memory
app.post('/api/memories', authenticateToken, checkActiveUser, upload.single('image'), async (req, res) => {
  try {
    const { title, description } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const newMemory = new Memory({
      title,
      description,
      image,
      author: req.user._id
    });

    await newMemory.save();
    res.status(201).json({ message: 'Memory created successfully', memory: newMemory });
  } catch (error) {
    console.error('Error creating memory:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Password Change Request Routes
// Request password change (authenticated users)
app.post('/api/request-password-change', authenticateToken, checkActiveUser, async (req, res) => {
  try {
    console.log('=== Password Change Request Debug ===');
    console.log('User ID:', req.user._id);
    console.log('Request body:', { oldPassword: req.body.oldPassword ? '[PROVIDED]' : '[MISSING]', newPassword: req.body.newPassword ? '[PROVIDED]' : '[MISSING]' });

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      console.log('Missing required fields');
      return res.status(400).json({ message: 'Old password and new password are required' });
    }

    if (newPassword.length < 6) {
      console.log('New password too short');
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    // Verify old password
    console.log('Looking up user...');
    const user = await User.findById(req.user._id);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found, comparing passwords...');
    console.log('Stored password hash exists:', !!user.password);
    console.log('Old password provided length:', oldPassword.length);

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    console.log('Password comparison result:', isOldPasswordValid);

    if (!isOldPasswordValid) {
      console.log('Password verification failed');
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    console.log('Password verified successfully');

    // Check if there's already a pending request for this user
    console.log('Checking for existing pending requests...');
    const existingRequest = await PasswordChangeRequest.findOne({
      userId: req.user._id,
      status: 'pending'
    });

    if (existingRequest) {
      console.log('Existing pending request found');
      return res.status(400).json({ message: 'You already have a pending password change request' });
    }

    console.log('No existing pending request, proceeding...');

    // Hash the new password for storage
    console.log('Hashing new password...');
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Create password change request
    console.log('Creating password change request...');
    const passwordChangeRequest = new PasswordChangeRequest({
      userId: req.user._id,
      oldPassword: user.password, // Store current hashed password for reference
      newPassword: hashedNewPassword,
      status: 'pending'
    });

    await passwordChangeRequest.save();
    console.log('Password change request saved successfully');

    res.json({ message: 'Password change request submitted successfully and is pending admin approval' });
  } catch (error) {
    console.error('Error requesting password change:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin Routes - Password Change Request Management
// Get all password change requests (admin only)
app.get('/api/admin/password-change-requests', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const requests = await PasswordChangeRequest.find()
      .populate('userId', 'username firstName lastName email')
      .populate('reviewedBy', 'username firstName lastName')
      .sort({ requestedAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error('Error fetching password change requests:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get pending password change requests (admin only)
app.get('/api/admin/password-change-requests/pending', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const pendingRequests = await PasswordChangeRequest.find({ status: 'pending' })
      .populate('userId', 'username firstName lastName email')
      .sort({ requestedAt: -1 });
    res.json(pendingRequests);
  } catch (error) {
    console.error('Error fetching pending password change requests:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Approve password change request (admin only)
app.put('/api/admin/password-change-requests/:id/approve', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewNote } = req.body;

    const request = await PasswordChangeRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Password change request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request has already been processed' });
    }

    // Update user's password
    await User.findByIdAndUpdate(request.userId, {
      password: request.newPassword
    });

    // Update request status
    const updatedRequest = await PasswordChangeRequest.findByIdAndUpdate(id, {
      status: 'approved',
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
      reviewNote: reviewNote || ''
    }, { new: true })
      .populate('userId', 'username firstName lastName email')
      .populate('reviewedBy', 'username firstName lastName');

    res.json({ message: 'Password change request approved successfully', request: updatedRequest });
  } catch (error) {
    console.error('Error approving password change request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reject password change request (admin only)
app.put('/api/admin/password-change-requests/:id/reject', authenticateToken, checkAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewNote } = req.body;

    const request = await PasswordChangeRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: 'Password change request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request has already been processed' });
    }

    // Update request status
    const updatedRequest = await PasswordChangeRequest.findByIdAndUpdate(id, {
      status: 'rejected',
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
      reviewNote: reviewNote || ''
    }, { new: true })
      .populate('userId', 'username firstName lastName email')
      .populate('reviewedBy', 'username firstName lastName');

    res.json({ message: 'Password change request rejected', request: updatedRequest });
  } catch (error) {
    console.error('Error rejecting password change request:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Two-Factor Authentication Routes
// Enable 2FA - Generate secret and QR code
app.post('/api/2fa/enable', authenticateToken, checkActiveUser, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is already enabled for this account' });
    }

    // Generate a secret key
    const secret = speakeasy.generateSecret({
      name: `DivClub (${user.email})`,
      issuer: 'DivClub'
    });

    // Generate QR code URL
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

    // Store the secret temporarily (not yet enabled)
    user.twoFactorSecret = secret.base32;
    await user.save();

    res.json({
      message: '2FA setup initiated',
      secret: secret.base32,
      qrCodeUrl,
      otpauthUrl: secret.otpauth_url
    });
  } catch (error) {
    console.error('Error enabling 2FA:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify and enable 2FA
app.post('/api/2fa/verify', authenticateToken, checkActiveUser, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.twoFactorSecret) {
      return res.status(400).json({ message: '2FA setup not initiated' });
    }

    if (user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is already enabled' });
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow 2 time windows (30 seconds each)
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Generate backup codes
    const backupCodes = [];
    for (let i = 0; i < 10; i++) {
      backupCodes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }

    // Enable 2FA
    user.twoFactorEnabled = true;
    user.twoFactorBackupCodes = backupCodes;
    await user.save();

    res.json({
      message: '2FA has been successfully enabled',
      backupCodes: backupCodes
    });
  } catch (error) {
    console.error('Error verifying 2FA:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Disable 2FA
app.post('/api/2fa/disable', authenticateToken, checkActiveUser, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is not enabled for this account' });
    }

    // Verify the token before disabling
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    user.twoFactorBackupCodes = [];
    await user.save();

    res.json({ message: '2FA has been successfully disabled' });
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify 2FA code (for login)
app.post('/api/2fa/verify-login', async (req, res) => {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({ message: 'Email and verification token are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is not enabled for this account' });
    }

    // Check if it's a backup code first
    let isBackupCode = false;
    if (user.twoFactorBackupCodes && user.twoFactorBackupCodes.includes(token)) {
      // Remove the used backup code
      user.twoFactorBackupCodes = user.twoFactorBackupCodes.filter(code => code !== token);
      await user.save();
      isBackupCode = true;
    }

    // If not a backup code, verify TOTP
    if (!isBackupCode) {
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: token,
        window: 2
      });

      if (!verified) {
        return res.status(400).json({ message: 'Invalid verification code' });
      }
    }

    // Update login stats
    const now = new Date();
    const lastLogin = new Date(user.lastLogin);
    const daysSinceLastLogin = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));

    if (daysSinceLastLogin === 1) {
      user.loginStreak += 1;
    } else if (daysSinceLastLogin > 1) {
      user.loginStreak = 1;
    }

    user.lastLogin = now;
    user.totalLogins += 1;
    await user.save();

    // Generate token
    const authToken = generateToken(user._id);

    res.json({
      message: '2FA verification successful',
      token: authToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio,
        profileImage: user.profileImage,
        lastLogin: user.lastLogin,
        loginStreak: user.loginStreak,
        totalLogins: user.totalLogins,
        role: user.role,
        isActive: user.isActive,
        twoFactorEnabled: user.twoFactorEnabled
      }
    });
  } catch (error) {
    console.error('Error verifying 2FA login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get 2FA status
app.get('/api/2fa/status', authenticateToken, checkActiveUser, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('twoFactorEnabled twoFactorBackupCodes');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      twoFactorEnabled: user.twoFactorEnabled,
      backupCodesCount: user.twoFactorBackupCodes ? user.twoFactorBackupCodes.length : 0
    });
  } catch (error) {
    console.error('Error getting 2FA status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Regenerate backup codes
app.post('/api/2fa/regenerate-backup-codes', authenticateToken, checkActiveUser, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is not enabled for this account' });
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Generate new backup codes
    const backupCodes = [];
    for (let i = 0; i < 10; i++) {
      backupCodes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }

    user.twoFactorBackupCodes = backupCodes;
    await user.save();

    res.json({
      message: 'Backup codes regenerated successfully',
      backupCodes: backupCodes
    });
  } catch (error) {
    console.error('Error regenerating backup codes:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Temporarily disable 2FA
app.post('/api/2fa/temporary-disable', authenticateToken, checkActiveUser, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is not enabled for this account' });
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    // Temporarily disable 2FA
    user.twoFactorTemporarilyDisabled = true;
    await user.save();

    res.json({ message: '2FA temporarily disabled successfully' });
  } catch (error) {
    console.error('Error temporarily disabling 2FA:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Temporarily enable 2FA (re-enable after temporary disable)
app.post('/api/2fa/temporary-enable', authenticateToken, checkActiveUser, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ message: '2FA is not enabled for this account' });
    }

    // Re-enable 2FA (remove temporary disable)
    user.twoFactorTemporarilyDisabled = false;
    await user.save();

    res.json({ message: '2FA re-enabled successfully' });
  } catch (error) {
    console.error('Error re-enabling 2FA:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Export the app for Vercel serverless functions
export default app;

// For local development, start the server
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
