import React from 'react';

export default function SkeletonCard({ count = 4 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card overflow-hidden animate-pulse">
          <div className="h-48 sm:h-56 skeleton" />
          <div className="p-5 space-y-3">
            <div className="h-3 w-16 skeleton rounded-full" />
            <div className="h-5 w-3/4 skeleton rounded" />
            <div className="h-3 w-full skeleton rounded" />
            <div className="h-3 w-2/3 skeleton rounded" />
            <div className="flex justify-between items-center mt-4">
              <div className="h-7 w-20 skeleton rounded" />
              <div className="h-10 w-10 skeleton rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
