'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/store/authStore';
import { FiSearch, FiLoader, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { searchService, hashtagService, profileService } from '@/src/services';

export default function SearchPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('users'); // users, posts, hashtags
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, [user, router]);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      // Actual search API calls based on activeTab
      if (activeTab === 'users') {
        const response = await searchService.searchUsers(query, 1, 20);
        setSearchResults(response.data?.users || []);
      } else if (activeTab === 'posts') {
        const response = await searchService.searchPosts(query, 1, 20);
        setSearchResults(response.data?.posts || []);
      } else {
        const response = await hashtagService.searchHashtags(query, 20);
        setSearchResults(response.data?.hashtags || []);
      }

      // Add to recent searches
      addRecentSearch(query);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const addRecentSearch = (query) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.query !== query);
      const updated = [{ query, timestamp: new Date().toISOString() }, ...filtered].slice(0, 10);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleRecentSearch = (query) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Search Header */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
            >
              <FiArrowLeft size={20} className="text-black dark:text-white" />
            </button>
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                placeholder="Search users, posts, hashtags..."
                autoFocus
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full bg-gray-100 dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Tabs */}
          {searchQuery && (
            <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800">
              {['users', 'posts', 'hashtags'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-semibold border-b-2 transition ${
                    activeTab === tab
                      ? 'border-red-500 text-red-500'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4">
        {/* Recent Searches */}
        {!searchQuery && recentSearches.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-black dark:text-white">Recent Searches</h3>
              <button
                onClick={clearRecentSearches}
                className="text-xs text-red-500 hover:text-red-600 transition"
              >
                Clear all
              </button>
            </div>

            <div className="space-y-2">
              {recentSearches.map((item) => (
                <button
                  key={item.query}
                  onClick={() => handleRecentSearch(item.query)}
                  className="w-full text-left p-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                >
                  <FiSearch size={16} className="text-gray-400" />
                  <span className="text-black dark:text-white">{item.query}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <FiLoader className="animate-spin text-4xl text-red-500" />
          </div>
        )}

        {/* Search Results */}
        {searchQuery && !isLoading && searchResults.length > 0 && (
          <div className="space-y-3">
            {activeTab === 'users' &&
              searchResults.map((user) => (
                <UserSearchResult key={user.id} user={user} />
              ))}

            {activeTab === 'posts' &&
              searchResults.map((post) => (
                <PostSearchResult key={post.id} post={post} />
              ))}

            {activeTab === 'hashtags' &&
              searchResults.map((hashtag) => (
                <HashtagSearchResult key={hashtag.tag} hashtag={hashtag} />
              ))}
          </div>
        )}

        {/* No Results */}
        {searchQuery && !isLoading && searchResults.length === 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-8 text-center">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-gray-600 dark:text-gray-400">
              No {activeTab} found for "{searchQuery}"
            </p>
            <p className="text-sm text-gray-500 mt-2">Try searching for something else</p>
          </div>
        )}

        {/* Empty State */}
        {!searchQuery && recentSearches.length === 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-8 text-center">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-gray-600 dark:text-gray-400 font-semibold">
              Start searching
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Find users, posts, and hashtags
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function UserSearchResult({ user }) {
  const [isFollowing, setIsFollowing] = useState(user.isFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = async () => {
    setIsLoading(true);
    try {
      if (isFollowing) {
        await profileService.unfollowUser(userName);
      } else {
        await profileService.followUser(userName);
      }
      setIsFollowing(!isFollowing);
      toast.success(isFollowing ? 'Unfollowed!' : 'Followed!');
    } catch (error) {
      console.error('Error following user:', error);
      toast.error('Failed to follow user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">
      <Link href={`/profile/${user.userName}`} className="flex items-center gap-3 flex-1">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800">
          <img
            src={user.profilePic}
            alt={user.userName}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <div className="font-semibold text-black dark:text-white">{user.profileName}</div>
          <div className="text-sm text-gray-500">@{user.userName}</div>
        </div>
      </Link>

      <button
        onClick={handleFollow}
        disabled={isLoading}
        className={`px-4 py-2 rounded-lg transition font-semibold ${
          isFollowing
            ? 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-300'
            : 'bg-red-500 text-white hover:bg-red-600'
        } disabled:opacity-50`}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </button>
    </div>
  );
}

function PostSearchResult({ post }) {
  return (
    <Link href={`/post/${post.id}`}>
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden hover:border-gray-300 dark:hover:border-gray-700 transition cursor-pointer flex">
        <div className="w-24 h-24 flex-shrink-0 overflow-hidden">
          <img
            src={post.photos[0]}
            alt="Post"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 p-4">
          <p className="text-black dark:text-white line-clamp-2">{post.description}</p>
          <div className="flex gap-4 mt-2 text-sm text-gray-500">
            <span>{post.likesCount} likes</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function HashtagSearchResult({ hashtag }) {
  return (
    <Link href={`/hashtag/${hashtag.tag.replace('#', '')}`}>
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer">
        <div className="font-bold text-lg text-red-500">{hashtag.tag}</div>
        <div className="text-sm text-gray-500">{hashtag.postCount.toLocaleString()} posts</div>
      </div>
    </Link>
  );
}
