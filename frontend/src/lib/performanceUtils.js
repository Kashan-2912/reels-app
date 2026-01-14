/**
 * Performance optimization utilities
 * Code splitting, lazy loading, image optimization
 */

import dynamic from 'next/dynamic';

/**
 * Lazy load components
 */
export const lazyLoadComponent = (importFunc, options = {}) => {
  return dynamic(importFunc, {
    loading: () => <div className="p-4 text-center text-gray-500">Loading...</div>,
    ...options,
  });
};

/**
 * Preload images for faster rendering
 */
export const preloadImages = (imageUrls) => {
  if (typeof document === 'undefined') return;

  imageUrls.forEach(url => {
    const img = new Image();
    img.src = url;
  });
};

/**
 * Debounce function for performance
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function for performance
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Request animation frame wrapper
 */
export const requestAnimationFrameWrapper = (callback) => {
  if (typeof window !== 'undefined') {
    return window.requestAnimationFrame(callback);
  }
};

/**
 * Cancel animation frame wrapper
 */
export const cancelAnimationFrameWrapper = (id) => {
  if (typeof window !== 'undefined') {
    return window.cancelAnimationFrame(id);
  }
};

/**
 * Batch DOM updates
 */
export const batchDOMUpdates = (updates) => {
  return new Promise(resolve => {
    requestAnimationFrameWrapper(() => {
      updates.forEach(update => update());
      resolve();
    });
  });
};

/**
 * Optimize image URL for different sizes
 */
export const getOptimizedImageUrl = (url, width, height, format = 'webp') => {
  if (!url) return '';

  // For Cloudinary URLs
  if (url.includes('cloudinary')) {
    return url.replace('/upload/', `/upload/w_${width},h_${height},c_limit,f_${format}/`);
  }

  // For other URLs, return as is (can be enhanced for other CDNs)
  return url;
};

/**
 * Generate srcset for responsive images
 */
export const generateSrcSet = (baseUrl, sizes = [320, 640, 960, 1280]) => {
  return sizes
    .map(size => `${getOptimizedImageUrl(baseUrl, size, size)} ${size}w`)
    .join(', ');
};

/**
 * Memory efficient infinite scroll loader
 */
export const createInfiniteScrollLoader = () => {
  const state = {
    isLoading: false,
    hasMore: true,
    page: 1,
    items: [],
  };

  return {
    reset: () => {
      state.isLoading = false;
      state.hasMore = true;
      state.page = 1;
      state.items = [];
    },

    loadMore: async (loadFunc) => {
      if (state.isLoading || !state.hasMore) return;

      state.isLoading = true;
      try {
        const newItems = await loadFunc(state.page);
        if (newItems.length === 0) {
          state.hasMore = false;
        } else {
          state.items = [...state.items, ...newItems];
          state.page += 1;
        }
      } finally {
        state.isLoading = false;
      }

      return state;
    },

    getState: () => ({ ...state }),
  };
};

/**
 * Request idle callback wrapper (for background tasks)
 */
export const requestIdleCallback = (callback, options = {}) => {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    return window.requestIdleCallback(callback, options);
  } else {
    // Fallback to setTimeout
    return setTimeout(callback, 1);
  }
};

/**
 * Cancel idle callback wrapper
 */
export const cancelIdleCallback = (id) => {
  if (typeof window !== 'undefined' && 'cancelIdleCallback' in window) {
    return window.cancelIdleCallback(id);
  } else {
    return clearTimeout(id);
  }
};

/**
 * Measure performance metrics
 */
export const performanceMetrics = {
  measure: (name, startMark, endMark) => {
    if (typeof window === 'undefined') return;

    try {
      window.performance.measure(name, startMark, endMark);
      const measure = window.performance.getEntriesByName(name)[0];
      return measure?.duration;
    } catch (error) {
      console.error('Performance measurement error:', error);
    }
  },

  mark: (name) => {
    if (typeof window === 'undefined') return;
    window.performance.mark(name);
  },

  getMetrics: () => {
    if (typeof window === 'undefined') return null;

    const navigation = window.performance.getEntriesByType('navigation')[0];
    return {
      dns: navigation?.domainLookupEnd - navigation?.domainLookupStart,
      tcp: navigation?.connectEnd - navigation?.connectStart,
      ttfb: navigation?.responseStart - navigation?.requestStart,
      fcp: window.performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
      lcp: window.performance.getEntriesByType('largest-contentful-paint')?.pop()?.startTime,
    };
  },
};

/**
 * Check network status
 */
export const useNetworkStatus = () => {
  if (typeof navigator === 'undefined') return { isOnline: true };

  return {
    isOnline: navigator.onLine,
    effectiveType: navigator.connection?.effectiveType,
    downlink: navigator.connection?.downlink,
    rtt: navigator.connection?.rtt,
  };
};

export default {
  debounce,
  throttle,
  preloadImages,
  getOptimizedImageUrl,
  generateSrcSet,
  performanceMetrics,
};
