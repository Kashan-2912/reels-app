'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/store/authStore';
import { FiLoader, FiGrid, FiList } from 'react-icons/fi';
import PostCard from '@/src/components/PostCard';
import toast from 'react-hot-toast';
import { savedService, postService } from '@/src/services';

export default function SavedPostsPage() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();
  const [savedPosts, setSavedPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [filterTab, setFilterTab] = useState('all'); // all, photos, videos

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) {
      router.push('/login');
      return;
    }

    fetchSavedPosts();
  }, [user, isInitialized, router]);

  const fetchSavedPosts = async () => {
    try {
      setIsLoading(true);
      const response = await savedService.getSavedPosts(1, 50);
      setSavedPosts(response.data?.posts || []);
    } catch (error) {
      console.error('Error fetching saved posts:', error);
      toast.error('Failed to load saved posts');
      setSavedPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const removeSavedPost = async (postId) => {
    try {
      await postService.unsavePost(postId);
      setSavedPosts((prev) => prev.filter((p) => p._id !== postId));
      toast.success('Post removed from saves');
    } catch (error) {
      console.error('Error removing saved post:', error);
      toast.error('Failed to remove saved post');
    }
  };

  const getFilteredPosts = () => {
    if (filterTab === 'all') return savedPosts;
    if (filterTab === 'photos') return savedPosts.filter((p) => p.photos && p.photos.length > 0);
    if (filterTab === 'videos') return savedPosts.filter((p) => p.video);
    return savedPosts;
  };

  const filteredPosts = getFilteredPosts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FiLoader className="animate-spin text-4xl text-red-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-8">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-black dark:text-white">Saved Posts</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'grid'
                  ? 'bg-red-500 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <FiGrid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition ${
                viewMode === 'list'
                  ? 'bg-red-500 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <FiList size={20} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {['all', 'photos', 'videos'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-4 py-2 rounded-full transition capitalize ${
                filterTab === tab
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="text-sm text-gray-500 mt-4">
          {filteredPosts.length} saved {filteredPosts.length === 1 ? 'post' : 'posts'}
        </div>
      </div>

      {/* Content */}
      {filteredPosts.length > 0 ? (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-3 gap-4 p-4">
              {filteredPosts.map((post) => (
                <div key={post.id} className="relative group aspect-square cursor-pointer">
                  <Link href={`/post/${post.id}`} className="block w-full h-full">
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden">
                      {post.photos && post.photos[0] ? (
                        <img
                          src={post.photos[0]}
                          alt="Saved post"
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      ) : post.video ? (
                        <video
                          src={post.video}
                          className="w-full h-full object-cover"
                          muted
                        />
                      ) : null}
                    </div>
                  </Link>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition rounded-lg flex items-center justify-center gap-4">
                    <div className="opacity-0 group-hover:opacity-100 transition flex items-center gap-2 text-white">
                      <span>❤️ {post.likesCount}</span>
                      <span>💬 {post.commentsCount}</span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      removeSavedPost(post.id);
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition bg-red-500 hover:bg-red-600 text-white rounded-full p-2"
                    title="Remove from saves"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {filteredPosts.map((post) => (
                <div key={post.id} className="flex gap-4 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden hover:border-gray-300 dark:hover:border-gray-700 transition">
                  <Link href={`/post/${post.id}`} className="w-32 h-32 flex-shrink-0">
                    {post.photos && post.photos[0] ? (
                      <img
                        src={post.photos[0]}
                        alt="Saved post"
                        className="w-full h-full object-cover"
                      />
                    ) : post.video ? (
                      <video
                        src={post.video}
                        className="w-full h-full object-cover"
                        muted
                      />
                    ) : null}
                  </Link>

                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <Link href={`/profile/${post.userName}`} className="text-red-500 hover:text-red-600 font-semibold">
                        @{post.userName}
                      </Link>
                      <p className="text-black dark:text-white line-clamp-2 mt-1">
                        {post.description}
                      </p>
                      {post.hashtags && post.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {post.hashtags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-red-500 text-sm">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>❤️ {post.likesCount}</span>
                        <span>💬 {post.commentsCount}</span>
                      </div>
                      <button
                        onClick={() => removeSavedPost(post.id)}
                        className="text-red-500 hover:text-red-600 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="p-12 text-center">
          <div className="text-5xl mb-4">🔖</div>
          <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold">
            No saved posts yet
          </p>
          <p className="text-gray-500 mt-2">
            When you save posts, they will appear here
          </p>
          <Link href="/home" className="inline-block mt-6 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition">
            Explore Posts
          </Link>
        </div>
      )}
    </div>
  );
}
