/**
 * @file app/(main)/home/page.tsx
 * @description 메인 홈 페이지
 * 
 * 홈 피드가 표시될 페이지입니다.
 * PostFeed 컴포넌트를 사용하여 게시물 목록을 표시합니다.
 */

"use client";

import { PostFeed, PostModal } from "@/components/post";
import { Post } from "@/types/post";
import { useState, useEffect } from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import { getErrorMessage } from "@/lib/utils/error-handler";
import { EmptyState } from "@/components/empty-state";
import { ImageOff } from "lucide-react";

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 게시물 로드
  useEffect(() => {
    loadInitialPosts();
  }, []);

  const loadInitialPosts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/posts?page=1&limit=10");
      if (!response.ok) {
        throw new Error("게시물을 불러올 수 없습니다.");
      }

      const data = await response.json();
      if (data.success && data.data) {
        setPosts(data.data);
      }
    } catch (err) {
      console.error("게시물 로드 에러:", err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // 게시물 로드 함수
  const loadPosts = async (page: number): Promise<Post[]> => {
    try {
      const response = await fetch(`/api/posts?page=${page}&limit=10`);
      if (!response.ok) {
        throw new Error("게시물을 불러올 수 없습니다.");
      }

      const data = await response.json();
      if (data.success && data.data) {
        return data.data;
      }
      return [];
    } catch (err) {
      console.error("게시물 로드 에러:", err);
      throw err;
    }
  };

  // 좋아요 처리 함수
  const handleLike = async (postId: string): Promise<void> => {
    try {
      // 현재 게시물의 좋아요 상태 확인 (임시로 posts 상태에서 찾기)
      const currentPost = posts.find((p) => p.id === postId);
      const isCurrentlyLiked = currentPost?.is_liked || false;

      if (isCurrentlyLiked) {
        // 좋아요 취소
        const response = await fetch(`/api/likes?post_id=${postId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("좋아요 취소에 실패했습니다.");
        }

        // 로컬 상태 업데이트
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
        const response = await fetch("/api/likes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ post_id: postId }),
        });

        if (!response.ok) {
          throw new Error("좋아요 추가에 실패했습니다.");
        }

        // 로컬 상태 업데이트
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
    } catch (error) {
      console.error("좋아요 처리 에러:", error);
      throw error; // PostCard에서 롤백 처리
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
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ post_id: postId, content }),
      });

      if (!response.ok) {
        throw new Error("댓글 작성에 실패했습니다.");
      }

      // 댓글 수 업데이트
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
    } catch (error) {
      console.error("댓글 작성 에러:", error);
      throw error;
    }
  };

  // 댓글 삭제 처리
  const handleCommentDelete = async (commentId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/comments?comment_id=${commentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("댓글 삭제에 실패했습니다.");
      }

      // 댓글 수 업데이트 (선택된 포스트의 경우)
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
    } catch (error) {
      console.error("댓글 삭제 에러:", error);
      throw error;
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
            description="첫 게시물을 작성해보세요!"
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
