/**
 * @file app/(main)/home/page.tsx
 * @description 메인 홈 페이지
 * 
 * 홈 피드가 표시될 페이지입니다.
 * PostFeed 컴포넌트를 사용하여 게시물 목록을 표시합니다.
 */

"use client";

import { PostFeed } from "@/components/post";
import { Post } from "@/types/post";
import { useState, useEffect } from "react";

// 임시 데이터 (나중에 API로 교체)
const mockPosts: Post[] = [];

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>(mockPosts);

  // 게시물 로드 함수 (나중에 API로 교체)
  const loadPosts = async (page: number): Promise<Post[]> => {
    // TODO: 실제 API 호출로 교체
    console.log("게시물 로드:", page);
    return [];
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
    // TODO: 댓글 모달 열기
    console.log("댓글 클릭:", postId);
  };

  return (
    <div className="py-4">
      <PostFeed
        initialPosts={posts}
        onLoadMore={loadPosts}
        onLike={handleLike}
        onCommentClick={handleCommentClick}
      />
    </div>
  );
}
