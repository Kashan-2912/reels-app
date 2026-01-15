'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FiPlus } from 'react-icons/fi';

export default function StoriesSection({ stories = [], onAddStory }) {
  const [hoveredStory, setHoveredStory] = useState(null);

  if (!stories || stories.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
            <FiPlus size={32} className="text-white" />
          </div>
          <div className="text-center">
            <p className="text-gray-700 dark:text-gray-300 font-semibold">No stories yet</p>
            <p className="text-sm text-gray-500">Start by adding your first story!</p>
          </div>
          <button
            onClick={onAddStory}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
          >
            Add Story
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-black dark:text-white">Stories</h3>
        <button
          onClick={onAddStory}
          className="flex items-center gap-2 text-sm px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
        >
          <FiPlus size={16} /> Add
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {/* Add Story Button */}
        <button
          onClick={onAddStory}
          className="flex-shrink-0 w-24 h-32 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <FiPlus size={24} className="text-gray-500" />
          <span className="text-xs text-gray-500">Add</span>
        </button>

        {/* Stories */}
        {stories.map((story, index) => (
          <StoryThumbnail
            key={index}
            story={story}
            isHovered={hoveredStory === story.id}
            onHover={() => setHoveredStory(story.id)}
            onHoverEnd={() => setHoveredStory(null)}
          />
        ))}
      </div>
    </div>
  );
}

function StoryThumbnail({ story, isHovered, onHover, onHoverEnd }) {
  const isViewed = story.viewers && story.viewers.length > 0;
  const expiresIn = Math.floor((new Date(story.expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60));

  return (
    <Link href={`/story/${story.id}`} onMouseEnter={onHover} onMouseLeave={onHoverEnd}>
      <div
        className={`flex-shrink-0 w-24 h-32 rounded-lg overflow-hidden cursor-pointer relative group transition ${
          isViewed ? 'ring-2 ring-gray-400' : 'ring-2 ring-red-500'
        }`}
      >
        {/* Thumbnail */}
        {story.media ? (
          story.media.includes('video') ? (
            <video
              src={story.media}
              className="w-full h-full object-cover"
              muted
            />
          ) : (
            <img
              src={story.media}
              alt={story.userName}
              className="w-full h-full object-cover"
            />
          )
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
            <span className="text-white text-2xl">📸</span>
          </div>
        )}

        {/* User Info Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex flex-col justify-end p-2">
          <div className="flex items-center gap-1 text-white text-xs">
            <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-200">
              {story.profilePic ? (
                <img src={story.profilePic} alt={story.userName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">👤</div>
              )}
            </div>
            <span className="font-semibold truncate">{story.userName}</span>
          </div>
          <div className="text-white text-xs mt-1">{expiresIn}h left</div>
        </div>

        {/* Duration Indicator */}
        <div className="absolute top-1 left-1 right-1 h-0.5 bg-gray-500 bg-opacity-50 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full"
            style={{
              width: `${Math.max(0, 100 - (expiresIn / 24) * 100)}%`,
              transition: 'width 1s linear',
            }}
          />
        </div>

        {/* Status Badge */}
        <div className="absolute bottom-1 right-1 flex gap-1">
          {!isViewed && (
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Unviewed" />
          )}
        </div>
      </div>
    </Link>
  );
}
