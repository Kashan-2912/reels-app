'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProfileStore } from '@/src/store/profileStore';
import { useAuthStore } from '@/src/store/authStore';
import { postService, profileService } from '@/src/services';
import toast from 'react-hot-toast';
import { FiEdit2, FiUserPlus, FiUserCheck } from 'react-icons/fi';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { userName } = params;
  const { user, isInitialized } = useAuthStore();
  const { profile, isLoading, getProfile, followUser, unfollowUser } = useProfileStore();
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) {
      router.push('/login');
      return;
    }

    if (userName) {
      getProfile(userName);
      fetchUserPosts();
    }
  }, [userName, isInitialized, user]);

  useEffect(() => {
    if (profile && user) {
      const isUserFollowing = profile.followers?.some(
        (follower) => follower.userId === user.id
      );
      setIsFollowing(isUserFollowing);
    }
  }, [profile, user]);

  const fetchUserPosts = async () => {
    try {
      const response = await postService.getUserPosts(userName, 1, 20);
      setPosts(response.data.posts);
    } catch (error) {
      toast.error('Failed to load posts');
    }
  };

  const handleFollow = async () => {
    try {
      await followUser(profile.userName);
      setIsFollowing(true);
      toast.success('Following!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to follow');
    }
  };

  const handleUnfollow = async () => {
    try {
      await unfollowUser(profile.userName);
      setIsFollowing(false);
      toast.success('Unfollowed');
    } catch (error) {
      toast.error('Failed to unfollow');
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!profile) return <div className="p-8 text-center">User not found</div>;

  const isOwnProfile = user?.userName === userName;

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Profile Header */}
      <div className="flex gap-8 mb-12 pb-8 border-b border-gray-200 dark:border-gray-800">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 flex-shrink-0">
          {profile.profilePic ? (
            <img src={profile.profilePic} alt={profile.userName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">No photo</div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-3xl font-bold text-black dark:text-white">{profile.profileName}</h1>
            {isOwnProfile ? (
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
              >
                <FiEdit2 /> Edit Profile
              </button>
            ) : (
              <button
                onClick={isFollowing ? handleUnfollow : handleFollow}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg transition ${
                  isFollowing
                    ? 'bg-gray-200 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {isFollowing ? (
                  <>
                    <FiUserCheck /> Following
                  </>
                ) : (
                  <>
                    <FiUserPlus /> Follow
                  </>
                )}
              </button>
            )}
          </div>

          <p className="text-gray-600 dark:text-gray-400 mb-4">@{profile.userName}</p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{profile.description}</p>

          <div className="flex gap-8">
            <div>
              <div className="text-2xl font-bold text-black dark:text-white">{profile.postsCount}</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">Posts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-black dark:text-white">{profile.followersCount}</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">Followers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-black dark:text-white">{profile.followingCount}</div>
              <div className="text-gray-600 dark:text-gray-400 text-sm">Following</div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div>
        <h2 className="text-xl font-bold text-black dark:text-white mb-6">Posts</h2>
        {posts.length > 0 ? (
          <div className="grid grid-cols-3 gap-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition"
                onClick={() => router.push(`/post/${post.id}`)}
              >
                {post.photos?.[0] ? (
                  <img src={post.photos[0]} alt="Post" className="w-full h-full object-cover" />
                ) : post.video ? (
                  <video src={post.video} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No media</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">No posts yet</div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && <EditProfileModal profile={profile} onClose={() => setShowEditModal(false)} />}
    </div>
  );
}

function EditProfileModal({ profile, onClose }) {
  const { updateProfile } = useProfileStore();
  const [formData, setFormData] = useState({
    profileName: profile.profileName,
    description: profile.description || '',
    profilePic: profile.profilePic || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      toast.success('Profile updated!');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 p-8 rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-black dark:text-white mb-6">Edit Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Profile Name
            </label>
            <input
              type="text"
              name="profileName"
              value={formData.profileName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bio
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              maxLength={500}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Profile Picture URL
            </label>
            <input
              type="text"
              name="profilePic"
              value={formData.profilePic}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-black dark:text-white font-semibold py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
