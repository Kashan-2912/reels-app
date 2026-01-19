import axios from 'axios';

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload service for images and videos
 * Supports both Cloudinary and direct backend uploads
 */

export const uploadService = {
  /**
   * Upload image(s) to Cloudinary
   * @param {File|File[]} files - Image file(s) to upload
   * @param {Function} onProgress - Callback for upload progress
   * @returns {Promise<Array>} Array of uploaded image data
   */
  async uploadImages(files, onProgress) {
    const fileArray = Array.isArray(files) ? files : [files];
    const uploadedImages = [];

    for (const file of fileArray) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          formData,
          {
            onUploadProgress: (progressEvent) => {
              if (onProgress) {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total
                );
                onProgress(percentCompleted);
              }
            },
          }
        );

        uploadedImages.push({
          url: response.data.secure_url,
          publicId: response.data.public_id,
          width: response.data.width,
          height: response.data.height,
        });
      } catch (error) {
        console.error('Image upload error:', error);
        throw new Error(`Failed to upload image: ${file.name}`);
      }
    }

    return uploadedImages;
  },

  /**
   * Upload video to Cloudinary
   * @param {File} file - Video file to upload
   * @param {Function} onProgress - Callback for upload progress
   * @returns {Promise<Object>} Uploaded video data
   */
  async uploadVideo(file, onProgress) {
    try {
      // Check video duration (max 5 minutes)
      const duration = await this.getVideoDuration(file);
      if (duration > 300) {
        throw new Error('Video must be less than 5 minutes');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('resource_type', 'video');
      formData.append('eager', 'w_400,h_300,c_pad|w_800,h_600,c_pad');
      formData.append('eager_async', true);

      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            if (onProgress) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(percentCompleted);
            }
          },
        }
      );

      return {
        url: response.data.secure_url,
        publicId: response.data.public_id,
        duration: response.data.duration,
        width: response.data.width,
        height: response.data.height,
        thumbnail: response.data.eager?.[0]?.secure_url,
      };
    } catch (error) {
      console.error('Video upload error:', error);
      throw new Error(`Failed to upload video: ${error.message}`);
    }
  },

  /**
   * Get video duration
   * @param {File} file - Video file
   * @returns {Promise<number>} Duration in seconds
   */
  async getVideoDuration(file) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };

      video.onerror = () => {
        reject(new Error('Invalid video file'));
      };

      video.src = URL.createObjectURL(file);
    });
  },

  /**
   * Compress image before upload
   * @param {File} file - Image file
   * @param {number} maxWidth - Max width in pixels
   * @param {number} maxHeight - Max height in pixels
   * @returns {Promise<Blob>} Compressed image blob
   */
  async compressImage(file, maxWidth = 1920, maxHeight = 1080) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => resolve(blob),
            'image/jpeg',
            0.85
          );
        };

        img.onerror = () => reject(new Error('Invalid image file'));
        img.src = e.target.result;
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  },

  /**
   * Validate image file
   * @param {File} file - Image file
   * @returns {Object} Validation result
   */
  validateImage(file) {
    const errors = [];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      errors.push('Invalid image format. Allowed: JPG, PNG, GIF, WebP');
    }

    if (file.size > maxSize) {
      errors.push('Image must be less than 5MB');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Validate video file
   * @param {File} file - Video file
   * @returns {Object} Validation result
   */
  validateVideo(file) {
    const errors = [];
    const maxSize = 100 * 1024 * 1024; // 100MB
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];

    if (!allowedTypes.includes(file.type)) {
      errors.push('Invalid video format. Allowed: MP4, MOV, AVI');
    }

    if (file.size > maxSize) {
      errors.push('Video must be less than 100MB');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  /**
   * Delete uploaded media from Cloudinary
   * @param {string} publicId - Public ID of the media
   * @param {string} resourceType - Type of resource (image or video)
   */
  async deleteMedia(publicId, resourceType = 'image') {
    try {
      // TODO: Implement backend endpoint to delete from Cloudinary
      // This requires API key which should not be exposed to frontend
      console.log(`Delete media: ${publicId}`);
    } catch (error) {
      console.error('Delete media error:', error);
      throw error;
    }
  },
};

export default uploadService;
