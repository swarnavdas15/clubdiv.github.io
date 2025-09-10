# Cloudinary API Implementation Plan

## Overview
The project already has basic Cloudinary integration for image uploads. This plan outlines enhancements to add comprehensive Cloudinary API features including image management, deletion, and optimization.

## Current Status
- ✅ Cloudinary configuration in `backend/config/cloudinary.js`
- ✅ Multer storage setup in `backend/utils/fileUpload.js`
- ✅ Basic upload middleware integrated in routes
- ✅ Dependencies installed (cloudinary, multer-storage-cloudinary)
- ✅ Cloudinary management API endpoints implemented:
  - `/api/admin/cloudinary/images` - List all uploaded images
  - `/api/admin/cloudinary/delete/:publicId` - Delete specific image
  - `/api/admin/cloudinary/bulk-delete` - Bulk delete images
  - `/api/cloudinary/upload` - General upload endpoint
  - `/api/admin/cloudinary/info/:publicId` - Get image info
  - `/api/admin/cloudinary/cleanup` - Cleanup orphaned images

## Implementation Steps

### 1. Create Cloudinary Utility Functions
- [x] Create `backend/utils/cloudinaryUtils.js` with functions for:
  - Image deletion from Cloudinary
  - Image transformation/optimization
  - Bulk image operations
  - Image metadata retrieval

### 2. Add Cloudinary Management API Endpoints
- [x] Add `/api/admin/cloudinary/images` - List all uploaded images
- [x] Add `/api/admin/cloudinary/delete/:publicId` - Delete specific image
- [x] Add `/api/admin/cloudinary/bulk-delete` - Bulk delete images
- [x] Add `/api/cloudinary/upload` - General upload endpoint
- [x] Add `/api/admin/cloudinary/info/:publicId` - Get image info
- [x] Add `/api/admin/cloudinary/cleanup` - Cleanup orphaned images

### 3. Update Existing Routes
- [x] Ensure all image upload routes use Cloudinary middleware
- [ ] Add image deletion when records are deleted from database
  - [ ] Update `/api/admin/about/:id` delete route to clean up images
  - [ ] Update `/api/admin/projects/:id` delete route to clean up images
  - [ ] Update `/api/admin/team/:id` delete route to clean up images
  - [ ] Update `/api/admin/memories/:id` delete route to clean up images
  - [ ] Update `/api/admin/blog-posts/:id` delete route to clean up images
  - [ ] Update `/api/admin/users/:id` delete route to clean up user images
  - [ ] Update `/api/user/delete-account` delete route to clean up user images
- [x] Update image URLs in database to use Cloudinary URLs
- [ ] Fix inconsistent image field naming across models
- [ ] Add imageUrl field to About model or update route logic

### 4. Add Image Optimization Features
- [ ] Implement automatic image resizing
- [ ] Add format conversion (WebP, AVIF)
- [ ] Add lazy loading support
- [ ] Implement responsive images

### 5. Error Handling and Validation
- [ ] Add proper error handling for Cloudinary API calls
- [ ] Validate image types and sizes
- [ ] Add rate limiting for upload endpoints

### 6. Documentation and Testing
- [ ] Update API documentation
- [ ] Add environment variable documentation
- [ ] Test all Cloudinary features
- [ ] Add integration tests

## Files to be Created/Modified
- `backend/utils/cloudinaryUtils.js` (new)
- `backend/server.js` (modify - add new routes)
- `backend/utils/fileUpload.js` (modify - enhance upload options)
- `backend/models/` (modify - ensure image URL fields are consistent)

## Environment Variables Required
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## Dependencies (Already Installed)
- `cloudinary: ^1.41.3`
- `multer-storage-cloudinary: ^4.0.0`
