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

  // 좋아요 처리 함수 (나중에 API로 교체)
  const handleLike = async (postId: string): Promise<void> => {
    // TODO: 실제 API 호출로 교체
    console.log("좋아요:", postId);
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
