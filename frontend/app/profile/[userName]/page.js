"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiEdit2, FiSettings, FiGrid, FiBookmark, FiTag, FiCamera } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useProfileStore } from '@/src/store/profileStore';
import { useAuthStore } from '@/src/store/authStore';
import { postService, profileService } from '@/src/services';
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
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followingModalOpen, setFollowingModalOpen] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [userFollowingLookup, setUserFollowingLookup] = useState([]);

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

  useEffect(() => {
    const followingNames = user?.following?.map((f) => f.userName?.toLowerCase()) || [];
    setUserFollowingLookup(followingNames);
  }, [user]);


  const handleFollow = async () => {
    try {
      await followUser(profile.userName);
      setIsFollowing(true);
      updateFollowingLookup(profile.userName, true);
      toast.success('Following');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to follow');
    }
  };

  const handleUnfollow = async () => {
    try {
      await unfollowUser(profile.userName);
      setIsFollowing(false);
      updateFollowingLookup(profile.userName, false);
      toast.success('Unfollowed');
    } catch (error) {
      toast.error('Failed to unfollow');
    }
  };

  const withFollowingState = (list = [], { forceFollowing = false } = {}) => {
    const set = new Set(userFollowingLookup);
    return list.map((person) => ({
      ...person,
      isFollowing: forceFollowing ? true : set.has((person.userName || '').toLowerCase()),
    }));
  };

  const updateFollowingLookup = (targetUserName, nowFollowing) => {
    const key = (targetUserName || '').toLowerCase();
    setUserFollowingLookup((prev) => {
      if (!key) return prev;
      if (nowFollowing) {
        return prev.includes(key) ? prev : [...prev, key];
      }
      return prev.filter((name) => name !== key);
    });
  };

  const openFollowers = async () => {
    setFollowersModalOpen(true);
    setListLoading(true);
    try {
      const response = await profileService.getFollowers(userNameParam);
      const list = withFollowingState(response.data?.followers || []);
      setFollowers(list);
    } catch (error) {
      toast.error('Failed to load followers');
      setFollowers([]);
    } finally {
      setListLoading(false);
    }
  };

  const openFollowing = async () => {
    setFollowingModalOpen(true);
    setListLoading(true);
    try {
      const response = await profileService.getFollowing(userNameParam);
      const list = withFollowingState(response.data?.following || [], { forceFollowing: true });
      setFollowing(list);
    } catch (error) {
      toast.error('Failed to load following');
      setFollowing([]);
    } finally {
      setListLoading(false);
    }
  };

  const handleFollowerRemoved = async (targetUserName) => {
    setFollowers((prev) => prev.filter((p) => p.userName !== targetUserName));
    try {
      await getProfile(userNameParam);
    } catch (error) {
      // silent
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
                      className={`px-4 py-1.5 rounded-lg text-sm font-semibold ${isFollowing
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
                <Stat label="followers" value={profile.followersCount} onClick={openFollowers} />
                <Stat label="following" value={profile.followingCount} onClick={openFollowing} />
              </div>

              <div className="space-y-1">
                <div className="font-semibold text-sm">{profile.profileName}</div>
                {profile.description && <div className="text-sm text-gray-300 whitespace-pre-line">{profile.description}</div>}
              </div>

              <div className="flex gap-4 mt-3">
                {isOwnProfile && (
                  <HighlightBubble label="New" />
                )}
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
                description={activeTab === 'saved' ? 'Save posts to see them here.' : 'When people tag you, they will appear here.'}
              />
            )}
          </section>
        </main>
      </div>

      {showEditModal && <EditProfileModal profile={profile} onClose={() => setShowEditModal(false)} />}
      {followersModalOpen && (
        <FollowersModal
          title="Followers"
          people={followers}
          loading={listLoading}
          onClose={() => setFollowersModalOpen(false)}
          onFollowStateChange={updateFollowingLookup}
          mode="followers"
          onRemoveFollower={handleFollowerRemoved}
        />
      )}
      {followingModalOpen && (
        <FollowersModal
          title="Following"
          people={following}
          loading={listLoading}
          onClose={() => setFollowingModalOpen(false)}
          onFollowStateChange={updateFollowingLookup}
          mode="following"
        />
      )}
    </div>
  );
}

function Stat({ label, value, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 ${onClick ? 'hover:opacity-80 transition' : ''}`}
      disabled={!onClick}
    >
      <span className="font-semibold text-white">{value ?? 0}</span>
      <span className="text-gray-400 capitalize">{label}</span>
    </button>
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
      className={`flex items-center gap-2 py-4 px-4 border-t-2 ${active ? 'border-white text-white' : 'border-transparent text-gray-500'
        }`}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );
}

