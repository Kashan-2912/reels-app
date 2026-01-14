'use client';

import React, { useState } from 'react';
import { FiBookmark } from 'react-icons/fi';
import { FaBookmark } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function SaveButton({ postId, isSaved: initialSaved }) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      // if (isSaved) {
      //   await postService.unsavePost(postId);
      // } else {
      //   await postService.savePost(postId);
      // }

      setIsSaved(!isSaved);
      toast.success(isSaved ? 'Removed from saves' : 'Saved to collection');
    } catch (error) {
      toast.error('Failed to save post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={isLoading}
      className={`transition disabled:opacity-50 group ${
        isSaved
          ? 'text-red-500 hover:text-red-600'
          : 'text-gray-600 dark:text-gray-400 hover:text-red-500'
      }`}
    >
      {isSaved ? (
        <FaBookmark size={20} className="group-hover:scale-110 transition" />
      ) : (
        <FiBookmark size={20} className="group-hover:scale-110 transition" />
      )}
    </button>
  );
}
