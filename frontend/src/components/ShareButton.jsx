'use client';

import React, { useState } from 'react';
import { FiShare2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ShareButton({ postId, title }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;
    setIsLoading(true);

    try {
      const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/post/${postId}`;
      
      if (navigator.share) {
        // Use native share on mobile
        await navigator.share({
          title: title || 'Check out this post',
          url: shareUrl,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        toast.error('Failed to share');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={isLoading}
      className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-500 transition disabled:opacity-50 group"
    >
      <FiShare2 size={20} className="group-hover:scale-110 transition" />
      <span className="text-sm font-medium">Share</span>
    </button>
  );
}
