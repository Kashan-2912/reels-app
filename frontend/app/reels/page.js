'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { FiLoader, FiHeart, FiMessageCircle, FiShare2, FiBookmark } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ReelsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [reels, setReels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchReels();
  }, [user, router]);

  const fetchReels = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement getReels() API call

      // Mock reels data
      setReels([
        {
          id: '1',
          video: 'https://via.placeholder.com/400x800?text=Reel+1',
          description: 'Amazing dance moves! 💃',
          userName: 'dance_hub',
          profileName: 'Dance Hub',
          profilePic: 'https://via.placeholder.com/40x40',
          likesCount: 1234,
          commentsCount: 89,
          sharesCount: 45,
          isLiked: false,
          isSaved: false,
          hashtags: ['#dance', '#trending'],
        },
        {
          id: '2',
          video: 'https://via.placeholder.com/400x800?text=Reel+2',
          description: 'Delicious recipe! 🍕',
          userName: 'food_channel',
          profileName: 'Food Channel',
          profilePic: 'https://via.placeholder.com/40x40',
          likesCount: 2345,
          commentsCount: 123,
          sharesCount: 67,
          isLiked: false,
          isSaved: false,
          hashtags: ['#food', '#cooking'],
        },
      ]);
    } catch (error) {
      toast.error('Failed to load reels');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScroll = (event) => {
    if (containerRef.current) {
      const scrollTop = event.target.scrollTop;
      const containerHeight = event.target.clientHeight;
      const newIndex = Math.round(scrollTop / containerHeight);
      setCurrentReelIndex(Math.max(0, Math.min(newIndex, reels.length - 1)));
    }
  };

  const handleLike = async (reelId, isLiked) => {
    try {
      // TODO: Implement likeReel/unlikeReel API
      setReels((prev) =>
        prev.map((r) =>
          r.id === reelId
            ? {
                ...r,
                isLiked: !isLiked,
                likesCount: isLiked ? r.likesCount - 1 : r.likesCount + 1,
              }
            : r
        )
      );
    } catch (error) {
      toast.error('Failed to like reel');
    }
  };

  const handleSave = async (reelId, isSaved) => {
    try {
      // TODO: Implement saveReel/unsaveReel API
      setReels((prev) =>
        prev.map((r) =>
          r.id === reelId
            ? { ...r, isSaved: !isSaved }
            : r
        )
      );
      toast.success(isSaved ? 'Removed from saves' : 'Saved!');
    } catch (error) {
      toast.error('Failed to save reel');
    }
  };

  const handleShare = async (reelId) => {
    try {
      const shareUrl = `${window.location.origin}/reel/${reelId}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
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
    <div className="h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* Reels Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full h-screen overflow-y-scroll snap-y snap-mandatory"
        style={{ scrollBehavior: 'smooth' }}
      >
        {reels.length > 0 ? (
          reels.map((reel, index) => (
            <div
              key={reel.id}
              className="w-full h-screen snap-start flex items-center justify-center relative bg-black"
            >
              {/* Video */}
              <div className="w-full h-full max-w-md relative">
                <video
                  src={reel.video}
                  autoPlay={index === currentReelIndex}
                  muted
                  loop
                  className="w-full h-full object-cover"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

                {/* Info - Bottom Left */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <Link
                    href={`/profile/${reel.userName}`}
                    className="flex items-center gap-3 mb-3 hover:opacity-80"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
                      <img
                        src={reel.profilePic}
                        alt={reel.userName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-semibold">{reel.profileName}</div>
                      <div className="text-xs text-gray-300">@{reel.userName}</div>
                    </div>
                  </Link>

                  <p className="text-sm mb-3 line-clamp-2">{reel.description}</p>

                  {reel.hashtags && reel.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 text-xs">
                      {reel.hashtags.map((tag) => (
                        <span key={tag} className="text-red-400">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions - Right Side */}
                <div className="absolute right-0 bottom-0 flex flex-col gap-4 p-4">
                  {/* Like Button */}
                  <button
                    onClick={() => handleLike(reel.id, reel.isLiked)}
                    className="flex flex-col items-center gap-2 text-white hover:opacity-80 transition"
                  >
                    {reel.isLiked ? (
                      <FaHeart size={24} className="text-red-500" />
                    ) : (
                      <FiHeart size={24} />
                    )}
                    <span className="text-xs font-semibold">
                      {reel.likesCount > 1000
                        ? `${(reel.likesCount / 1000).toFixed(1)}K`
                        : reel.likesCount}
                    </span>
                  </button>

                  {/* Comment Button */}
                  <button className="flex flex-col items-center gap-2 text-white hover:opacity-80 transition">
                    <FiMessageCircle size={24} />
                    <span className="text-xs font-semibold">
                      {reel.commentsCount > 1000
                        ? `${(reel.commentsCount / 1000).toFixed(1)}K`
                        : reel.commentsCount}
                    </span>
                  </button>

                  {/* Share Button */}
                  <button
                    onClick={() => handleShare(reel.id)}
                    className="flex flex-col items-center gap-2 text-white hover:opacity-80 transition"
                  >
                    <FiShare2 size={24} />
                    <span className="text-xs font-semibold">
                      {reel.sharesCount > 1000
                        ? `${(reel.sharesCount / 1000).toFixed(1)}K`
                        : reel.sharesCount}
                    </span>
                  </button>

                  {/* Save Button */}
                  <button
                    onClick={() => handleSave(reel.id, reel.isSaved)}
                    className={`flex flex-col items-center gap-2 transition ${
                      reel.isSaved
                        ? 'text-red-500 hover:text-red-600'
                        : 'text-white hover:opacity-80'
                    }`}
                  >
                    <FiBookmark size={24} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white">
            <div className="text-5xl mb-4">🎬</div>
            <p className="text-lg">No reels yet</p>
          </div>
        )}
      </div>

      {/* Pagination Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
        {reels.map((_, index) => (
          <div
            key={index}
            className={`h-1 rounded-full transition-all ${
              index === currentReelIndex
                ? 'w-8 bg-red-500'
                : 'w-2 bg-gray-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
