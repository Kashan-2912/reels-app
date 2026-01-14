'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { FiLoader, FiArrowLeft } from 'react-icons/fi';
import PostCard from '@/components/PostCard';
import toast from 'react-hot-toast';
import { hashtagService } from '@/src/services';

export default function HashtagPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const params = useParams();
  const hashtag = params?.hashtag;
  
  const [posts, setPosts] = useState([]);
  const [hashtagStats, setHashtagStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowingHashtag, setIsFollowingHashtag] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (hashtag) {
      fetchHashtagData();
    }
  }, [user, hashtag, router]);

  const fetchHashtagData = async () => {
    try {
      setIsLoading(true);
      const response = await hashtagService.getPostsByHashtag(hashtag, 1, 50);
      setPosts(response.data?.posts || []);
      
      // Get hashtag stats
      const statsResponse = await hashtagService.getTrendingHashtags(1, 20);
      const hashtagStats = statsResponse.data?.hashtags?.find(h => h.name === hashtag) || {
        name: hashtag,
        postsCount: 0,
        followersCount: 0,
        isFollowing: false,
      };
      setHashtagStats(hashtagStats);
      setIsFollowingHashtag(hashtagStats.isFollowing || false);
    } catch (error) {
      console.error('Error fetching hashtag data:', error);
      toast.error('Failed to load hashtag');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowHashtag = async () => {
    try {
      // Note: Follow/unfollow hashtag functionality may not be available in the backend yet
      // This is a placeholder for when the backend implements this feature
      setIsFollowingHashtag(!isFollowingHashtag);
      toast.success(isFollowingHashtag ? 'Unfollowed hashtag' : 'Following hashtag!');
    } catch (error) {
      console.error('Error following hashtag:', error);
      toast.error('Failed to follow hashtag');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FiLoader className="animate-spin text-4xl text-red-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-8">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
          >
            <FiArrowLeft size={20} className="text-black dark:text-white" />
          </button>
          <h1 className="text-2xl font-bold text-red-500 flex-1 ml-3">
            #{hashtag}
          </h1>
        </div>

        {/* Hashtag Stats */}
        {hashtagStats && (
          <div className="flex items-center justify-between gap-4 py-4">
            <div>
              <div className="font-bold text-black dark:text-white">
                {hashtagStats.postCount.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Posts</div>
            </div>
            <div>
              <div className="font-bold text-black dark:text-white">
                {hashtagStats.followerCount.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Following</div>
            </div>
            <button
              onClick={handleFollowHashtag}
              className={`ml-auto px-4 py-2 rounded-lg transition font-semibold ${
                isFollowingHashtag
                  ? 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-300'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              {isFollowingHashtag ? 'Following' : 'Follow'}
            </button>
          </div>
        )}
      </div>

      {/* Posts */}
      <div className="space-y-6 p-4">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <div className="p-8 text-center">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-gray-600 dark:text-gray-400">
              No posts found for #{hashtag}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
