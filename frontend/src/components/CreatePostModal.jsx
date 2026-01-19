'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiUpload, FiX, FiArrowLeft, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { postService, uploadService } from '@/src/services';

const FILTERS = {
  Aden: { hueRotate: 280, saturate: 1.2, sepia: 0.2 },
  Clarendon: { saturate: 1.35, contrast: 1.2 },
  Crema: { saturate: 1.1, brightness: 1.08 },
  Gingham: { hueRotate: 350, contrast: 1.05 },
  Juno: { saturate: 1.1, brightness: 1.02 },
  Lark: { saturate: 0.8, brightness: 1.08 },
  Ludwig: { saturate: 0.8, brightness: 1.05 },
  Moon: { grayscale: 1, contrast: 1.1, brightness: 1.1 },
  Original: {},
  Perpetua: { saturate: 1.1, brightness: 0.95 },
  Reyes: { sepia: 0.22, brightness: 1.1, contrast: 0.85 },
  Slumber: { saturate: 1.2, brightness: 0.95 },
};

export default function CreatePostModal({ onClose, isOpen = true }) {
  const [stage, setStage] = useState('upload'); // upload, edit
  const [mediaFiles, setMediaFiles] = useState([]); // array of files for multiple images
  const [mediaPreviews, setMediaPreviews] = useState([]); // array of previews
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [mediaType, setMediaType] = useState(null); // image or video
  const [isSharing, setIsSharing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Edit state
  const [editTab, setEditTab] = useState('filters'); // filters, adjustments
  const [currentFilter, setCurrentFilter] = useState('Original');
  const [adjustments, setAdjustments] = useState({
    brightness: 0,
    contrast: 0,
    fade: 0,
    saturation: 0,
    temperature: 0,
    vignette: 0,
  });
  const [postCaption, setPostCaption] = useState('');

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const firstFile = fileArray[0];
    const isVideo = firstFile.type.startsWith('video/');
    const isImage = firstFile.type.startsWith('image/');

    if (!isVideo && !isImage) {
      toast.error('Please select an image or video');
      return;
    }

    // For video, only allow single file
    if (isVideo) {
      setMediaFiles([firstFile]);
      setMediaType('video');
      const reader = new FileReader();
      reader.onload = (ev) => {
        setMediaPreviews([ev.target?.result]);
      };
      reader.readAsDataURL(firstFile);
      setStage('edit');
      return;
    }

    // For images, allow multiple
    const imageFiles = fileArray.filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      toast.error('Please select valid images');
      return;
    }

    setMediaFiles(imageFiles);
    setMediaType('image');

    // Generate previews for all images
    const previewPromises = imageFiles.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target?.result);
          reader.readAsDataURL(file);
        })
    );

    Promise.all(previewPromises).then((previews) => {
      setMediaPreviews(previews);
      setCurrentPreviewIndex(0);
      setStage('edit');
    });
  };

  const handleDragDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      const fakeEvent = { target: { files: e.dataTransfer.files } };
      handleFileSelect(fakeEvent);
    }
  };

  const applyFilters = (filterName) => {
    if (mediaType !== 'image') return;
    setCurrentFilter(filterName);
  };

  const handleAdjustmentChange = (key, value) => {
    setAdjustments((prev) => ({ ...prev, [key]: value }));
  };

  const getFilterStyle = () => {
    const filter = FILTERS[currentFilter] || {};
    const styles = {
      filter: [
        filter.hueRotate ? `hue-rotate(${filter.hueRotate}deg)` : '',
        filter.saturate ? `saturate(${filter.saturate})` : '',
        filter.sepia ? `sepia(${filter.sepia})` : '',
        filter.contrast ? `contrast(${filter.contrast})` : '',
        filter.brightness ? `brightness(${filter.brightness})` : '',
        filter.grayscale ? `grayscale(${filter.grayscale})` : '',
      ]
        .filter(Boolean)
        .join(' '),
      ...getAdjustmentStyles(),
    };
    return styles;
  };

  const getAdjustmentStyles = () => {
    const filterParts = [];
    if (adjustments.brightness !== 0)
      filterParts.push(`brightness(${1 + adjustments.brightness / 100})`);
    if (adjustments.contrast !== 0)
      filterParts.push(`contrast(${1 + adjustments.contrast / 100})`);
    if (adjustments.fade !== 0)
      filterParts.push(`opacity(${1 - adjustments.fade / 100})`);
    if (adjustments.saturation !== 0)
      filterParts.push(`saturate(${1 + adjustments.saturation / 100})`);
    if (adjustments.temperature !== 0) {
      const temp = adjustments.temperature;
      filterParts.push(
        temp > 0
          ? `sepia(${Math.min(temp / 100, 1)})`
          : `hue-rotate(${temp}deg)`
      );
    }
    if (adjustments.vignette !== 0) {
      filterParts.push(`drop-shadow(0 0 ${adjustments.vignette}px rgba(0,0,0,0.5))`);
    }

    return {
      filter: filterParts.join(' ') || 'none',
    };
  };

  const handleShare = async () => {
    if (mediaFiles.length === 0) {
      toast.error('Please select media');
      return;
    }

    if (!postCaption.trim()) {
      toast.error('Please add a description');
      return;
    }

    try {
      setIsSharing(true);

      let payload;
      if (mediaType === 'video') {
        const uploaded = await uploadService.uploadVideo(mediaFiles[0]);
        if (!uploaded?.url) {
          toast.error('Failed to upload video');
          return;
        }
        payload = { description: postCaption.trim(), video: uploaded.url };
      } else {
        // Upload all images
        const uploadedImages = await uploadService.uploadImages(mediaFiles);
        const photoUrls = uploadedImages.map((img) => img.url).filter(Boolean);
        if (photoUrls.length === 0) {
          toast.error('Failed to upload images');
          return;
        }
        payload = { description: postCaption.trim(), photos: photoUrls };
      }

      await postService.createPost(payload);
      setShowSuccess(true);

      // Auto-close after success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error sharing post:', error);
      toast.error(error.response?.data?.message || 'Failed to create post');
    } finally {
      setIsSharing(false);
    }
  };

  if (!isOpen || !isMounted) return null;

  const modalContent = showSuccess ? (
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#111] border border-neutral-800 rounded-2xl shadow-2xl p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-pink-500 to-red-500 flex items-center justify-center">
          <FiCheck className="text-4xl text-white" />
        </div>
        <h2 className="text-2xl font-semibold text-white mb-2">
          {mediaType === 'video' ? 'Reel posted!' : 'Post shared!'}
        </h2>
        <p className="text-gray-400">
          Your {mediaType === 'video' ? 'reel' : 'post'} has been shared.
        </p>
      </div>
    </div>
  ) : (
    <div className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center px-4">
      <div className="w-full max-w-4xl bg-[#111] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        {stage === 'upload' ? (
          <UploadStage
            onFileSelect={handleFileSelect}
            onDragDrop={handleDragDrop}
            onClose={onClose}
          />
        ) : (
          <EditStage
            mediaPreviews={mediaPreviews}
            currentPreviewIndex={currentPreviewIndex}
            setCurrentPreviewIndex={setCurrentPreviewIndex}
            mediaType={mediaType}
            editTab={editTab}
            setEditTab={setEditTab}
            currentFilter={currentFilter}
            applyFilters={applyFilters}
            adjustments={adjustments}
            handleAdjustmentChange={handleAdjustmentChange}
            getFilterStyle={getFilterStyle}
            postCaption={postCaption}
            setPostCaption={setPostCaption}
            onBack={() => {
              setStage('upload');
              setMediaFiles([]);
              setMediaPreviews([]);
              setCurrentPreviewIndex(0);
              setMediaType(null);
              setCurrentFilter('Original');
              setAdjustments({
                brightness: 0,
                contrast: 0,
                fade: 0,
                saturation: 0,
                temperature: 0,
                vignette: 0,
              });
              setPostCaption('');
            }}
            onShare={handleShare}
            isSharing={isSharing}
          />
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

function UploadStage({ onFileSelect, onDragDrop, onClose }) {
  return (
    <div>
      <div className="flex items-center justify-between p-4 border-b border-neutral-800">
        <h2 className="text-xl font-semibold text-white">Create new post</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition"
        >
          <FiX size={24} />
        </button>
      </div>

      <div
        className="p-16 text-center min-h-96 flex flex-col items-center justify-center"
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add('bg-neutral-900');
        }}
        onDragLeave={(e) => {
          e.currentTarget.classList.remove('bg-neutral-900');
        }}
        onDrop={onDragDrop}
      >
        <div className="space-y-6">
          <div className="flex justify-center">
            <FiUpload className="text-6xl text-gray-600" />
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-white mb-2">
              Drag photos and videos here
            </h3>
            <p className="text-gray-400">Select from computer</p>
          </div>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={onFileSelect}
            className="hidden"
            id="media-input"
            multiple={true}
          />
          <label
            htmlFor="media-input"
            className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg cursor-pointer transition"
          >
            Select from computer
          </label>
        </div>
      </div>
    </div>
  );
}

