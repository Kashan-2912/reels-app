'use client';

import React, { useState } from 'react';
import { FaHeart } from 'react-icons/fa';
import { FiHeart } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function LikeButton({ postId, isLiked: initialLiked, likesCount: initialCount }) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      // if (isLiked) {
      //   await postService.unlikePost(postId);
      // } else {
      //   await postService.likePost(postId);
      // }

      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    } catch (error) {
      toast.error('Failed to like post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-500 transition disabled:opacity-50 group"
    >
      {isLiked ? (
        <FaHeart size={20} className="text-red-500 group-hover:scale-110 transition" />
      ) : (
        <FiHeart size={20} className="group-hover:scale-110 transition" />
      )}
      <span className="text-sm font-medium">{likesCount}</span>
    </button>
  );
}
