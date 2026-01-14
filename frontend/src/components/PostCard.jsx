'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useFeedStore } from '@/src/store/feedStore';
import toast from 'react-hot-toast';
import { FiHeart, FiMessageCircle, FiShare2, FiBookmark } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { postService } from '@/src/services';

export default function PostCard({ post }) {
  const { likePost, unlikePost, savePost, unsavePost } = useFeedStore();
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      if (post.isLiked) {
        await unlikePost(post.id);
      } else {
        await likePost(post.id);
      }
    } catch (error) {
      toast.error('Failed to like post');
    } finally {
      setIsLiking(false);
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      if (post.isSaved) {
        await unsavePost(post.id);
        toast.success('Removed from saves');
      } else {
        await savePost(post.id);
        toast.success('Saved!');
      }
    } catch (error) {
      toast.error('Failed to save post');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/post/${post.id}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
        <Link href={`/profile/${post.userName}`} className="flex items-center gap-3 hover:opacity-80">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800">
            {post.profilePic ? (
              <img src={post.profilePic} alt={post.userName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">👤</div>
            )}
          </div>
          <div>
            <div className="font-semibold text-black dark:text-white">{post.profileName}</div>
            <div className="text-sm text-gray-500">@{post.userName}</div>
          </div>
        </Link>
        <span className="text-sm text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</span>
      </div>

      {/* Media */}
      <div className="w-full aspect-square overflow-hidden bg-gray-200 dark:bg-gray-800 relative group">
        {post.photos && post.photos.length > 0 ? (
          <img src={post.photos[0]} alt="Post" className="w-full h-full object-cover" />
        ) : post.video ? (
          <video src={post.video} className="w-full h-full object-cover" controls />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No media</div>
        )}

        {post.photos && post.photos.length > 1 && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
            {post.photos.length} photos
          </div>
        )}
      </div>

      {/* Description */}
      {post.description && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <p className="text-gray-800 dark:text-gray-200">
            <Link href={`/profile/${post.userName}`} className="font-semibold hover:opacity-80">
              {post.profileName}
            </Link>{' '}
            {post.description}
          </p>
          {post.hashtags && post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {post.hashtags.map((tag) => (
                <Link
                  key={tag}
                  href={`/hashtag/${tag.replace('#', '')}`}
                  className="text-red-500 hover:text-red-600 text-sm"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Engagement Count */}
      <div className="px-4 pt-4 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
        <div className="flex gap-4">
          <span>{post.likesCount} likes</span>
          <span>{post.commentsCount} comments</span>
          <span>{post.sharesCount} shares</span>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 flex items-center justify-between">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-500 transition disabled:opacity-50"
        >
          {post.isLiked ? (
            <FaHeart size={20} className="text-red-500" />
          ) : (
            <FiHeart size={20} />
          )}
          <span className="text-sm">{post.likesCount}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition"
        >
          <FiMessageCircle size={20} />
          <span className="text-sm">{post.commentsCount}</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-500 transition"
        >
          <FiShare2 size={20} />
          <span className="text-sm">{post.sharesCount}</span>
        </button>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center gap-2 transition disabled:opacity-50 ${
            post.isSaved
              ? 'text-red-500 hover:text-red-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-red-500'
          }`}
        >
          <FiBookmark size={20} />
          <span className="text-sm">{post.savesCount}</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          <CommentSection postId={post.id} comments={post.comments} />
        </div>
      )}
    </div>
  );
}

function CommentSection({ postId, comments }) {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await postService.addComment(post._id, newComment);
      toast.success('Comment added!');
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmitComment} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <button
          type="submit"
          disabled={isSubmitting || !newComment.trim()}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded transition"
        >
          Post
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment._id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 flex-shrink-0">
                {comment.profilePic ? (
                  <img src={comment.profilePic} alt={comment.userName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">👤</div>
                )}
              </div>
              <div className="flex-1">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
                  <div className="font-semibold text-sm text-black dark:text-white">{comment.userName}</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">{comment.text}</div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">No comments yet</div>
        )}
      </div>
    </div>
  );
}
