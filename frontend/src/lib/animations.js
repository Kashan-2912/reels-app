/**
 * Animation utilities and configurations
 * Smooth transitions, micro-interactions, loading animations
 */

/**
 * CSS animation classes
 * These should be added to your tailwind.config.js
 */
export const animationClasses = {
  // Fade animations
  fadeIn: 'animate-fadeIn',
  fadeOut: 'animate-fadeOut',
  fadeInUp: 'animate-fadeInUp',
  fadeInDown: 'animate-fadeInDown',

  // Scale animations
  scaleIn: 'animate-scaleIn',
  scaleOut: 'animate-scaleOut',
  scaleUp: 'animate-scaleUp hover:scale-110',

  // Slide animations
  slideInRight: 'animate-slideInRight',
  slideInLeft: 'animate-slideInLeft',
  slideOutRight: 'animate-slideOutRight',
  slideOutLeft: 'animate-slideOutLeft',

  // Bounce animations
  bounce: 'animate-bounce',
  pulse: 'animate-pulse',
  wiggle: 'animate-wiggle',

  // Combined animations
  slideInLeftFade: 'animate-slideInLeft animate-fadeIn',
  slideInRightFade: 'animate-slideInRight animate-fadeIn',
};

/**
 * Tailwind animation configuration
 * Add to tailwind.config.js extend section
 */
export const tailwindAnimationConfig = {
  keyframes: {
    fadeIn: {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' },
    },
    fadeOut: {
      '0%': { opacity: '1' },
      '100%': { opacity: '0' },
    },
    fadeInUp: {
      '0%': {
        opacity: '0',
        transform: 'translateY(10px)',
      },
      '100%': {
        opacity: '1',
        transform: 'translateY(0)',
      },
    },
    fadeInDown: {
      '0%': {
        opacity: '0',
        transform: 'translateY(-10px)',
      },
      '100%': {
        opacity: '1',
        transform: 'translateY(0)',
      },
    },
    scaleIn: {
      '0%': {
        opacity: '0',
        transform: 'scale(0.95)',
      },
      '100%': {
        opacity: '1',
        transform: 'scale(1)',
      },
    },
    scaleOut: {
      '0%': {
        opacity: '1',
        transform: 'scale(1)',
      },
      '100%': {
        opacity: '0',
        transform: 'scale(0.95)',
      },
    },
    scaleUp: {
      '0%': { transform: 'scale(1)' },
      '50%': { transform: 'scale(1.05)' },
      '100%': { transform: 'scale(1)' },
    },
    slideInRight: {
      '0%': {
        opacity: '0',
        transform: 'translateX(30px)',
      },
      '100%': {
        opacity: '1',
        transform: 'translateX(0)',
      },
    },
    slideInLeft: {
      '0%': {
        opacity: '0',
        transform: 'translateX(-30px)',
      },
      '100%': {
        opacity: '1',
        transform: 'translateX(0)',
      },
    },
    slideOutRight: {
      '0%': {
        opacity: '1',
        transform: 'translateX(0)',
      },
      '100%': {
        opacity: '0',
        transform: 'translateX(30px)',
      },
    },
    slideOutLeft: {
      '0%': {
        opacity: '1',
        transform: 'translateX(0)',
      },
      '100%': {
        opacity: '0',
        transform: 'translateX(-30px)',
      },
    },
    wiggle: {
      '0%, 100%': { transform: 'rotate(-1deg)' },
      '50%': { transform: 'rotate(1deg)' },
    },
  },
  animation: {
    fadeIn: 'fadeIn 0.3s ease-in-out',
    fadeOut: 'fadeOut 0.3s ease-in-out',
    fadeInUp: 'fadeInUp 0.4s ease-out',
    fadeInDown: 'fadeInDown 0.4s ease-out',
    scaleIn: 'scaleIn 0.3s ease-out',
    scaleOut: 'scaleOut 0.3s ease-out',
    scaleUp: 'scaleUp 0.3s ease-in-out',
    slideInRight: 'slideInRight 0.35s ease-out',
    slideInLeft: 'slideInLeft 0.35s ease-out',
    slideOutRight: 'slideOutRight 0.35s ease-in',
    slideOutLeft: 'slideOutLeft 0.35s ease-in',
    wiggle: 'wiggle 0.5s ease-in-out infinite',
  },
};

