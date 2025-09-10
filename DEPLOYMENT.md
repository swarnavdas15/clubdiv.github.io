# Deployment Guide for DivClub Project on Vercel

## Overview
This project consists of a backend Node.js Express API and a React frontend. The backend is deployed as a serverless function on Vercel, and the frontend is deployed as a static site.

## Vercel Configuration
- `vercel.json` is configured to:
  - Build and deploy `backend/server.js` using `@vercel/node`.
  - Build and deploy frontend React app from `frontend` directory using `@vercel/static-build`.
  - Route `/api/*` requests to backend serverless function.
  - Serve frontend app for all other routes.

## Environment Variables
Set the following environment variables in your Vercel project dashboard under Settings > Environment Variables:

- `MONGODB_URI` - Your MongoDB connection string (use a cloud-hosted MongoDB instance, e.g., MongoDB Atlas).
- `JWT_SECRET` - Secret key for JWT token signing.
- `SESSION_SECRET` - Secret key for Express session.
- `GOOGLE_CLIENT_ID` - Google OAuth client ID.
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret.
- `GOOGLE_CALLBACK_URL` - Google OAuth callback URL (e.g., `https://your-app.vercel.app/api/auth/google/callback`).
- `GITHUB_CLIENT_ID` - GitHub OAuth client ID.
- `GITHUB_CLIENT_SECRET` - GitHub OAuth client secret.
- `GITHUB_CALLBACK_URL` - GitHub OAuth callback URL (e.g., `https://your-app.vercel.app/api/auth/github/callback`).
- `LINKEDIN_CLIENT_ID` - LinkedIn OAuth client ID.
- `LINKEDIN_CLIENT_SECRET` - LinkedIn OAuth client secret.
- `EMAIL_USER` - Email username for sending emails (if used).
- `EMAIL_PASS` - Email password for sending emails (if used).
- `NODE_ENV` - Set to `production`.

## Backend Notes
- The backend listens on the port provided by `process.env.PORT`.
- MongoDB connection string must point to a production database accessible from Vercel.
- File uploads are stored in `backend/uploads` folder, which is ephemeral on Vercel serverless functions.
  - For production, consider using external storage (e.g., AWS S3, Cloudinary) for uploaded files.
- OAuth callback URLs should be updated to your deployed Vercel URL (e.g., `https://your-app.vercel.app/api/auth/google/callback`).

## Frontend Notes
- The frontend React app is built using `npm run build` in the `frontend` directory.
- The build output is served from `frontend/build`.
- API requests should be made to `/api/*` paths, which are proxied to the backend.

## Deployment Steps
1. Push your code to a Git repository (GitHub, GitLab, etc.).
2. Connect your repository to Vercel.
3. Set the environment variables in Vercel dashboard.
4. Deploy the project.
5. Verify OAuth callback URLs and update them in your OAuth provider dashboards.
6. Test the deployed app.

## Local Development
- Use `.env` file in `backend` directory for local environment variables.
- Run backend with `npm run dev` inside `backend` directory.
- Run frontend with `npm start` inside `frontend` directory.

## Additional Recommendations
- Move file uploads to external storage for persistence.
- Secure environment variables and secrets.
- Monitor logs and errors via Vercel dashboard.

---

This guide should help you deploy and run the DivClub project smoothly on Vercel.
