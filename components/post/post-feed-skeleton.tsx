/**
 * @file components/post/post-feed-skeleton.tsx
 * @description PostFeed 로딩 스켈레톤 컴포넌트
 * 
 * 게시물 로딩 중 표시되는 스켈레톤 UI입니다.
 * Shimmer 효과가 적용된 스켈레톤입니다.
 */

export function PostFeedSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-[var(--instagram-bg)] border border-[var(--instagram-border)] rounded-lg mb-4"
        >
          {/* Header Skeleton */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--instagram-border-light)] shimmer" />
              <div className="flex flex-col gap-2">
                <div className="h-4 w-20 bg-[var(--instagram-border-light)] rounded shimmer" />
                <div className="h-3 w-16 bg-[var(--instagram-border-light)] rounded shimmer" />
              </div>
            </div>
            <div className="w-5 h-5 bg-[var(--instagram-border-light)] rounded shimmer" />
          </div>

          {/* Image Skeleton */}
          <div className="w-full aspect-square bg-[var(--instagram-border-light)] shimmer" />

          {/* Action Bar Skeleton */}
          <div className="px-4 py-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 bg-[var(--instagram-border-light)] rounded shimmer" />
                <div className="w-6 h-6 bg-[var(--instagram-border-light)] rounded shimmer" />
                <div className="w-6 h-6 bg-[var(--instagram-border-light)] rounded shimmer" />
              </div>
              <div className="w-6 h-6 bg-[var(--instagram-border-light)] rounded shimmer" />
            </div>
            <div className="h-4 w-24 bg-[var(--instagram-border-light)] rounded mb-2 shimmer" />
            <div className="h-4 w-full bg-[var(--instagram-border-light)] rounded mb-1 shimmer" />
            <div className="h-4 w-3/4 bg-[var(--instagram-border-light)] rounded shimmer" />
          </div>
        </div>
      ))}
    </>
  );
}

