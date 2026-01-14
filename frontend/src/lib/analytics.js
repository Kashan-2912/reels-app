/**
 * Analytics and tracking utilities
 * Supports Google Analytics, Mixpanel, or custom events
 */

// Initialize analytics
export const initializeAnalytics = () => {
  // Google Analytics
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA_ID) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', process.env.NEXT_PUBLIC_GA_ID);
  }
};

/**
 * Track page view
 */
export const trackPageView = (pageName, properties = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_title: pageName,
      ...properties,
    });
  }

  // Custom event logging (can be sent to backend)
  logEvent('page_view', {
    page: pageName,
    ...properties,
  });
};

/**
 * Track custom event
 */
export const trackEvent = (eventName, properties = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, properties);
  }

  logEvent(eventName, properties);
};

/**
 * Track user action
 */
export const trackUserAction = (action, target, properties = {}) => {
  trackEvent(`user_${action}`, {
    action,
    target,
    timestamp: new Date().toISOString(),
    ...properties,
  });
};

/**
 * Track post engagement
 */
export const trackPostEngagement = (postId, engagement, properties = {}) => {
  trackEvent('post_engagement', {
    post_id: postId,
    engagement_type: engagement, // like, comment, share, save
    timestamp: new Date().toISOString(),
    ...properties,
  });
};

/**
 * Track search
 */
export const trackSearch = (query, resultCount, properties = {}) => {
  trackEvent('search', {
    query,
    result_count: resultCount,
    timestamp: new Date().toISOString(),
    ...properties,
  });
};

/**
 * Track error
 */
export const trackError = (errorName, errorMessage, properties = {}) => {
  trackEvent('error', {
    error_name: errorName,
    error_message: errorMessage,
    timestamp: new Date().toISOString(),
    ...properties,
  });
};

/**
 * Log event to backend
 * Can be used for custom analytics
 */
const logEvent = async (eventName, data) => {
  try {
    // TODO: Send to backend analytics endpoint
    // await fetch('/api/analytics', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ event: eventName, ...data }),
    // });
    
    // For now, just log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', eventName, data);
    }
  } catch (error) {
    console.error('Analytics logging error:', error);
  }
};

export default {
  initializeAnalytics,
  trackPageView,
  trackEvent,
  trackUserAction,
  trackPostEngagement,
  trackSearch,
  trackError,
};
