import { create } from 'zustand';
import { authService, profileService } from '@/src/services';

export const useAuthStore = create((set) => ({
  user: null,
  isLoading: false,
  error: null,
  isInitialized: false,

  // Load user from localStorage or revalidate via API (cookie-based session)
  initAuth: async () => {
    // Guard against SSR where localStorage is unavailable
    if (typeof window === 'undefined') return;

    try {
      set({ isLoading: true, error: null });

      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        set({ user: JSON.parse(savedUser), isLoading: false, isInitialized: true });
        return;
      }

      // If no cached user, try to fetch the current user using the session cookie
      const response = await profileService.getOwnProfile();
      const user = response.data?.user || response.data;
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        set({ user, isLoading: false, isInitialized: true });
        return;
      }

      set({ user: null, isLoading: false, isInitialized: true });
    } catch (error) {
      // If session is invalid, clear any stale data and keep user logged out
      localStorage.removeItem('user');
      set({ user: null, isLoading: false, isInitialized: true });
    }
  },

  // Register
  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register(userData);
      const user = response.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isLoading: false, isInitialized: true });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Registration failed';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  // Login
  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(credentials);
      const user = response.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isLoading: false, isInitialized: true });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  // Logout
  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await authService.logout();
      localStorage.removeItem('user');
      set({ user: null, isLoading: false, isInitialized: true });
    } catch (error) {
      set({ error: 'Logout failed', isLoading: false });
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
