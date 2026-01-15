'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import PostCard from '@/src/components/PostCard';
import StoriesSection from '@/src/components/StoriesSection';
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
    <div className="max-w-2xl mx-auto p-4">
      {/* Stories Section */}
      <StoriesSection stories={stories} onAddStory={handleAddStory} />

      {/* Feed */}
      <div className="space-y-6 mt-8">
        {posts.length > 0 ? (
          <>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
            {hasMore && (
              <div ref={observerTarget} className="py-8 text-center">
                {isLoading && <div className="text-gray-500">Loading more posts...</div>}
              </div>
            )}
            {!hasMore && posts.length > 0 && (
              <div className="py-8 text-center text-gray-500">No more posts</div>
            )}
          </>
        ) : isLoading ? (
          <div className="py-8 text-center">Loading posts...</div>
        ) : (
          <div className="py-8 text-center text-gray-500">No posts in your feed. Follow more users!</div>
        )}
      </div>
    </div>
  );
}
