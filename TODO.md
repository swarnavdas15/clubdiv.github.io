# Vercel Deployment Preparation Checklist

## ✅ Completed Tasks
- [x] Created comprehensive DEPLOYMENT.md guide
- [x] Verified backend/server.js is properly configured for Vercel (exports app, uses process.env.PORT)
- [x] Verified frontend/package.json has correct build script
- [x] Verified vercel.json configuration is correct
- [x] Created .env template with all required environment variables
- [x] Updated OAuth callback URLs to use environment variables (Google & GitHub)
- [x] Updated frontend API calls to use relative URLs for production

## 🔄 In Progress Tasks
- [ ] Configure production MongoDB connection (MongoDB Atlas recommended)
- [ ] Set up production file storage (AWS S3 or similar for uploaded files)

## 📋 Remaining Tasks

### Environment Configuration
- [ ] Set up MongoDB Atlas database and get connection string
- [ ] Configure Google OAuth credentials in Google Cloud Console
- [ ] Configure GitHub OAuth app and get client credentials
- [ ] Configure LinkedIn OAuth app and get client credentials
- [ ] Set up email service credentials (if using email features)
- [ ] Generate secure JWT_SECRET and SESSION_SECRET

### Code Updates
- [ ] Update OAuth callback URLs in passport.js to use environment variables
- [ ] Replace hardcoded localhost URLs in frontend with relative paths
- [ ] Configure CORS properly for production domain
- [ ] Update file upload handling for production (consider external storage)

### Deployment Steps
- [ ] Push code to Git repository (GitHub/GitLab)
- [ ] Connect repository to Vercel
- [ ] Configure environment variables in Vercel dashboard
- [ ] Deploy the application
- [ ] Test all functionality in production
- [ ] Update OAuth app callback URLs with production domain

### Production Optimizations
- [ ] Set up proper error logging and monitoring
- [ ] Configure rate limiting for API endpoints
- [ ] Set up backup strategy for database
- [ ] Configure SSL/TLS certificates (handled by Vercel)
- [ ] Set up CDN for static assets (handled by Vercel)

## 🚨 Critical Issues to Address

### OAuth Callback URLs
Currently hardcoded in backend/config/passport.js:
- Google: `http://localhost:5000/api/auth/google/callback`
- GitHub: `http://localhost:5000/api/auth/github/callback`
- LinkedIn: `http://localhost:5000/api/auth/linkedin/callback`

Need to make these configurable via environment variables.

### Frontend API Calls
Frontend likely has hardcoded localhost URLs for API calls that need to be updated for production.

### File Storage
Uploaded files are stored locally in `backend/uploads/` which won't persist on Vercel serverless functions. Need external storage solution.

## 🔧 Quick Fixes Needed

1. **Update OAuth Callbacks**: Make callback URLs configurable
2. **Frontend API URLs**: Use relative paths or environment variables
3. **File Storage**: Implement cloud storage for uploads
4. **Environment Variables**: Ensure all required vars are set in Vercel

## 📝 Notes
- Vercel automatically handles SSL certificates
- Serverless functions have execution time limits (15 seconds for free tier)
- File system is ephemeral - don't rely on local file storage
- Environment variables must be set in Vercel dashboard, not in .env file
