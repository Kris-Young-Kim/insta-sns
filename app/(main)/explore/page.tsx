/**
 * @file app/(main)/explore/page.tsx
 * @description 탐색 페이지
 * 
 * 모든 게시물을 탐색할 수 있는 페이지입니다.
 * 홈 페이지와 달리 팔로우 여부와 관계없이 모든 게시물을 표시합니다.
 */

"use client";

import { PostFeed, PostModal } from "@/components/post";
import { Post } from "@/types/post";
import { useState, useEffect } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { EmptyState } from "@/components/empty-state";
import { ImageOff } from "lucide-react";
import { apiGet, apiPost, apiDelete } from "@/lib/utils/api-client";

export default function ExplorePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 게시물 로드 (모든 게시물)
  useEffect(() => {
    loadInitialPosts();
  }, []);

  const loadInitialPosts = async () => {
    setIsLoading(true);
    setError(null);

    // 탐색 페이지에서는 모든 게시물을 조회 (팔로우 필터 없음)
    // 이를 위해 별도 API 엔드포인트를 사용하거나, 쿼리 파라미터로 제어
    // 현재는 같은 API를 사용하되, 로그인하지 않은 사용자처럼 모든 게시물 조회
    const result = await apiGet<Post[]>("/api/posts?page=1&limit=10&all=true");

    if (!result.success) {
      console.error("게시물 로드 에러:", result.error);
      setError(result.error);
      setIsLoading(false);
      return;
    }

    const postsData = Array.isArray(result.data) ? result.data : [];
    setPosts(postsData);
    setIsLoading(false);
  };

  // 게시물 로드 함수
  const loadPosts = async (page: number): Promise<Post[]> => {
    const result = await apiGet<Post[]>(`/api/posts?page=${page}&limit=10&all=true`);

    if (!result.success) {
      console.error("게시물 로드 에러:", result.error);
      throw new Error(result.error);
    }

    return Array.isArray(result.data) ? result.data : [];
  };

  // 좋아요 처리 함수
  const handleLike = async (postId: string): Promise<void> => {
    const currentPost = posts.find((p) => p.id === postId);
    const isCurrentlyLiked = currentPost?.is_liked || false;

    if (isCurrentlyLiked) {
      // 좋아요 취소
      const result = await apiDelete(`/api/likes?post_id=${postId}`);

      if (!result.success) {
        console.error("좋아요 취소 에러:", result.error);
        throw new Error(result.error);
      }

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                is_liked: false,
                likes_count: Math.max(0, (post.likes_count || 0) - 1),
              }
            : post
        )
      );
    } else {
      // 좋아요 추가
      const result = await apiPost("/api/likes", { post_id: postId });

      if (!result.success) {
        console.error("좋아요 추가 에러:", result.error);
        throw new Error(result.error);
      }

      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
                ...post,
                is_liked: true,
                likes_count: (post.likes_count || 0) + 1,
              }
            : post
        )
      );
    }
  };

  // 댓글 클릭 처리
  const handleCommentClick = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (post) {
      setSelectedPost(post);
      setIsModalOpen(true);
    }
  };

  // 댓글 작성 처리
  const handleCommentSubmit = async (postId: string, content: string): Promise<void> => {
    const result = await apiPost("/api/comments", {
      post_id: postId,
      content,
    });

    if (!result.success) {
      console.error("댓글 작성 에러:", result.error);
      throw new Error(result.error);
    }

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments_count: (post.comments_count || 0) + 1,
            }
          : post
      )
    );
  };

  // 댓글 삭제 처리
  const handleCommentDelete = async (commentId: string): Promise<void> => {
    const result = await apiDelete(`/api/comments?comment_id=${commentId}`);

    if (!result.success) {
      console.error("댓글 삭제 에러:", result.error);
      throw new Error(result.error);
    }

    if (selectedPost) {
      setSelectedPost((prev) =>
        prev
          ? {
              ...prev,
              comments_count: Math.max(0, (prev.comments_count || 0) - 1),
            }
          : null
      );
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <p className="text-[var(--instagram-error)] mb-4">{error}</p>
          <button
            onClick={loadInitialPosts}
            className="text-[var(--instagram-link)] hover:underline"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="py-4 page-transition">
        {isLoading ? (
          <PostFeed
            initialPosts={[]}
            onLoadMore={loadPosts}
            onLike={handleLike}
            onCommentClick={handleCommentClick}
          />
        ) : posts.length === 0 ? (
          <EmptyState
            icon={ImageOff}
            title="게시물이 없습니다"
            description="아직 게시물이 없습니다. 첫 게시물을 작성해보세요!"
          />
        ) : (
          <PostFeed
            initialPosts={posts}
            onLoadMore={loadPosts}
            onLike={handleLike}
            onCommentClick={handleCommentClick}
          />
        )}

        {/* 포스트 상세보기 모달 */}
        <PostModal
          post={selectedPost}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onCommentSubmit={handleCommentSubmit}
          onCommentDelete={handleCommentDelete}
        />
      </div>
    </ErrorBoundary>
  );
}

