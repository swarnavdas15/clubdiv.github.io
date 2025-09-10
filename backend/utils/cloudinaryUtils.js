import cloudinary from '../config/cloudinary.js';

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary image URL
 * @returns {string|null} - Public ID or null if not found
 */
export const extractPublicId = (url) => {
  if (!url) return null;

  try {
    // Cloudinary URLs typically look like:
    // https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.{format}
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z]+$/);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
};

/**
 * Delete a single image from Cloudinary
 * @param {string} publicId - Public ID of the image to delete
 * @returns {Promise<Object>} - Cloudinary API response
 */
export const deleteImage = async (publicId) => {
  try {
    if (!publicId) {
      throw new Error('Public ID is required');
    }

    const result = await cloudinary.uploader.destroy(publicId);
    console.log('Image deleted from Cloudinary:', publicId, result);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

/**
 * Delete multiple images from Cloudinary
 * @param {string[]} publicIds - Array of public IDs to delete
 * @returns {Promise<Object[]>} - Array of Cloudinary API responses
 */
export const deleteImages = async (publicIds) => {
  try {
    if (!Array.isArray(publicIds) || publicIds.length === 0) {
      throw new Error('Public IDs array is required');
    }

    const deletePromises = publicIds.map(publicId => deleteImage(publicId));
    const results = await Promise.allSettled(deletePromises);

    const successful = results.filter(result => result.status === 'fulfilled');
    const failed = results.filter(result => result.status === 'rejected');

    console.log(`Bulk delete completed: ${successful.length} successful, ${failed.length} failed`);

    return results;
  } catch (error) {
    console.error('Error in bulk delete:', error);
    throw error;
  }
};

/**
 * Delete image from Cloudinary using URL
 * @param {string} imageUrl - Cloudinary image URL
 * @returns {Promise<Object>} - Cloudinary API response
 */
export const deleteImageByUrl = async (imageUrl) => {
  try {
    const publicId = extractPublicId(imageUrl);
    if (!publicId) {
      throw new Error('Could not extract public ID from URL');
    }

    return await deleteImage(publicId);
  } catch (error) {
    console.error('Error deleting image by URL:', error);
    throw error;
  }
};

/**
 * Get image metadata from Cloudinary
 * @param {string} publicId - Public ID of the image
 * @returns {Promise<Object>} - Image metadata
 */
export const getImageInfo = async (publicId) => {
  try {
    if (!publicId) {
      throw new Error('Public ID is required');
    }

    const result = await cloudinary.api.resource(publicId);
    return result;
  } catch (error) {
    console.error('Error getting image info:', error);
    throw error;
  }
};

/**
 * List all images in the Cloudinary account
 * @param {Object} options - Options for listing images
 * @returns {Promise<Object>} - List of images
 */
export const listImages = async (options = {}) => {
  try {
    const defaultOptions = {
      type: 'upload',
      prefix: 'divclub-uploads', // Our folder
      max_results: 100,
      ...options
    };

    const result = await cloudinary.api.resources(defaultOptions);
    return result;
  } catch (error) {
    console.error('Error listing images:', error);
    throw error;
  }
};

/**
 * Generate optimized image URL with transformations
 * @param {string} publicId - Public ID of the image
 * @param {Object} transformations - Transformation options
 * @returns {string} - Optimized image URL
 */
export const getOptimizedImageUrl = (publicId, transformations = {}) => {
  try {
    if (!publicId) {
      throw new Error('Public ID is required');
    }

    const defaultTransformations = {
      quality: 'auto',
      format: 'auto',
      ...transformations
    };

    return cloudinary.url(publicId, defaultTransformations);
  } catch (error) {
    console.error('Error generating optimized URL:', error);
    throw error;
  }
};

/**
 * Generate responsive image URLs
 * @param {string} publicId - Public ID of the image
 * @param {number[]} widths - Array of widths for responsive images
 * @returns {string[]} - Array of responsive image URLs
 */
export const getResponsiveImageUrls = (publicId, widths = [320, 640, 1024, 1920]) => {
  try {
    if (!publicId) {
      throw new Error('Public ID is required');
    }

    return widths.map(width => getOptimizedImageUrl(publicId, { width, crop: 'scale' }));
  } catch (error) {
    console.error('Error generating responsive URLs:', error);
    throw error;
  }
};

/**
 * Upload image buffer directly to Cloudinary
 * @param {Buffer} buffer - Image buffer
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Upload result
 */
export const uploadBuffer = async (buffer, options = {}) => {
  try {
    if (!buffer) {
      throw new Error('Buffer is required');
    }

    const defaultOptions = {
      folder: 'divclub-uploads',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
      ...options
    };

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(defaultOptions, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });

      stream.end(buffer);
    });
  } catch (error) {
    console.error('Error uploading buffer:', error);
    throw error;
  }
};

/**
 * Clean up orphaned images (images not referenced in database)
 * @param {string[]} usedImageUrls - Array of image URLs currently used in database
 * @returns {Promise<Object>} - Cleanup result
 */
export const cleanupOrphanedImages = async (usedImageUrls) => {
  try {
    // Get all images from Cloudinary
    const cloudinaryImages = await listImages();
    const cloudinaryUrls = cloudinaryImages.resources.map(img => img.secure_url);

    // Find orphaned images
    const usedPublicIds = usedImageUrls
      .map(url => extractPublicId(url))
      .filter(id => id !== null);

    const orphanedImages = cloudinaryImages.resources.filter(img =>
      !usedPublicIds.includes(img.public_id)
    );

    if (orphanedImages.length === 0) {
      return { message: 'No orphaned images found', deleted: 0 };
    }

    // Delete orphaned images
    const orphanedPublicIds = orphanedImages.map(img => img.public_id);
    await deleteImages(orphanedPublicIds);

    return {
      message: `Cleaned up ${orphanedImages.length} orphaned images`,
      deleted: orphanedImages.length,
      orphanedImages: orphanedPublicIds
    };
  } catch (error) {
    console.error('Error cleaning up orphaned images:', error);
    throw error;
  }
};
