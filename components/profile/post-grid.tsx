/**
 * @file components/profile/post-grid.tsx
 * @description 프로필 게시물 그리드 컴포넌트
 * 
 * 3열 그리드 레이아웃으로 게시물을 표시합니다.
 * 호버 시 좋아요/댓글 수를 표시합니다.
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle } from "lucide-react";
import { Post } from "@/types/post";

interface PostGridProps {
  posts: Post[];
  onPostClick?: (post: Post) => void;
}

export function PostGrid({ posts, onPostClick }: PostGridProps) {
  const [hoveredPostId, setHoveredPostId] = useState<string | null>(null);

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 rounded-full border-2 border-[var(--instagram-border)] flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-[var(--instagram-text-secondary)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p className="text-[var(--font-size-xl)] font-light text-[var(--instagram-text)]">
          게시물 없음
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-4">
      {posts.map((post) => {
        const isHovered = hoveredPostId === post.id;
        const likesCount = post.likes_count || 0;
        const commentsCount = post.comments_count || 0;

        return (
          <div
            key={post.id}
            className="relative aspect-square bg-[var(--instagram-bg-secondary)] cursor-pointer group"
            onMouseEnter={() => setHoveredPostId(post.id)}
            onMouseLeave={() => setHoveredPostId(null)}
            onClick={() => onPostClick?.(post)}
          >
            <Image
              src={post.image_url}
              alt={post.caption || "게시물"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 33vw, 210px"
            />

            {/* 호버 오버레이: 좋아요/댓글 수 */}
            {isHovered && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-6">
                <div className="flex items-center gap-2 text-white">
                  <Heart size={20} className="fill-white" />
                  <span className="text-[var(--font-size-sm)] font-semibold">
                    {likesCount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-white">
                  <MessageCircle size={20} className="fill-white" />
                  <span className="text-[var(--font-size-sm)] font-semibold">
                    {commentsCount.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

