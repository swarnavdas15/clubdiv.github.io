/**
 * Environment Variable Validation Utility
 * Ensures all required environment variables are present and valid for production
 */

const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'SESSION_SECRET'
];

const optionalEnvVars = [
  'PORT',
  'NODE_ENV',
  'LOG_LEVEL',
  'FRONTEND_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'LINKEDIN_CLIENT_ID',
  'LINKEDIN_CLIENT_SECRET',
  'EMAIL_USER',
  'EMAIL_PASS',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET'
];

/**
 * Validates required environment variables
 * @throws {Error} If any required environment variable is missing or invalid
 */
export function validateEnvironment() {
  const missing = [];
  const invalid = [];

  // Check required variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    } else {
      // Validate specific variables
      if (envVar === 'MONGODB_URI' && !isValidMongoUri(process.env[envVar])) {
        invalid.push(`${envVar} (invalid MongoDB URI)`);
      }
      if ((envVar === 'JWT_SECRET' || envVar === 'SESSION_SECRET') &&
          process.env[envVar].length < 32) {
        invalid.push(`${envVar} (must be at least 32 characters)`);
      }
    }
  }

  // Check OAuth configurations
  const googleConfigured = process.env.GOOGLE_CLIENT_ID &&
                          process.env.GOOGLE_CLIENT_SECRET &&
                          process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id';
  const githubConfigured = process.env.GITHUB_CLIENT_ID &&
                          process.env.GITHUB_CLIENT_SECRET &&
                          process.env.GITHUB_CLIENT_ID !== 'your-github-client-id';
  const linkedinConfigured = process.env.LINKEDIN_CLIENT_ID &&
                            process.env.LINKEDIN_CLIENT_SECRET &&
                            process.env.LINKEDIN_CLIENT_ID !== 'your-linkedin-client-id';

  if (!googleConfigured && !githubConfigured && !linkedinConfigured) {
    console.warn('⚠️  WARNING: No OAuth providers are properly configured. Users will not be able to authenticate via OAuth.');
  }

  // Report issues
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (invalid.length > 0) {
    throw new Error(`Invalid environment variables: ${invalid.join(', ')}`);
  }

  console.log('✅ Environment validation passed');
  console.log(`📊 OAuth Status: Google: ${googleConfigured ? '✅' : '❌'}, GitHub: ${githubConfigured ? '✅' : '❌'}, LinkedIn: ${linkedinConfigured ? '✅' : '❌'}`);
}

/**
 * Validates MongoDB URI format
 * @param {string} uri - MongoDB connection string
 * @returns {boolean} True if valid
 */
function isValidMongoUri(uri) {
  try {
    const url = new URL(uri);
    return url.protocol === 'mongodb:' || url.protocol === 'mongodb+srv:';
  } catch {
    return false;
  }
}

/**
 * Gets environment summary for logging
 * @returns {object} Environment summary
 */
export function getEnvironmentSummary() {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
    mongodbConfigured: !!process.env.MONGODB_URI,
    jwtConfigured: !!process.env.JWT_SECRET,
    sessionConfigured: !!process.env.SESSION_SECRET,
    oauthProviders: {
      google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'your-google-client-id'),
      github: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_ID !== 'your-github-client-id'),
      linkedin: !!(process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_ID !== 'your-linkedin-client-id')
    },
    cloudinaryConfigured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY),
    emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS)
  };
}

/**
 * Logs environment configuration (safely, without secrets)
 */
export function logEnvironmentConfig() {
  const summary = getEnvironmentSummary();

  console.log('\n🔧 Environment Configuration:');
  console.log(`   NODE_ENV: ${summary.nodeEnv}`);
  console.log(`   PORT: ${summary.port}`);
  console.log(`   MongoDB: ${summary.mongodbConfigured ? '✅' : '❌'}`);
  console.log(`   JWT: ${summary.jwtConfigured ? '✅' : '❌'}`);
  console.log(`   Session: ${summary.sessionConfigured ? '✅' : '❌'}`);
  console.log(`   OAuth - Google: ${summary.oauthProviders.google ? '✅' : '❌'}`);
  console.log(`   OAuth - GitHub: ${summary.oauthProviders.github ? '✅' : '❌'}`);
  console.log(`   OAuth - LinkedIn: ${summary.oauthProviders.linkedin ? '✅' : '❌'}`);
  console.log(`   Cloudinary: ${summary.cloudinaryConfigured ? '✅' : '❌'}`);
  console.log(`   Email: ${summary.emailConfigured ? '✅' : '❌'}\n`);
}