function PostGrid({ posts, onOpen }) {
  const [currentIndexByPost, setCurrentIndexByPost] = useState({});

  useEffect(() => {
    const next = {};
    (posts || []).forEach((post) => {
      const postId = post.id || post._id;
      if (postId) next[postId] = 0;
    });
    setCurrentIndexByPost(next);
  }, [posts]);

  if (!posts || posts.length === 0) {
    return (
      <EmptyState
        title="Share Posts"
        description="When you share posts, they will appear on your profile."
        actionLabel="Share your first post"
      />
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 md:gap-2 mt-6">
      {posts.map((post) => {
        const postId = post.id || post._id;
        const photos = Array.isArray(post?.photos) ? post.photos : [];
        const currentIndex = currentIndexByPost[postId] || 0;
        return (
          <div
            key={postId}
            onClick={() => onOpen(postId)}
            className="relative aspect-square bg-neutral-900 overflow-hidden group cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onOpen(postId);
              }
            }}
          >
            {photos[currentIndex] ? (
              <img src={photos[currentIndex]} alt="Post" className="h-full w-full object-cover group-hover:scale-105 transition" />
            ) : post.video ? (
              <video src={post.video} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-500">No media</div>
            )}

            {photos.length > 1 && (
              <>
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded z-10">
                  {currentIndex + 1} / {photos.length}
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndexByPost((prev) => ({
                      ...prev,
                      [postId]: (currentIndex - 1 + photos.length) % photos.length,
                    }));
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white w-7 h-7 rounded-full flex items-center justify-center z-10"
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndexByPost((prev) => ({
                      ...prev,
                      [postId]: (currentIndex + 1) % photos.length,
                    }));
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white w-7 h-7 rounded-full flex items-center justify-center z-10"
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            )}
          </div>
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

function FollowersModal({ title, people, onClose, loading, onFollowStateChange, mode = 'followers', onRemoveFollower }) {
  const { user } = useAuthStore();
  const [list, setList] = useState(people || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [removingMap, setRemovingMap] = useState({});

  useEffect(() => {
    setList(people || []);
    setSearchTerm('');
  }, [people]);

  const toggleFollow = async (targetUserName, currentlyFollowing) => {
    try {
      if (currentlyFollowing) {
        await profileService.unfollowUser(targetUserName);
      } else {
        await profileService.followUser(targetUserName);
      }
      setList((prev) =>
        prev.map((p) =>
          p.userName === targetUserName ? { ...p, isFollowing: !currentlyFollowing } : p
        )
      );
      if (onFollowStateChange) onFollowStateChange(targetUserName, !currentlyFollowing);
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const removeFollower = async (targetUserName) => {
    try {
      setRemovingMap((prev) => ({ ...prev, [targetUserName]: true }));
      await profileService.removeFollower(targetUserName);
      setList((prev) => prev.filter((p) => p.userName !== targetUserName));
      if (onRemoveFollower) onRemoveFollower(targetUserName);
      toast.success('Removed follower');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove follower');
    } finally {
      setRemovingMap((prev) => {
        const next = { ...prev };
        delete next[targetUserName];
        return next;
      });
    }
  };

  const filteredList = list.filter((person) => {
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase();
    return (
      person.userName?.toLowerCase().includes(query) ||
      person.profileName?.toLowerCase().includes(query) ||
      person.fullName?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-[#111] border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-center relative py-4 border-b border-neutral-800">
          <h3 className="text-white font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="absolute right-4 top-3 text-gray-400 hover:text-white text-xl"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="px-4 py-3 border-b border-neutral-800">
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-2 text-sm text-white placeholder-gray-500"
          />
        </div>

        <div className="max-h-[420px] overflow-y-auto">
          {loading ? (
            <div className="py-8 text-center text-gray-400">Loading...</div>
          ) : filteredList.length === 0 ? (
            <div className="py-8 text-center text-gray-400">No users to show</div>
          ) : (
            <div className="divide-y divide-neutral-900">
              {filteredList.map((person) => (
                <div key={person.userName} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-800 flex-shrink-0">
                    {person.profilePic ? (
                      <img src={person.profilePic} alt={person.userName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">👤</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{person.userName}</div>
                    <div className="text-xs text-gray-400 truncate">{person.profileName || person.fullName || ''}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {mode === 'following' && person.userName !== user?.userName && (
                      <button
                        onClick={() => toggleFollow(person.userName, person.isFollowing)}
                        className={`text-sm font-semibold px-4 py-2 rounded-lg transition ${person.isFollowing
                            ? 'bg-neutral-900 border border-neutral-800 text-white'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                      >
                        {person.isFollowing ? 'Following' : 'Follow'}
                      </button>
                    )}
                    {mode === 'followers' && person.userName !== user?.userName && (
                      <button
                        type="button"
                        onClick={() => removeFollower(person.userName)}
                        disabled={removingMap[person.userName]}
                        className={`text-sm font-semibold px-4 py-2 rounded-lg text-white transition ${removingMap[person.userName]
                            ? 'bg-red-500/60 cursor-not-allowed'
                            : 'bg-red-500 hover:bg-red-600'
                          }`}
                      >
                        {removingMap[person.userName] ? 'Removing...' : 'Remove'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
