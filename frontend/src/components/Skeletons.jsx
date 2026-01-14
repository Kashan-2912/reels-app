'use client';

export function PostSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden animate-pulse">
      {/* Header */}
      <div className="p-4 flex items-center gap-3 border-b border-gray-200 dark:border-gray-800">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-2 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
      </div>

      {/* Image */}
      <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800" />

      {/* Caption */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 space-y-3">
        <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
      </div>

      {/* Engagement */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800 flex gap-4">
        <div className="h-2 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-2 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-2 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
      </div>

      {/* Actions */}
      <div className="p-4 flex gap-4">
        <div className="h-8 flex-1 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-8 flex-1 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-8 flex-1 bg-gray-200 dark:bg-gray-800 rounded" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="max-w-2xl mx-auto p-4 animate-pulse">
      {/* Header */}
      <div className="mb-8 border-b border-gray-200 dark:border-gray-800 pb-8">
        <div className="flex items-start gap-6">
          <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-800" />
          <div className="flex-1 space-y-4">
            <div className="h-4 w-40 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-3 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="flex gap-8 pt-4">
              <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {[...Array(3)].map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );
}

export function SearchSkeleton() {
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-3 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4 flex gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
            <div className="h-2 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Skeleton() {
  return <PostSkeleton />;
}
