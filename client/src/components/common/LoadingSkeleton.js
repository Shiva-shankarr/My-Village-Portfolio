import React from 'react';

const LoadingSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse" data-testid="loading-skeleton">
      {/* Image Skeleton */}
      <div className="h-48 bg-gray-200" />

      {/* Content Skeleton */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="w-24 h-6 bg-gray-200 rounded-full" />
          <div className="w-20 h-4 bg-gray-200 rounded" />
        </div>

        {/* Title Skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-6 bg-gray-200 rounded w-3/4" />
          <div className="h-6 bg-gray-200 rounded w-1/2" />
        </div>

        {/* Content Skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
        </div>

        {/* Button Skeleton */}
        <div className="mt-4 w-24 h-6 bg-gray-200 rounded" />
      </div>
    </div>
  );
};

export default LoadingSkeleton; 