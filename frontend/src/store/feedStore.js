import { create } from 'zustand';
import { postService, feedService } from '@/src/services';

export const useFeedStore = create((set) => ({
  posts: [],
  isLoading: false,
  error: null,
  hasMore: true,
  currentPage: 1,

  // Get home feed
  getHomeFeed: async (page = 1) => {
    if (page === 1) set({ isLoading: true, error: null });
    try {
      const response = await feedService.getHomeFeed(page, 10);
      set((state) => ({
        posts: page === 1 ? response.data.posts : [...state.posts, ...response.data.posts],
        isLoading: false,
        hasMore: page < response.data.totalPages,
        currentPage: page,
      }));
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to load feed', isLoading: false });
      throw error;
    }
  },

  // Like post
  likePost: async (postId) => {
    try {
      await postService.likePost(postId);
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === postId
            ? { ...post, isLiked: true, likesCount: post.likesCount + 1 }
            : post
        ),
      }));
    } catch (error) {
      throw error;
    }
  },

  // Unlike post
  unlikePost: async (postId) => {
    try {
      await postService.unlikePost(postId);
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === postId
            ? { ...post, isLiked: false, likesCount: post.likesCount - 1 }
            : post
        ),
      }));
    } catch (error) {
      throw error;
    }
  },

  // Save post
  savePost: async (postId) => {
    try {
      await postService.savePost(postId);
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === postId
            ? { ...post, isSaved: true, savesCount: post.savesCount + 1 }
            : post
        ),
      }));
    } catch (error) {
      throw error;
    }
  },

  // Unsave post
  unsavePost: async (postId) => {
    try {
      await postService.unsavePost(postId);
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === postId
            ? { ...post, isSaved: false, savesCount: post.savesCount - 1 }
            : post
        ),
      }));
    } catch (error) {
      throw error;
    }
  },

  // Clear feed
  clearFeed: () => set({ posts: [], currentPage: 1, hasMore: true }),
}));
