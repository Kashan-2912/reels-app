'use client';

import React, { useState } from 'react';
import { FiX, FiUpload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { postService } from '@/src/services';

export default function CreatePostModal({ isOpen, onClose }) {
  const [caption, setCaption] = useState('');
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [photos, setPhotos] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotos((prev) => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Only video files are allowed');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setVideoPreviews([event.target.result]);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const clearVideo = () => {
    setVideoPreviews([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description.trim()) {
      toast.error('Please add a description');
      return;
    }

    if (photos.length === 0 && videoPreviews.length === 0) {
      toast.error('Please upload at least one photo or video');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('description', description);
      formData.append('caption', caption);

      if (hashtags) {
        const tags = hashtags
          .split(' ')
          .filter((tag) => tag.startsWith('#'))
          .map((tag) => tag.toLowerCase());
        formData.append('hashtags', JSON.stringify(tags));
      }

      // Add photos/videos to FormData
      photos.forEach((photo, index) => {
        // Convert data URL to Blob if needed
        if (photo.startsWith('data:')) {
          const arr = photo.split(',');
          const mime = arr[0].match(/:(.*?);/)[1];
          const bstr = atob(arr[1]);
          const n = bstr.length;
          const u8arr = new Uint8Array(n);
          for (let i = 0; i < n; i++) {
            u8arr[i] = bstr.charCodeAt(i);
          }
          formData.append('photos', new Blob([u8arr], { type: mime }), `photo-${index}.jpg`);
        }
      });

      videoPreviews.forEach((video, index) => {
        if (video.startsWith('data:')) {
          const arr = video.split(',');
          const mime = arr[0].match(/:(.*?);/)[1];
          const bstr = atob(arr[1]);
          const n = bstr.length;
          const u8arr = new Uint8Array(n);
          for (let i = 0; i < n; i++) {
            u8arr[i] = bstr.charCodeAt(i);
          }
          formData.append('video', new Blob([u8arr], { type: mime }), `video-${index}.mp4`);
        }
      });

      await postService.createPost(formData);
      toast.success('Post created successfully!');
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error(error.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCaption('');
    setDescription('');
    setHashtags('');
    setPhotos([]);
    setVideoPreviews([]);
  };

  const handleClose = () => {
    if (photos.length > 0 || videoPreviews.length > 0 || description.trim() || caption.trim()) {
      if (!window.confirm('Discard post? Changes will not be saved.')) {
        return;
      }
    }
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-2xl max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <h2 className="text-xl font-bold text-black dark:text-white">Create Post</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Caption */}
          <div>
            <label className="block text-sm font-semibold text-black dark:text-white mb-2">
              Caption (Optional)
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Give your post a catchy caption..."
              maxLength="100"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="text-xs text-gray-500 mt-1">{caption.length}/100</div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-black dark:text-white mb-2">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us what this post is about..."
              rows="5"
              maxLength="2000"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="text-xs text-gray-500 mt-1">{description.length}/2000</div>
          </div>

          {/* Hashtags */}
          <div>
            <label className="block text-sm font-semibold text-black dark:text-white mb-2">
              Hashtags (Optional)
            </label>
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              placeholder="Add hashtags separated by space (e.g., #photography #nature #vibes)"
              maxLength="200"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {hashtags && (
              <div className="flex flex-wrap gap-2 mt-2">
                {hashtags
                  .split(' ')
                  .filter((tag) => tag.startsWith('#'))
                  .map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded text-xs">
                      {tag}
                    </span>
                  ))}
              </div>
            )}
          </div>

          {/* Media Upload */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-black dark:text-white mb-2">
              Media (Upload photos or video) *
            </label>

            {/* Photo Upload */}
            <div className="space-y-2">
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  disabled={videoPreviews.length > 0}
                  className="hidden"
                />
                <div
                  className={`flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer transition ${
                    videoPreviews.length > 0
                      ? 'border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed'
                      : 'border-red-500 hover:bg-red-50 dark:hover:bg-red-950'
                  }`}
                >
                  <FiUpload size={20} className="text-red-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {videoPreviews.length > 0 ? 'Cannot add photos with video' : 'Click to upload photos'}
                  </span>
                </div>
              </label>
            </div>

            {/* Video Upload */}
            <div className="space-y-2">
              <label className="block">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  disabled={photos.length > 0}
                  className="hidden"
                />
                <div
                  className={`flex items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer transition ${
                    photos.length > 0
                      ? 'border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed'
                      : 'border-red-500 hover:bg-red-50 dark:hover:bg-red-950'
                  }`}
                >
                  <FiUpload size={20} className="text-red-500" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {photos.length > 0 ? 'Cannot add video with photos' : 'Click to upload video'}
                  </span>
                </div>
              </label>
            </div>

            {/* Photos Preview */}
            {photos.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Photos ({photos.length})
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img
                        src={photo}
                        alt={`Preview ${index}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Video Preview */}
            {videoPreviews.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Video</p>
                <div className="relative group aspect-video">
                  <video
                    src={videoPreviews[0]}
                    controls
                    className="w-full h-full object-cover rounded-lg bg-black"
                  />
                  <button
                    type="button"
                    onClick={clearVideo}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !description.trim() || (photos.length === 0 && videoPreviews.length === 0)}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg transition font-semibold"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
