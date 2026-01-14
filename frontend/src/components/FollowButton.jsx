'use client';

import React, { useState } from 'react';
import { FiUserPlus, FiUserCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function FollowButton({ userId, userName, isFollowing: initialFollowing, isOwnProfile }) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isLoading, setIsLoading] = useState(false);

  if (isOwnProfile) return null;

  const handleFollow = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      // if (isFollowing) {
      //   await profileService.unfollowUser(userName);
      // } else {
      //   await profileService.followUser(userName);
      // }

      setIsFollowing(!isFollowing);
      toast.success(isFollowing ? 'Unfollowed' : 'Following');
    } catch (error) {
      toast.error(`Failed to ${isFollowing ? 'unfollow' : 'follow'} user`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleFollow}
      disabled={isLoading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition disabled:opacity-50 font-semibold ${
        isFollowing
          ? 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-300'
          : 'bg-red-500 text-white hover:bg-red-600'
      }`}
    >
      {isFollowing ? (
        <>
          <FiUserCheck size={18} />
          <span>Following</span>
        </>
      ) : (
        <>
          <FiUserPlus size={18} />
          <span>Follow</span>
        </>
      )}
    </button>
  );
}
