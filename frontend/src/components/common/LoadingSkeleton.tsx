import React from 'react';

interface LoadingSkeletonProps {
  rows?: number;
  height?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ rows = 5, height = 'h-14' }) => {
  return (
    <div className="space-y-3 font-sans">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`w-full ${height} rounded-2xl shimmer-skeleton bg-[#F0EFEA]/80 border border-[#E4E2DC]`}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
};
