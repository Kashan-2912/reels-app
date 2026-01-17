'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/src/store/authStore';
import { FiLoader, FiArrowLeft, FiTrash2 } from 'react-icons/fi';
import PostCard from '@/src/components/PostCard';
import toast from 'react-hot-toast';
import { postService } from '@/src/services';

export default function PostPage() {
  const router = useRouter();
  const { user, isInitialized, initAuth } = useAuthStore();
  const params = useParams();
  const postId = params?.postId;

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) {
      router.push('/login');
      setIsLoading(false);
      return;
    }

    if (!postId) {
      setIsLoading(false);
      return;
    }

    fetchPost();
    fetchComments();
  }, [isInitialized, user, postId, router]);

  const fetchPost = async () => {
    try {
      setIsLoading(true);
      const response = await postService.getPost(postId);
      setPost(response.data?.post || null);
    } catch (error) {
      console.error('Error fetching post:', error);
      toast.error('Failed to load post');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await postService.getPostComments(postId, 1, 50);
      setComments(response.data?.comments || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsAddingComment(true);
    try {
      const response = await postService.addComment(postId, newComment);
      const newCommentData = response.data?.comment || {
        _id: Date.now().toString(),
        text: newComment,
        userName: user.userName,
        profileName: user.profileName,
        profilePic: user.profilePic || 'https://via.placeholder.com/40x40',
        likesCount: 0,
        createdAt: new Date(),
      };

      setComments([...comments, newCommentData]);
      setNewComment('');
      toast.success('Comment added!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsAddingComment(false);
    }
  };

  const deleteComment = async (commentId) => {
    try {
      await postService.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const deletePost = async () => {
    if (!window.confirm('Delete this post?')) return;

    try {
      await postService.deletePost(postId);
      toast.success('Post deleted');
      router.push('/home');
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FiLoader className="animate-spin text-4xl text-red-500" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-8 text-center">
        <div className="text-4xl mb-2">📭</div>
        <p className="text-gray-600 dark:text-gray-400">Post not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-8">
      {/* Back Button */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition"
        >
          <FiArrowLeft size={20} />
          <span>Back</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6 p-6">
        {/* Post Image */}
        <div className="col-span-2">
          {post.photos && post.photos[0] ? (
            <img
              src={post.photos[0]}
              alt="Post"
              className="w-full rounded-lg bg-gray-200 dark:bg-gray-800"
            />
          ) : post.video ? (
            <video
              src={post.video}
              controls
              className="w-full rounded-lg bg-black"
            />
          ) : null}
        </div>

        {/* Post Details */}
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="border-b border-gray-200 dark:border-gray-800 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img
                    src={post.profilePic}
                    alt={post.userName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="font-semibold text-black dark:text-white">{post.profileName}</div>
                  <div className="text-xs text-gray-500">@{post.userName}</div>
                </div>
              </div>
              {user?.userName === post.userName && (
                <button
                  onClick={deletePost}
                  className="text-red-500 hover:text-red-600 transition"
                >
                  <FiTrash2 size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Description & Hashtags */}
          <div className="border-b border-gray-200 dark:border-gray-800 pb-4">
            <p className="text-black dark:text-white">{post.description}</p>
            {post.hashtags && post.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {post.hashtags.map((tag) => (
                  <a
                    key={tag}
                    href={`/hashtag/${tag.replace('#', '')}`}
                    className="text-red-500 hover:text-red-600 text-sm"
                  >
                    {tag}
                  </a>
                ))}
              </div>
            )}
            <div className="text-xs text-gray-500 mt-2">
              {new Date(post.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Engagement Stats */}
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div>
              <div className="font-bold text-black dark:text-white">{post.likesCount}</div>
              <div className="text-gray-500">Likes</div>
            </div>
            <div>
              <div className="font-bold text-black dark:text-white">{post.commentsCount}</div>
              <div className="text-gray-500">Comments</div>
            </div>
            <div>
              <div className="font-bold text-black dark:text-white">{post.savesCount}</div>
              <div className="text-gray-500">Saves</div>
            </div>
          </div>

          {/* Engagement Actions */}
          <div className="flex gap-2 text-sm border-t border-gray-200 dark:border-gray-800 pt-4">
            <button className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition">
              ❤️ Like
            </button>
            <button className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition">
              💬 Reply
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-6">
        <h3 className="font-bold text-lg text-black dark:text-white mb-6">Comments</h3>

        {/* Add Comment */}
        <form onSubmit={handleAddComment} className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              <img
                src={user?.profilePic || 'https://via.placeholder.com/32x32'}
                alt="Your profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                type="submit"
                disabled={isAddingComment || !newComment.trim()}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg transition"
              >
                Post
              </button>
            </div>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment._id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    src={comment.profilePic}
                    alt={comment.userName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                    <div className="font-semibold text-sm text-black dark:text-white">
                      {comment.profileName}
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {comment.text}
                    </div>
                  </div>
                  <div className="flex gap-4 mt-1 text-xs text-gray-500">
                    <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                    <button className="hover:text-gray-700 dark:hover:text-gray-300">❤️ Like</button>
                    {user?.userName === comment.userName && (
                      <button
                        onClick={() => deleteComment(comment._id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No comments yet. Be the first to comment!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
