import React from 'react';

// Full page loading spinner
export const FullPageLoader = ({ message = 'Loading...' }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>
    <p className="mt-4 text-gray-500 text-sm font-medium">{message}</p>
  </div>
);

// Inline button spinner
export const InlineLoader = ({ size = 'sm', color = 'white' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };
  const colors = { white: 'border-white border-t-transparent', primary: 'border-primary-600 border-t-transparent' };
  return (
    <span
      className={`${sizes[size]} border-2 ${colors[color]} rounded-full animate-spin inline-block`}
    />
  );
};

// Skeleton card for property grid loading
export const CardSkeleton = () => (
  <div className="bg-white rounded-xl overflow-hidden shadow-card border border-gray-100">
    <div className="skeleton h-52 w-full" />
    <div className="p-4 space-y-3">
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-3 w-1/2" />
      <div className="flex gap-4">
        <div className="skeleton h-3 w-16" />
        <div className="skeleton h-3 w-16" />
        <div className="skeleton h-3 w-16" />
      </div>
      <div className="skeleton h-5 w-1/3" />
    </div>
  </div>
);

// Grid of skeleton cards
export const PropertyGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

// Skeleton for list items
export const ListSkeleton = ({ count = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white rounded-lg p-4 border border-gray-100 flex gap-4">
        <div className="skeleton w-12 h-12 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-1/2" />
          <div className="skeleton h-3 w-3/4" />
          <div className="skeleton h-3 w-1/4" />
        </div>
      </div>
    ))}
  </div>
);

// Spinner overlay
export const SpinnerOverlay = () => (
  <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10 rounded-xl">
    <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
  </div>
);

export default FullPageLoader;
