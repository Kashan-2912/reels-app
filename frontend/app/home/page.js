"use client";

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import PostCard from '@/src/components/PostCard';
import Sidebar from '@/src/components/Sidebar';
import { feedService } from '@/src/services';
import { useAuthStore } from '@/src/store/authStore';
import { useFeedStore } from '@/src/store/feedStore';

export default function HomePage() {
  const router = useRouter();
  const { user, isInitialized, initAuth } = useAuthStore();
  const { posts, isLoading, hasMore, currentPage, getHomeFeed, clearFeed } = useFeedStore();
  const [stories, setStories] = useState([]);
  const [isLoadingStories, setIsLoadingStories] = useState(true);
  const observerTarget = useRef(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!isInitialized) return;

    if (!user) {
      router.push('/login');
      return;
    }

    // Load stories
    const loadStories = async () => {
      try {
        setIsLoadingStories(true);
        const response = await feedService.getFollowingStories();
        setStories(response.data?.stories || []);
      } catch (error) {
        console.error('Failed to load stories:', error);
        setStories([]);
      } finally {
        setIsLoadingStories(false);
      }
    };

    clearFeed();
    getHomeFeed(1).catch((error) => {
      toast.error('Failed to load feed');
    });
    loadStories();
  }, [user, isInitialized]);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore || loadingRef.current) return;
    loadingRef.current = true;

    try {
      await getHomeFeed(currentPage + 1);
    } catch (error) {
      toast.error('Failed to load more posts');
    } finally {
      loadingRef.current = false;
    }
  }, [isLoading, hasMore, currentPage, getHomeFeed]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, isLoading, loadMore]);

  const handleAddStory = () => {
    toast.success('Story feature coming soon!');
  };

  if (!user) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="max-w-7xl mx-auto flex">
        <Sidebar />

        <main className="flex-1 flex gap-10 px-4 md:px-8 py-8">
          <div className="flex-1 max-w-2xl mx-auto space-y-6">
            <div className="bg-[#111] border border-neutral-900 rounded-2xl p-4 overflow-x-auto">
              <div className="flex items-center gap-4 min-w-max">
                <StoryBubble
                  label="Your story"
                  image={user.profilePic || 'https://via.placeholder.com/80x80'}
                  isOwn
                  onAdd={handleAddStory}
                />
                {(stories && stories.length > 0 ? stories : storyFallback).map((story, index) => (
                  <StoryBubble key={index} label={story.userName} image={story.profilePic} />
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {posts.length > 0 ? (
                <>
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                  {hasMore && (
                    <div ref={observerTarget} className="py-8 text-center text-gray-400">
                      {isLoading && 'Loading more posts...'}
                    </div>
                  )}
                  {!hasMore && posts.length > 0 && (
                    <div className="py-8 text-center text-gray-500">No more posts</div>
                  )}
                </>
              ) : isLoading ? (
                <div className="py-8 text-center text-gray-400">Loading posts...</div>
              ) : (
                <div className="py-8 text-center text-gray-500">No posts in your feed. Follow more users!</div>
              )}
            </div>
          </div>

          <div className="hidden xl:block w-80 pt-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-800">
                <img src={user.profilePic || 'https://via.placeholder.com/80x80'} alt={user.userName} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">{user.userName}</div>
                <div className="text-sm text-gray-500">{user.profileName}</div>
              </div>
              <a href="/login" className="text-xs font-semibold text-blue-400">Switch</a>
            </div>

            <div className="mt-6 flex items-center justify-between text-sm text-gray-400">
              <span>Suggested for you</span>
              <button className="text-white text-xs">See all</button>
            </div>

            <div className="mt-3 space-y-3">
              {suggestedUsers.map((suggested) => (
                <div key={suggested.userName} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-800">
                    <img src={suggested.avatar} alt={suggested.userName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{suggested.userName}</div>
                    <div className="text-xs text-gray-500 truncate">{suggested.subtext}</div>
                  </div>
                  <button className="text-xs font-semibold text-blue-400">Follow</button>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

const navItems = [
  { label: 'Home', href: '/home', icon: FiHome, active: true },
  { label: 'Search', href: '/search', icon: FiSearch },
  { label: 'Explore', href: '/explore', icon: FiCompass },
  { label: 'Reels', href: '/reels', icon: FiPlay },
  { label: 'Messages', href: '#', icon: FiMessageCircle },
  { label: 'Notifications', href: '/notifications', icon: FiHeart },
  { label: 'Create', href: '/post/new', icon: FiPlusSquare },
  // resolved at runtime to avoid 404 on /profile
  { label: 'Profile', href: null, icon: FiUser },
];

const storyFallback = [
  { id: '1', userName: 'hamzathe...', profilePic: 'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?auto=format&fit=crop&w=200&q=80' },
  { id: '2', userName: '__abinf90', profilePic: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80' },
];

const suggestedUsers = [
  { userName: 'elon.0', subtext: 'Suggested for you', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80' },
  { userName: 'msms.88_', subtext: 'Following dns.hacker', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80' },
  { userName: 'unifestwave', subtext: 'Followed by kashan', avatar: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=200&q=80' },
  { userName: 'tom.boy963_', subtext: 'Following kashan', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80' },
  { userName: 'aliveformelisa', subtext: 'Followed by kamran...', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80' },
];

function StoryBubble({ label, image, isOwn = false, onAdd }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div
        className={`relative h-16 w-16 rounded-full p-[2px] ${
          isOwn ? 'bg-gray-600' : 'bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500'
        }`}
      >
        <div className="h-full w-full rounded-full bg-black p-[2px]">
          <div className="h-full w-full rounded-full overflow-hidden bg-neutral-800">
            <img src={image} alt={label} className="h-full w-full object-cover" />
          </div>
        </div>
        {isOwn && (
          <button
            onClick={onAdd}
            className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm"
            aria-label="Add story"
          >
            +
          </button>
        )}
      </div>
      <span className="w-16 truncate text-xs text-gray-300">{label}</span>
    </div>
  );
}
