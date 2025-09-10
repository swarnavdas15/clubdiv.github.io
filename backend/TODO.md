# TODO List for Making Backend Ready for Production

- [ ] Ensure environment variables are properly set for production (MONGODB_URI, SESSION_SECRET, JWT_SECRET, OAuth credentials)
- [ ] Verify MongoDB Atlas connection string is production-ready and secure
- [ ] Configure secure session management (consider secure cookies, HTTPS)
- [ ] Review and configure CORS policy for production domain(s)
- [ ] Enable logging and error monitoring for production
- [ ] Set up rate limiting and security middlewares (helmet, express-rate-limit)
- [ ] Review and secure all API endpoints (authentication, authorization)
- [ ] Ensure file uploads are properly handled and secured (Cloudinary config)
- [ ] Set NODE_ENV=production and verify app behavior accordingly
- [ ] Set up process manager (PM2 or similar) for production deployment
- [ ] Add health check endpoint for monitoring
- [ ] Test OAuth flows with production credentials
- [ ] Review and update password reset and 2FA flows for production readiness
- [ ] Remove any debug or verbose logging not suitable for production
- [ ] Prepare deployment scripts or instructions for production environment
