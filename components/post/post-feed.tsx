/**
 * @file components/post/post-feed.tsx
 * @description PostFeed 컴포넌트
 * 
 * 홈 피드를 표시하는 컴포넌트입니다.
 * 
 * 주요 기능:
 * - 홈 피드 목록 조회 (최신순 정렬)
 * - 무한 스크롤 구현 (Intersection Observer)
 * - 로딩 상태: Skeleton UI 표시
 * - 빈 피드 상태 처리
 */

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { PostCard } from "./post-card";
import { Post, Comment } from "@/types/post";
import { PostFeedSkeleton } from "./post-feed-skeleton";

interface PostFeedProps {
  initialPosts?: Post[];
  onLoadMore?: (page: number) => Promise<Post[]>;
  onLike?: (postId: string) => Promise<void>;
  onCommentClick?: (postId: string) => void;
  onDelete?: (postId: string) => void;
}

export function PostFeed({
  initialPosts = [],
  onLoadMore,
  onLike,
  onCommentClick,
  onDelete,
}: PostFeedProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observerTarget = useRef<HTMLDivElement>(null);

  // initialPosts가 변경되면 내부 상태도 업데이트
  useEffect(() => {
    console.log("PostFeed: initialPosts 변경됨", { count: initialPosts.length, posts: initialPosts });
    setPosts(initialPosts);
    // 초기 게시물이 로드되면 페이지를 1로 리셋
    setPage(1);
    setHasMore(initialPosts.length > 0);
  }, [initialPosts]);

  // 좋아요 처리
  const handleLike = useCallback(
    async (postId: string) => {
      if (onLike) {
        try {
          await onLike(postId);
          // 로컬 상태 업데이트 (낙관적 업데이트는 PostCard에서 처리)
        } catch (error) {
          console.error("좋아요 처리 실패:", error);
        }
      }
    },
    [onLike]
  );

  // 게시물 삭제 처리
  const handleDelete = useCallback(
    (postId: string) => {
      console.log("PostFeed: 게시물 삭제", { postId });
      // 목록에서 삭제된 게시물 제거
      setPosts((prev) => prev.filter((post) => post.id !== postId));
      
      // 부모 컴포넌트에 삭제 알림
      if (onDelete) {
        onDelete(postId);
      }
    },
    [onDelete]
  );

  // 더 많은 게시물 로드
  const loadMorePosts = useCallback(async () => {
    if (!onLoadMore || isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const nextPage = page + 1;
      const newPosts = await onLoadMore(nextPage);

      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
        setPage(nextPage);
      }
    } catch (error) {
      console.error("게시물 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  }, [onLoadMore, isLoading, hasMore, page]);

  // Intersection Observer 설정
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMorePosts();
        }
      },
      {
        root: null,
        rootMargin: "100px", // 뷰포트 아래 100px 전에 로드 시작
        threshold: 0.1,
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, loadMorePosts]);

  // 빈 피드 상태
  if (posts.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[var(--instagram-text)] mb-2">
            아직 게시물이 없습니다
          </h2>
          <p className="text-[var(--instagram-text-secondary)] mb-4">
            첫 번째 게시물을 만들어보세요!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 게시물 목록 */}
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          comments={[]} // 댓글은 나중에 API에서 가져올 수 있음
          onLike={handleLike}
          onCommentClick={onCommentClick}
          onDelete={handleDelete}
        />
      ))}

      {/* 로딩 스켈레톤 */}
      {isLoading && <PostFeedSkeleton count={3} />}

      {/* Intersection Observer 타겟 */}
      {hasMore && !isLoading && (
        <div ref={observerTarget} className="h-20" aria-hidden="true" />
      )}

      {/* 더 이상 게시물이 없을 때 */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8">
          <p className="text-[var(--instagram-text-secondary)] text-[var(--font-size-sm)]">
            모든 게시물을 불러왔습니다
          </p>
        </div>
      )}
    </div>
  );
}

