import dotenv from 'dotenv';

// Load environment variables FIRST - CRITICAL for OAuth configuration
dotenv.config();

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';
import User from '../models/User.js';


// Google Strategy - Only initialize if client ID is configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id') {

  const googleStrategy = new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google OAuth callback triggered for user:', profile.displayName);
      // Check if user already exists with this Google ID
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
        console.log('Existing user found with Google ID');
        return done(null, user);
      }

      // Check if user exists with this email
      user = await User.findOne({ email: profile.emails[0].value });

      if (user) {
        console.log('Existing user found with email, updating Google ID');
        // Update user with Google ID
        user.googleId = profile.id;
        await user.save();
        return done(null, user);
      }

      console.log('Creating new user from Google OAuth');
      // Create new user
      user = new User({
        googleId: profile.id,
        username: profile.displayName,
        email: profile.emails[0].value,
        // Generate a random password for OAuth users
        password: Math.random().toString(36).slice(-8),
        isActive: false, // Require admin approval for OAuth users
        role: 'member'
      });

      await user.save();
      console.log('New user created successfully');
      return done(null, user);
    } catch (error) {
      console.error('Error in Google OAuth callback:', error);
      return done(error, null);
    }
  });

  passport.use('google', googleStrategy);
  console.log('Google OAuth strategy registered successfully');
} else {
  console.warn('Google OAuth strategy not initialized: Missing or invalid GOOGLE_CLIENT_ID');
}

// GitHub Strategy - Only initialize if client ID is configured
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_ID !== 'your-github-client-id') {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL || "http://localhost:5000/api/auth/github/callback",
    scope: ['user:email', 'read:user'] // Request email and user profile scopes
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('=== GitHub OAuth Debug Info ===');
      console.log('Username:', profile.username);
      console.log('Display Name:', profile.displayName);
      console.log('GitHub ID:', profile.id);
      console.log('Profile URL:', profile.profileUrl);
      console.log('Emails array:', JSON.stringify(profile.emails, null, 2));
      console.log('Raw profile:', JSON.stringify(profile._json, null, 2));

      // Check if user already exists with this GitHub ID
      let user = await User.findOne({ githubId: profile.id });

      if (user) {
        console.log('✅ Existing user found with GitHub ID:', user.email);
        return done(null, user);
      }

      // Check if user exists with this email (if provided)
      let emailToUse = null;
      if (profile.emails && profile.emails.length > 0) {
        // Find the first verified email or primary email
        const primaryEmail = profile.emails.find(email => email.primary) || profile.emails[0];
        if (primaryEmail && primaryEmail.value) {
          emailToUse = primaryEmail.value;
          console.log('📧 Using email from profile.emails:', emailToUse);
        }
      }

      // If no email from profile.emails, try to get it from profile._json
      if (!emailToUse && profile._json && profile._json.email) {
        emailToUse = profile._json.email;
        console.log('📧 Using email from profile._json:', emailToUse);
      }

      if (emailToUse) {
        user = await User.findOne({ email: emailToUse });

        if (user) {
          console.log('✅ Existing user found with email, updating GitHub ID');
          // Update user with GitHub ID
          user.githubId = profile.id;
          await user.save();
          return done(null, user);
        }
      }

      // If no email is provided, we can't create the user
      if (!emailToUse) {
        console.error('❌ No email provided by GitHub OAuth');
        console.error('Profile emails:', profile.emails);
        console.error('Profile _json:', profile._json);

        const errorMessage = `Email is required for registration. Please ensure your GitHub account has a public email address. ` +
          `Go to GitHub Settings > Emails and make sure you have at least one email address set as public.`;

        return done(new Error(errorMessage), null);
      }

      console.log('🆕 Creating new user from GitHub OAuth with email:', emailToUse);
      // Create new user
      user = new User({
        githubId: profile.id,
        username: profile.username || profile.displayName || `github_${profile.id}`,
        email: emailToUse,
        // Generate a random password for OAuth users
        password: Math.random().toString(36).slice(-8),
        isActive: false, // Require admin approval for OAuth users
        role: 'member'
      });

      await user.save();
      console.log('✅ New user created successfully from GitHub OAuth:', user.email);
      return done(null, user);
    } catch (error) {
      console.error('❌ Error in GitHub OAuth callback:', error);
      return done(error, null);
    }
  }));

  console.log('✅ GitHub OAuth strategy registered successfully');
} else {
  console.warn('❌ GitHub OAuth strategy not initialized: Missing or invalid GITHUB_CLIENT_ID');
}

// Custom LinkedIn OAuth Strategy - Manual implementation for better compatibility
if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_ID !== 'your-linkedin-client-id') {
  const LinkedInStrategy = {
    name: 'linkedin',
    authenticate: function(req, options) {
      // This will be handled by custom routes
    }
  };

  passport.use('linkedin', LinkedInStrategy);
  console.log('✅ Custom LinkedIn OAuth strategy registered successfully');
} else {
  console.warn('❌ LinkedIn OAuth strategy not initialized: Missing or invalid LINKEDIN_CLIENT_ID');
}

// Serialization and deserialization
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
