import React from 'react';

export default function Loading() {
  return (
    <div className="px-5 pt-4 pb-8 flex flex-col space-y-6">
      
      {/* 1. Quick Filter Bar Skeleton */}
      <div className="flex items-center gap-3 w-full animate-pulse">
        <div className="h-8 bg-warmgrey/20 rounded-full w-40"></div>
        <div className="h-8 bg-warmgrey/20 rounded-full w-24"></div>
        <div className="h-8 bg-ochre/20 rounded-full w-28 ml-auto"></div>
      </div>

      {/* 2. Grid Skeleton */}
      <div className="grid grid-cols-2 gap-3.5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-linen-border p-2 flex flex-col gap-2.5 shadow-sm">
            <div className="bg-warmgrey/10 animate-pulse rounded-xl aspect-[3/4] w-full"></div>
            <div className="flex flex-col gap-1 px-0.5">
              <div className="h-2.5 bg-warmgrey/20 animate-pulse rounded w-2/3"></div>
              <div className="h-3.5 bg-warmgrey/20 animate-pulse rounded w-full"></div>
              <div className="h-4 bg-warmgrey/20 animate-pulse rounded w-1/3 mt-0.5"></div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