function EditStage({
  mediaPreviews,
  currentPreviewIndex,
  setCurrentPreviewIndex,
  mediaType,
  editTab,
  setEditTab,
  currentFilter,
  applyFilters,
  adjustments,
  handleAdjustmentChange,
  getFilterStyle,
  postCaption,
  setPostCaption,
  onBack,
  onShare,
  isSharing,
}) {
  const hasMultiplePreviews = mediaPreviews.length > 1;

  return (
    <div>
      <div className="flex items-center justify-between p-4 border-b border-neutral-800">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white transition flex items-center gap-2"
        >
          <FiArrowLeft size={20} />
          Back
        </button>
        <h2 className="text-xl font-semibold text-white">Edit</h2>
        <span className="text-sm text-gray-400">Next →</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Media Preview */}
        <div className="bg-black p-4 flex items-center justify-center min-h-96 relative">
          {mediaType === 'video' ? (
            <video
              src={mediaPreviews[0]}
              controls
              className="w-full h-full object-contain max-h-96"
            />
          ) : (
            <img
              src={mediaPreviews[currentPreviewIndex]}
              alt={`Preview ${currentPreviewIndex + 1}`}
              style={getFilterStyle()}
              className="w-full h-full object-contain max-h-96"
            />
          )}

          {/* Navigation for multiple images */}
          {mediaType === 'image' && hasMultiplePreviews && (
            <>
              <div className="absolute top-6 right-6 bg-black/70 text-white px-2 py-1 rounded text-sm">
                {currentPreviewIndex + 1} / {mediaPreviews.length}
              </div>
              <button
                type="button"
                onClick={() =>
                  setCurrentPreviewIndex(
                    (prev) => (prev - 1 + mediaPreviews.length) % mediaPreviews.length
                  )
                }
                className="absolute left-6 top-1/2 -translate-y-1/2 bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center"
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={() =>
                  setCurrentPreviewIndex((prev) => (prev + 1) % mediaPreviews.length)
                }
                className="absolute right-6 top-1/2 -translate-y-1/2 bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center"
                aria-label="Next image"
              >
                ›
              </button>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1">
                {mediaPreviews.map((_, index) => (
                  <span
                    key={index}
                    className={`h-1.5 w-1.5 rounded-full ${
                      index === currentPreviewIndex ? 'bg-white' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Edit Controls */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-96">
          {/* Tabs */}
          {mediaType === 'image' && (
            <div className="flex gap-4 border-b border-neutral-800 pb-3">
              <button
                onClick={() => setEditTab('filters')}
                className={`px-4 py-2 text-sm font-semibold transition ${
                  editTab === 'filters'
                    ? 'text-white border-b-2 border-white -mb-3'
                    : 'text-gray-400'
                }`}
              >
                Filters
              </button>
              <button
                onClick={() => setEditTab('adjustments')}
                className={`px-4 py-2 text-sm font-semibold transition ${
                  editTab === 'adjustments'
                    ? 'text-white border-b-2 border-white -mb-3'
                    : 'text-gray-400'
                }`}
              >
                Adjustments
              </button>
            </div>
          )}

          {/* Filters Tab */}
          {mediaType === 'image' && editTab === 'filters' && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {Object.keys(FILTERS).map((filterName) => (
                  <button
                    key={filterName}
                    onClick={() => applyFilters(filterName)}
                    className={`p-2 rounded-lg text-xs font-semibold transition ${
                      currentFilter === filterName
                        ? 'bg-blue-500 text-white'
                        : 'bg-neutral-900 text-gray-300 hover:bg-neutral-800'
                    }`}
                  >
                    {filterName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Adjustments Tab */}
          {mediaType === 'image' && editTab === 'adjustments' && (
            <div className="space-y-4">
              {Object.entries(adjustments).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <label className="text-sm font-semibold text-gray-300 capitalize">
                    {key}
                  </label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={value}
                    onChange={(e) =>
                      handleAdjustmentChange(key, parseInt(e.target.value))
                    }
                    className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="text-xs text-gray-500">{value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Caption */}
          <div className="space-y-2 mt-6 pt-6 border-t border-neutral-800">
            <label className="text-sm font-semibold text-gray-300">Caption</label>
            <textarea
              value={postCaption}
              onChange={(e) => setPostCaption(e.target.value)}
              placeholder="Add a description..."
              maxLength={2200}
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="text-xs text-gray-500">
              {postCaption.length} / 2200
            </div>
          </div>

          {/* Share Button */}
          <button
            onClick={onShare}
            disabled={isSharing || !postCaption.trim()}
            className={`w-full py-3 rounded-lg font-semibold text-white transition ${
              isSharing || !postCaption.trim()
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isSharing ? 'Sharing...' : 'Share'}
          </button>
        </div>
      </div>
    </div>
  );
}
