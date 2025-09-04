# Deployment Guide for Vercel

## Prerequisites
- Vercel account
- GitHub repository (recommended for automatic deployments)
- Environment variables from your developer

## Environment Variables Setup

In your Vercel dashboard, go to your project settings and add these environment variables:

### Required Variables
```
MONGODB_URI=mongodb+srv://ronitswarnavdas15:86PqbydKvgb2yF@clubdiv.pav6etl.mongodb.net/?retryWrites=true&w=majority&appName=clubdiv
SESSION_SECRET=VJxBSMy2yh1VhEDx56fX74IQCgi9sytP9NyTKaTMZ24=
JWT_SECRET=e13ce9dfc106c2823cca8f29e4d7c77b22de369f620f4215df081142e26e5cb092a077dad7b2910f33db44dc59c77002e83cde0f75366b8555d41420468a0190
```

### Optional OAuth Variables (if using social login)
```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
```

## Deployment Methods

### Method 1: Using Vercel CLI (Recommended)

1. Install Vercel CLI globally:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy your project:
```bash
vercel
```

4. Follow the prompts:
   - Link to existing project or create new
   - Set project name
   - Set root directory (press Enter for current)
   - Override settings? No

5. Your app will be deployed and you'll get a URL like `https://your-project.vercel.app`

### Method 2: Using GitHub Integration

1. Push your code to GitHub repository
2. Go to Vercel dashboard
3. Click "New Project"
4. Import your GitHub repository
5. Configure project settings:
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: npm run build --prefix frontend
   - Output Directory: frontend/build
   - Install Command: npm install

## Project Structure

Your project is configured as a full-stack application:
- **Backend**: Node.js/Express server (serverless on Vercel)
- **Frontend**: React app (static build)
- **Database**: MongoDB Atlas

## API Routes

All API routes are prefixed with `/api/`:
- `/api/register` - User registration
- `/api/login` - User login
- `/api/profile` - User profile
- `/api/projects` - Project management
- `/api/blog-posts` - Blog management
- `/api/admin/*` - Admin routes (require authentication)
- And many more...

## Testing Your Deployment

1. Visit your Vercel URL
2. Test user registration and login
3. Test different pages and routes
4. Check if API calls work properly
5. Verify file uploads and image serving

## Troubleshooting

### Common Issues:

1. **Environment Variables Not Set**: Make sure all required environment variables are set in Vercel dashboard

2. **MongoDB Connection Issues**: Verify MONGODB_URI is correct and accessible

3. **Build Failures**: Check that all dependencies are properly installed

4. **CORS Issues**: The backend is configured to handle CORS properly

5. **File Upload Issues**: Make sure the `/uploads` directory is accessible

### Logs and Debugging:

- Check Vercel dashboard for build and runtime logs
- Use browser developer tools to check network requests
- Test API endpoints directly using tools like Postman

## Production Considerations

1. **Security**: Ensure all sensitive data is in environment variables
2. **Database**: Use MongoDB Atlas for production database
3. **File Storage**: Consider using cloud storage (AWS S3, Cloudinary) for file uploads in production
4. **Monitoring**: Set up error monitoring and analytics
5. **Backup**: Regular database backups

## Support

If you encounter issues:
1. Check Vercel documentation: https://vercel.com/docs
2. Review build logs in Vercel dashboard
3. Test locally first before deploying
4. Ensure all environment variables are correctly set

## Quick Deploy Command

For future deployments after initial setup:
```bash
vercel --prod
