'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * LazyImage component for optimized image loading
 * Supports lazy loading with intersection observer
 */
export default function LazyImage({
  src,
  alt,
  placeholder,
  className,
  onLoad,
  objectFit = 'cover',
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [imageSrc, setImageSrc] = useState(placeholder);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
      onLoad?.();
    };
    img.onerror = () => {
      setImageSrc(placeholder);
      setIsLoaded(true);
    };
  }, [isVisible, src, placeholder, onLoad]);

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden bg-gray-200 dark:bg-gray-800 ${className || ''}`}
    >
      <img
        src={imageSrc}
        alt={alt}
        className={`w-full h-full transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-50'
        }`}
        style={{ objectFit }}
      />
      {!isLoaded && isVisible && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <Loader2 className="w-5 h-5 text-white animate-spin" />
        </div>
      )}
    </div>
  );
}

/**
 * Hook for lazy loading images
 */
export const useLazyImage = (src) => {
  const [imageSrc, setImageSrc] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const img = new Image();
        img.src = src;
        img.onload = () => setImageSrc(src);
        observer.unobserve(entry.target);
      }
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [src]);

  return { ref, imageSrc };
};