/**
 * Spring animation transitions
 * For smooth, natural-feeling animations
 */
export const springTransition = {
  fast: 'transition-all duration-150 ease-out',
  normal: 'transition-all duration-300 ease-out',
  slow: 'transition-all duration-500 ease-out',
  elastic: 'transition-all duration-500 ease-[cubic-bezier(0.68, -0.55, 0.265, 1.55)]',
};

/**
 * Micro-interaction animations
 */
export const microInteractions = {
  // Button click feedback
  buttonClick: `
    active:scale-95
    transition-transform
    duration-100
  `,

  // Hover scale
  hoverScale: `
    hover:scale-105
    transition-transform
    duration-200
  `,

  // Like button heart animation
  likeHeartAnimation: `
    animate-[ping_0.6s_ease-in-out_forwards]
  `,

  // Loading spinner
  spinner: 'animate-spin',

  // Pulse effect
  pulse: 'animate-pulse',

  // Shake animation (for errors)
  shake: `
    animate-[shake_0.4s_ease-in-out_forwards]
  `,
};

/**
 * Animation helpers
 */
export const animationHelpers = {
  /**
   * Delay animation start
   */
  withDelay: (animation, delayMs) => {
    return {
      animation,
      animationDelay: `${delayMs}ms`,
    };
  },

  /**
   * Stagger animations for list items
   */
  staggerAnimation: (index, delayUnit = 50) => {
    return {
      animationDelay: `${index * delayUnit}ms`,
    };
  },

  /**
   * Create smooth page transitions
   */
  pageTransition: (direction = 'in') => {
    const baseClass = 'transition-all duration-300 ease-out';
    if (direction === 'in') {
      return `${baseClass} opacity-100 translate-y-0`;
    } else {
      return `${baseClass} opacity-0 translate-y-4`;
    }
  },
};

/**
 * Framer Motion-like animations (using CSS)
 * Can be used without external dependencies
 */
export const animations = {
  /**
   * Pop animation for modals/dropdowns
   */
  pop: {
    initial: 'scale-95 opacity-0',
    animate: 'scale-100 opacity-100',
    exit: 'scale-95 opacity-0',
    transition: 'duration-200',
  },

  /**
   * Slide animation for sidebars
   */
  slide: {
    initial: '-translate-x-full opacity-0',
    animate: 'translate-x-0 opacity-100',
    exit: '-translate-x-full opacity-0',
    transition: 'duration-300',
  },

  /**
   * Fade animation
   */
  fade: {
    initial: 'opacity-0',
    animate: 'opacity-100',
    exit: 'opacity-0',
    transition: 'duration-300',
  },

  /**
   * Bounce animation
   */
  bounce: {
    initial: 'translate-y-2 opacity-0',
    animate: 'translate-y-0 opacity-100',
    exit: 'translate-y-2 opacity-0',
    transition: 'duration-300 ease-out',
  },
};

/**
 * Apply animation to element
 */
export const applyAnimation = (element, animation, duration = 300) => {
  if (!element) return;

  element.style.animation = `${animation} ${duration}ms ease-in-out`;

  return new Promise(resolve => {
    setTimeout(() => {
      element.style.animation = '';
      resolve();
    }, duration);
  });
};

/**
 * Prefers reduced motion check
 * Respect user's accessibility preferences
 */
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get safe animation class
 * Respects prefers-reduced-motion
 */
export const getSafeAnimationClass = (animationClass) => {
  return prefersReducedMotion() ? '' : animationClass;
};

export default {
  animationClasses,
  springTransition,
  microInteractions,
  animationHelpers,
  animations,
  applyAnimation,
  prefersReducedMotion,
  getSafeAnimationClass,
};
