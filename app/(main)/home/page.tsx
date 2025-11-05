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
import { useState, useEffect, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ErrorBoundary } from "@/components/error-boundary";
import { EmptyState } from "@/components/empty-state";
import { ImageOff } from "lucide-react";
import { apiGet, apiPost, apiDelete } from "@/lib/utils/api-client";

function HomePageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 게시물 로드 및 pathname/searchParams 변경 시 강력 새로고침 (캐시 우회)
  useEffect(() => {
    console.log("홈 페이지 새로고침 시작:", { pathname, refresh: searchParams.get("refresh") });
    loadInitialPosts();
  }, [pathname, searchParams]);

  const loadInitialPosts = async () => {
    console.log("=== 홈 페이지 게시물 로드 시작 ===");
    setIsLoading(true);
    setError(null);

    // 캐시 우회를 위한 timestamp 추가
    const timestamp = Date.now();
    const url = `/api/posts?page=1&limit=10&_t=${timestamp}`;
    console.log("API 호출 URL:", url);
    
    const result = await apiGet<Post[]>(url);
    console.log("API 응답 결과:", {
      success: result.success,
      dataLength: result.success ? result.data?.length ?? "undefined" : undefined,
      dataType: result.success ? (Array.isArray(result.data) ? "array" : typeof result.data) : undefined,
      error: result.success === false ? result.error : undefined,
      fullResult: result,
    });

    if (result.success === false) {
      console.error("게시물 로드 에러:", result.error);
      setError(result.error);
      setIsLoading(false);
      return;
    }

    // API 응답 구조 확인: api-client가 이미 { success: true, data: Post[] } 형식을 파싱했으므로
    // result.data는 Post[] 타입이어야 함
    const postsData = Array.isArray(result.data) ? result.data : [];
    console.log("최종 게시물 데이터:", {
      count: postsData.length,
      isEmpty: postsData.length === 0,
      posts: postsData,
      firstPost: postsData[0] || null,
    });
    setPosts(postsData);
    setIsLoading(false);
  };

  // 게시물 로드 함수
  const loadPosts = async (page: number): Promise<Post[]> => {
    const result = await apiGet<Post[]>(`/api/posts?page=${page}&limit=10`);

    if (result.success === false) {
      console.error("게시물 로드 에러:", result.error);
      throw new Error(result.error);
    }

    // API 응답 구조 확인: api-client가 이미 { success: true, data: Post[] } 형식을 파싱했으므로
    // result.data는 Post[] 타입이어야 함
    return Array.isArray(result.data) ? result.data : [];
  };

  // 좋아요 처리 함수
  const handleLike = async (postId: string): Promise<void> => {
    // 현재 게시물의 좋아요 상태 확인 (임시로 posts 상태에서 찾기)
    const currentPost = posts.find((p) => p.id === postId);
    const isCurrentlyLiked = currentPost?.is_liked || false;

    if (isCurrentlyLiked) {
      // 좋아요 취소
      const result = await apiDelete(`/api/likes?post_id=${postId}`);

      if (result.success === false) {
        console.error("좋아요 취소 에러:", result.error);
        throw new Error(result.error);
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
      const result = await apiPost("/api/likes", { post_id: postId });

      if (result.success === false) {
        console.error("좋아요 추가 에러:", result.error);
        throw new Error(result.error);
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

    if (result.success === false) {
      console.error("댓글 작성 에러:", result.error);
      throw new Error(result.error);
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
  };

  // 댓글 삭제 처리
  const handleCommentDelete = async (commentId: string): Promise<void> => {
    const result = await apiDelete(`/api/comments?comment_id=${commentId}`);

    if (result.success === false) {
      console.error("댓글 삭제 에러:", result.error);
      throw new Error(result.error);
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
  };

  // 게시물 삭제 처리
  const handlePostDelete = (postId: string) => {
    console.log("홈 페이지: 게시물 삭제", { postId });
    // 목록에서 삭제된 게시물 제거
    setPosts((prev) => prev.filter((post) => post.id !== postId));
    
    // 선택된 게시물이 삭제된 경우 모달 닫기
    if (selectedPost?.id === postId) {
      setSelectedPost(null);
      setIsModalOpen(false);
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
            onDelete={handlePostDelete}
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
            onDelete={handlePostDelete}
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

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-[var(--instagram-text-secondary)]">로딩 중...</div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}
