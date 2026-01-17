'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/store/authStore';
import { FiSearch, FiTrendingUp, FiUsers, FiLoader } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { exploreService, hashtagService, profileService } from '@/src/services';

export default function ExplorePage() {
  const router = useRouter();
  const { user, isInitialized, initAuth } = useAuthStore();
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [trendingHashtags, setTrendingHashtags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [followingState, setFollowingState] = useState({});

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) {
      router.push('/login');
      return;
    }

    fetchExploreData();
  }, [isInitialized, user, router]);

  const fetchExploreData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch trending posts from backend
      const postsResponse = await exploreService.getTrendingPosts(1, 20);
      setTrendingPosts(postsResponse.data?.posts || []);

      // Fetch suggested users from backend
      const usersResponse = await exploreService.getSuggestedUsers(10);
      setSuggestedUsers(usersResponse.data?.suggestedUsers || []);

      // Fetch trending hashtags from backend
      const hashtagsResponse = await hashtagService.getTrendingHashtags(10);
      setTrendingHashtags(hashtagsResponse.data?.hashtags || []);
    } catch (error) {
      console.error('Error fetching explore data:', error);
      toast.error('Failed to load explore data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowUser = async (targetUserName, isFollowing) => {
    try {
      if (isFollowing) {
        await profileService.unfollowUser(targetUserName);
        toast.success('Unfollowed!');
      } else {
        await profileService.followUser(targetUserName);
        toast.success('Followed!');
      }
      
      // Update UI state
      setSuggestedUsers(prev => 
        prev.map(u => 
          u.userName === targetUserName ? { ...u, isFollowing: !isFollowing } : u
        )
      );
    } catch (error) {
      console.error('Error following user:', error);
      toast.error('Failed to follow user');
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
    <div className="space-y-8 pb-8">
      {/* Search Bar */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users, hashtags, or posts..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full bg-gray-100 dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="md:col-span-2 space-y-6">
          {/* Trending Posts */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center gap-2 p-4 border-b border-gray-200 dark:border-gray-800">
              <FiTrendingUp size={20} className="text-red-500" />
              <h2 className="font-bold text-lg text-black dark:text-white">Trending Now</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4">
              {trendingPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/post/${post.id}`}
                  className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer"
                >
                  <img
                    src={post.photos[0]}
                    alt="Trending post"
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition flex items-end justify-start p-3">
                    <div className="opacity-0 group-hover:opacity-100 transition">
                      <div className="text-white text-sm font-semibold">{post.likesCount} likes</div>
                      <div className="text-gray-200 text-xs">{post.commentsCount} comments</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {trendingPosts.length === 0 && (
              <div className="p-8 text-center text-gray-500">No trending posts yet</div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Suggested Users */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-2 mb-4">
              <FiUsers size={20} className="text-red-500" />
              <h3 className="font-bold text-black dark:text-white">Suggested Users</h3>
            </div>

            <div className="space-y-3">
              {suggestedUsers.map((suggestedUser) => (
                <div
                  key={suggestedUser.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  <Link href={`/profile/${suggestedUser.userName}`} className="flex items-center gap-2 flex-1">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800">
                      <img
                        src={suggestedUser.profilePic}
                        alt={suggestedUser.userName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-black dark:text-white">
                        {suggestedUser.profileName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {suggestedUser.mutualFollowers} mutual
                      </div>
                    </div>
                  </Link>

                  <button
                    onClick={() =>
                      handleFollowUser(
                        suggestedUser.userName,
                        suggestedUser.isFollowing
                      )
                    }
                    className={`px-3 py-1 text-xs rounded-lg transition font-semibold ${
                      suggestedUser.isFollowing
                        ? 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-300'
                        : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                  >
                    {suggestedUser.isFollowing ? 'Following' : 'Follow'}
                  </button>
                </div>
              ))}
            </div>

            {suggestedUsers.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">No suggestions yet</div>
            )}
          </div>

          {/* Trending Hashtags */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <h3 className="font-bold text-black dark:text-white mb-4">Trending Hashtags</h3>

            <div className="space-y-2">
              {trendingHashtags.map((hashtag) => (
                <Link
                  key={hashtag.tag}
                  href={`/hashtag/${hashtag.tag.replace('#', '')}`}
                  className="block p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  <div className="font-semibold text-black dark:text-white">{hashtag.tag}</div>
                  <div className="text-xs text-gray-500">{hashtag.postCount.toLocaleString()} posts</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
