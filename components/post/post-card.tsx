/**
 * @file components/post/post-card.tsx
 * @description PostCard 컴포넌트
 * 
 * Instagram 스타일의 게시물 카드 컴포넌트입니다.
 * 
 * 주요 기능:
 * - Header: 아바타, 닉네임, 시간, 메뉴(3점) 버튼
 * - 이미지: 정사각형 비율, 반응형 처리
 * - 액션 바: 하트, 댓글, 공유 아이콘
 * - 좋아요 카운트 표시
 * - 캡션: 2줄 초과 시 "더보기" 버튼
 * - 댓글 미리보기: 최근 2개 댓글 표시
 */

"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";
import { Post, Comment } from "@/types/post";

interface PostCardProps {
  post: Post;
  comments?: Comment[];
  onLike?: (postId: string) => Promise<void>;
  onCommentClick?: (postId: string) => void;
}

export function PostCard({ post, comments = [], onLike, onCommentClick }: PostCardProps) {
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const lastTapRef = useRef(0);
  const imageRef = useRef<HTMLDivElement>(null);

  // 캡션이 2줄을 초과하는지 확인 (대략 100자 기준)
  const shouldTruncateCaption = post.caption && post.caption.length > 100;
  const displayCaption = shouldTruncateCaption && !isCaptionExpanded
    ? post.caption.substring(0, 100) + "..."
    : post.caption;

  // 최근 2개 댓글만 표시
  const previewComments = comments.slice(0, 2);

  // 시간 포맷팅
  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "방금 전";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`;
    
    const months = date.getMonth() + 1;
    const days = date.getDate();
    return `${months}월 ${days}일`;
  };

  const timeAgo = formatTimeAgo(post.created_at);

  // 좋아요 토글
  const handleLike = async () => {
    const newLikedState = !isLiked;
    
    // 낙관적 업데이트
    setIsLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);

    // 애니메이션 표시
    if (newLikedState) {
      setShowHeartAnimation(true);
      setTimeout(() => setShowHeartAnimation(false), 600);
    }

    // API 호출
    if (onLike) {
      try {
        await onLike(post.id);
      } catch (error) {
        // 실패 시 롤백
        setIsLiked(!newLikedState);
        setLikesCount(prev => newLikedState ? prev - 1 : prev + 1);
        console.error("좋아요 처리 실패:", error);
      }
    }
  };

  // 더블탭 제스처 처리
  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (lastTapRef.current && now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      // 더블탭 감지
      if (!isLiked) {
        handleLike();
      }
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  };

  return (
    <article className="bg-[var(--instagram-bg)] border border-[var(--instagram-border)] rounded-lg mb-4">
      {/* Header: 아바타, 닉네임, 시간, 메뉴 */}
      <header className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {/* 아바타 */}
          <Link href={`/profile/${post.user_id}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-[2px]">
              <div className="w-full h-full rounded-full bg-[var(--instagram-bg)] flex items-center justify-center">
                <span className="text-[var(--font-size-sm)] font-semibold text-[var(--instagram-text)]">
                  {post.user?.name?.[0]?.toUpperCase() || "U"}
                </span>
              </div>
            </div>
          </Link>
          
          {/* 닉네임 & 시간 */}
          <div className="flex flex-col">
            <Link 
              href={`/profile/${post.user_id}`}
              className="text-[var(--font-size-sm)] font-semibold text-[var(--instagram-text)] hover:opacity-50"
            >
              {post.user?.name || "사용자"}
            </Link>
            <span className="text-[var(--font-size-xs)] text-[var(--instagram-text-secondary)]">
              {timeAgo}
            </span>
          </div>
        </div>

        {/* 메뉴 버튼 (3점) */}
        <button className="p-1 hover:opacity-50">
          <MoreHorizontal size={20} className="text-[var(--instagram-text)]" />
        </button>
      </header>

      {/* 이미지: 정사각형 비율 */}
      <div
        ref={imageRef}
        className="relative w-full aspect-square bg-[var(--instagram-bg-secondary)] cursor-pointer select-none"
        onDoubleClick={handleDoubleTap}
      >
        <Image
          src={post.image_url}
          alt={post.caption || "게시물 이미지"}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 630px"
          priority={false}
          draggable={false}
        />
        
        {/* 더블탭 하트 애니메이션 */}
        {showHeartAnimation && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Heart
              size={80}
              className="text-[var(--instagram-heart)] fill-[var(--instagram-heart)] animate-ping"
              style={{
                animation: "heartPulse 0.6s ease-out",
              }}
            />
          </div>
        )}
      </div>

      {/* 액션 바: 하트, 댓글, 공유 */}
      <div className="px-4 py-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            {/* 하트 아이콘 */}
            <button
              onClick={handleLike}
              className="hover:opacity-50 transition-all active:scale-110"
              aria-label={isLiked ? "좋아요 취소" : "좋아요"}
            >
              {isLiked ? (
                <Heart
                  size={24}
                  className="text-[var(--instagram-heart)] fill-[var(--instagram-heart)] transition-all"
                />
              ) : (
                <Heart
                  size={24}
                  className="text-[var(--instagram-text)] transition-all"
                />
              )}
            </button>

            {/* 댓글 아이콘 */}
            <button
              onClick={() => onCommentClick?.(post.id)}
              className="hover:opacity-50 transition-opacity"
              aria-label="댓글"
            >
              <MessageCircle size={24} className="text-[var(--instagram-text)]" />
            </button>

            {/* 공유 아이콘 */}
            <button className="hover:opacity-50 transition-opacity" aria-label="공유">
              <Send size={24} className="text-[var(--instagram-text)]" />
            </button>
          </div>

          {/* 북마크 아이콘 */}
          <button className="hover:opacity-50 transition-opacity" aria-label="저장">
            <Bookmark size={24} className="text-[var(--instagram-text)]" />
          </button>
        </div>

        {/* 좋아요 카운트 */}
        {likesCount > 0 && (
          <div className="mb-2">
            <span className="text-[var(--font-size-sm)] font-semibold text-[var(--instagram-text)]">
              좋아요 {likesCount.toLocaleString()}개
            </span>
          </div>
        )}

        {/* 캡션 */}
        {post.caption && (
          <div className="mb-2">
            <span className="text-[var(--font-size-sm)] text-[var(--instagram-text)]">
              <Link 
                href={`/profile/${post.user_id}`}
                className="font-semibold hover:opacity-50 mr-2"
              >
                {post.user?.name || "사용자"}
              </Link>
              <span className="whitespace-pre-line">{displayCaption}</span>
            </span>
            {shouldTruncateCaption && (
              <button
                onClick={() => setIsCaptionExpanded(!isCaptionExpanded)}
                className="text-[var(--font-size-sm)] text-[var(--instagram-text-secondary)] ml-2 hover:opacity-50"
              >
                {isCaptionExpanded ? "간략히" : "더보기"}
              </button>
            )}
          </div>
        )}

        {/* 댓글 미리보기: 최근 2개 */}
        {previewComments.length > 0 && (
          <div className="mb-2">
            {previewComments.length < (comments.length || 0) && (
              <button
                onClick={() => onCommentClick?.(post.id)}
                className="text-[var(--font-size-sm)] text-[var(--instagram-text-secondary)] mb-2 hover:opacity-50"
              >
                댓글 {comments.length}개 모두 보기
              </button>
            )}
            {previewComments.map((comment) => (
              <div key={comment.id} className="mb-1">
                <span className="text-[var(--font-size-sm)] text-[var(--instagram-text)]">
                  <Link
                    href={`/profile/${comment.user_id}`}
                    className="font-semibold hover:opacity-50 mr-2"
                  >
                    {comment.user?.name || "사용자"}
                  </Link>
                  <span>{comment.content}</span>
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 댓글 작성 버튼 (있으면) */}
        {comments.length === 0 && (
          <button
            onClick={() => onCommentClick?.(post.id)}
            className="text-[var(--font-size-sm)] text-[var(--instagram-text-secondary)] mb-2 hover:opacity-50"
          >
            댓글 달기...
          </button>
        )}
      </div>
    </article>
  );
}

