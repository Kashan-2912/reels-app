"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiEdit2, FiSettings, FiGrid, FiBookmark, FiTag, FiCamera } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useProfileStore } from '@/src/store/profileStore';
import { useAuthStore } from '@/src/store/authStore';
import { postService } from '@/src/services';
import Sidebar from '@/src/components/Sidebar';

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userNameParam = Array.isArray(params?.userName) ? params.userName[0] : params?.userName;

  const { user, isInitialized, initAuth } = useAuthStore();
  const { profile, isLoading, getProfile, followUser, unfollowUser } = useProfileStore();

  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    if (!isInitialized) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchUserPosts = async () => {
      try {
        const response = await postService.getUserPosts(userNameParam, 1, 30);
        setPosts(response.data?.posts || []);
      } catch (error) {
        toast.error('Failed to load posts');
      }
    };

    const load = async () => {
      try {
        await getProfile(userNameParam);
        await fetchUserPosts();
      } catch (error) {
        toast.error('Failed to load profile');
      }
    };

    if (userNameParam) load();
  }, [userNameParam, isInitialized, user, getProfile, router]);

  useEffect(() => {
    if (!profile || !user) {
      setIsFollowing(false);
      return;
    }
    const isUserFollowing = profile.followers?.some((follower) => follower.userId === user.id);
    setIsFollowing(Boolean(isUserFollowing));
  }, [profile, user]);


  const handleFollow = async () => {
    try {
      await followUser(profile.userName);
      // setIsFollowing(true);
      toast.success('Following');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to follow');
    }
  };

  const handleUnfollow = async () => {
    try {
      await unfollowUser(profile.userName);
      // setIsFollowing(false);
      toast.success('Unfollowed');
    } catch (error) {
      toast.error('Failed to unfollow');
    }
  };

  if (!isInitialized) return <div className="p-8 text-center text-gray-400">Loading...</div>;
  if (isLoading) return <div className="p-8 text-center text-gray-400">Loading profile...</div>;
  if (!profile) return <div className="p-8 text-center text-gray-400">User not found</div>;

  const isOwnProfile = user?.userName === userNameParam;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="max-w-7xl mx-auto flex">
        <Sidebar />

        <main className="flex-1 px-4 md:px-10 py-8">
          <section className="flex flex-col md:flex-row md:items-start gap-10 pb-8 border-b border-neutral-900">
            <div className="flex justify-center md:justify-start w-full md:w-auto">
              <div className="relative h-36 w-36 md:h-44 md:w-44 rounded-full overflow-hidden bg-neutral-800">
                {profile.profilePic ? (
                  <img src={profile.profilePic} alt={profile.userName} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-500 text-4xl">👤</div>
                )}
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold">{profile.userName}</h1>
                {isOwnProfile ? (
                  <>
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="px-4 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-sm font-semibold"
                    >
                      Edit profile
                    </button>
                    <button className="px-4 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-sm font-semibold">
                      View archive
                    </button>
                    <button className="p-2 rounded-lg bg-neutral-900 border border-neutral-800">
                      <FiSettings size={18} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={isFollowing ? handleUnfollow : handleFollow}
                      className={`px-4 py-1.5 rounded-lg text-sm font-semibold ${
                        isFollowing
                          ? 'bg-neutral-900 border border-neutral-800'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                    <button className="px-4 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-sm font-semibold">
                      Message
                    </button>
                  </>
                )}
              </div>

              <div className="flex gap-8 text-sm">
                <Stat label="posts" value={profile.postsCount} />
                <Stat label="followers" value={profile.followersCount} />
                <Stat label="following" value={profile.followingCount} />
              </div>

              <div className="space-y-1">
                <div className="font-semibold text-sm">{profile.profileName}</div>
                {profile.description && <div className="text-sm text-gray-300 whitespace-pre-line">{profile.description}</div>}
              </div>

              <div className="flex gap-4 mt-3">
                <HighlightBubble label="New" />
              </div>
            </div>
          </section>

          <section className="mt-6">
            <div className="flex items-center justify-center gap-10 text-xs uppercase tracking-[0.2em] text-gray-400 border-t border-neutral-900">
              <TabButton icon={FiGrid} label="Posts" active={activeTab === 'posts'} onClick={() => setActiveTab('posts')} />
              <TabButton icon={FiBookmark} label="Saved" active={activeTab === 'saved'} onClick={() => setActiveTab('saved')} />
              <TabButton icon={FiTag} label="Tagged" active={activeTab === 'tagged'} onClick={() => setActiveTab('tagged')} />
            </div>

            {activeTab === 'posts' && (
              <PostGrid posts={posts} onOpen={(id) => router.push(`/post/${id}`)} />
            )}

            {activeTab !== 'posts' && (
              <EmptyState
                title={activeTab === 'saved' ? 'Save' : 'Tag'}
                description={activeTab === 'saved' ? 'Save photos and videos to see them here.' : 'When people tag you, they will appear here.'}
              />
            )}
          </section>
        </main>
      </div>

      {showEditModal && <EditProfileModal profile={profile} onClose={() => setShowEditModal(false)} />}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-semibold text-white">{value ?? 0}</span>
      <span className="text-gray-400">{label}</span>
    </div>
  );
}

function HighlightBubble({ label }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="h-16 w-16 rounded-full border border-neutral-800 bg-neutral-900 flex items-center justify-center text-gray-400">+
      </div>
      <span className="text-xs text-gray-400">{label}</span>
    </div>
  );
}

function TabButton({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 py-4 px-4 border-t-2 ${
        active ? 'border-white text-white' : 'border-transparent text-gray-500'
      }`}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );
}

function PostGrid({ posts, onOpen }) {
  if (!posts || posts.length === 0) {
    return (
      <EmptyState
        title="Share Photos"
        description="When you share photos, they will appear on your profile."
        actionLabel="Share your first photo"
      />
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 md:gap-2 mt-6">
      {posts.map((post) => {
        const postId = post.id || post._id;
        return (
          <button
            key={postId}
            onClick={() => onOpen(postId)}
            className="relative aspect-square bg-neutral-900 overflow-hidden group"
          >
            {post.photos?.[0] ? (
              <img src={post.photos[0]} alt="Post" className="h-full w-full object-cover group-hover:scale-105 transition" />
            ) : post.video ? (
              <video src={post.video} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-500">No media</div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function EmptyState({ title, description, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-gray-300">
      <div className="h-20 w-20 rounded-full border border-neutral-800 flex items-center justify-center mb-4">
        <FiCamera size={28} />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-400 max-w-md">{description}</p>
      {actionLabel && <button className="mt-4 text-sm font-semibold text-blue-400">{actionLabel}</button>}
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
      toast.success('Profile updated');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-[#111] border border-neutral-800 p-6 rounded-2xl w-full max-w-md text-white">
        <h2 className="text-xl font-semibold mb-4">Edit profile</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Profile name</label>
            <input
              type="text"
              name="profileName"
              value={formData.profileName}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Bio</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Profile picture URL</label>
            <input
              type="text"
              name="profilePic"
              value={formData.profilePic}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 font-semibold text-white transition"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg bg-neutral-900 border border-neutral-800 font-semibold text-white hover:bg-neutral-800 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
