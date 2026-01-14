import { create } from 'zustand';
import { profileService } from '../services';

export const useProfileStore = create((set) => ({
  profile: null,
  isLoading: false,
  error: null,
  userPosts: [],
  postsLoading: false,

  // Get user profile
  getProfile: async (userName) => {
    set({ isLoading: true, error: null });
    try {
      const response = await profileService.getProfile(userName);
      set({ profile: response.data.user, isLoading: false });
      return response.data.user;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to load profile', isLoading: false });
      throw error;
    }
  },

  // Get own profile
  getOwnProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await profileService.getOwnProfile();
      set({ profile: response.data.user, isLoading: false });
      return response.data.user;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to load profile', isLoading: false });
      throw error;
    }
  },

  // Update profile
  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await profileService.updateProfile(data);
      set({ profile: response.data.user, isLoading: false });
      return response.data.user;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to update profile', isLoading: false });
      throw error;
    }
  },

  // Follow user
  followUser: async (targetUserName) => {
    try {
      await profileService.followUser(targetUserName);
      set((state) => ({
        profile: state.profile
          ? {
              ...state.profile,
              followersCount: state.profile.followersCount + 1,
            }
          : state.profile,
      }));
    } catch (error) {
      throw error;
    }
  },

  // Unfollow user
  unfollowUser: async (targetUserName) => {
    try {
      await profileService.unfollowUser(targetUserName);
      set((state) => ({
        profile: state.profile
          ? {
              ...state.profile,
              followersCount: Math.max(0, state.profile.followersCount - 1),
            }
          : state.profile,
      }));
    } catch (error) {
      throw error;
    }
  },

  // Clear profile
  clearProfile: () => set({ profile: null, userPosts: [] }),
}));
