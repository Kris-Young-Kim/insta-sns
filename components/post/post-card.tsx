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

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Trash2, Edit } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { Post, Comment } from "@/types/post";
import { CommentList } from "@/components/comment";

interface PostCardProps {
  post: Post;
  comments?: Comment[];
  onLike?: (postId: string) => Promise<void>;
  onCommentClick?: (postId: string) => void;
  onDelete?: (postId: string) => void;
}

export function PostCard({ post, comments = [], onLike, onCommentClick, onDelete }: PostCardProps) {
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const lastTapRef = useRef(0);
  const imageRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const supabase = useClerkSupabaseClient();

  // 캡션이 2줄을 초과하는지 확인 (대략 100자 기준)
  const shouldTruncateCaption = post.caption && post.caption.length > 100;
  const displayCaption = shouldTruncateCaption && !isCaptionExpanded
    ? post.caption.substring(0, 100) + "..."
    : post.caption;

  // 댓글 미리보기는 CommentList 컴포넌트에서 처리

  // 현재 사용자가 게시물 작성자인지 확인
  useEffect(() => {
    const checkOwnership = async () => {
      if (!user) {
        setIsOwner(false);
        return;
      }

      try {
        // Supabase users 테이블에서 현재 사용자 ID 조회
        const { data: userData } = await supabase
          .from("users")
          .select("id")
          .eq("clerk_id", user.id)
          .single();

        if (userData && userData.id === post.user_id) {
          setIsOwner(true);
          console.log("PostCard: 현재 사용자가 게시물 작성자입니다", { postId: post.id });
        } else {
          setIsOwner(false);
        }
      } catch (error) {
        console.error("PostCard: 소유자 확인 중 에러:", error);
        setIsOwner(false);
      }
    };

    checkOwnership();
  }, [user, post.user_id, post.id, supabase]);

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  // 게시물 삭제 핸들러
  const handleDelete = async () => {
    if (!isOwner) {
      console.warn("PostCard: 삭제 권한이 없습니다");
      return;
    }

    if (!confirm("정말 이 게시물을 삭제하시겠습니까?")) {
      return;
    }

    setIsDeleting(true);
    console.log("PostCard: 게시물 삭제 시작", { postId: post.id });

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "게시물 삭제에 실패했습니다.");
      }

      console.log("PostCard: 게시물 삭제 성공", { postId: post.id });
      
      // 부모 컴포넌트에 삭제 알림
      if (onDelete) {
        onDelete(post.id);
      } else {
        // onDelete 콜백이 없으면 페이지 새로고침
        window.location.reload();
      }
    } catch (error) {
      console.error("PostCard: 게시물 삭제 실패:", error);
      alert(error instanceof Error ? error.message : "게시물 삭제에 실패했습니다.");
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

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
    console.log("PostCard: 좋아요 버튼 클릭", { postId: post.id, currentLiked: isLiked });
    
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
        console.log("PostCard: 좋아요 API 호출 시작");
        await onLike(post.id);
        console.log("PostCard: 좋아요 API 호출 성공");
      } catch (error) {
        // 실패 시 롤백
        setIsLiked(!newLikedState);
        setLikesCount(prev => newLikedState ? prev - 1 : prev + 1);
        console.error("PostCard: 좋아요 처리 실패:", error);
      }
    } else {
      console.warn("PostCard: onLike 콜백이 없습니다");
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

        {/* 메뉴 버튼 (3점) - 작성자만 표시 */}
        {isOwner && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:opacity-50 transition-opacity"
              aria-label="메뉴"
            >
              <MoreHorizontal size={20} className="text-[var(--instagram-text)]" />
            </button>

            {/* 드롭다운 메뉴 */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--instagram-bg)] border border-[var(--instagram-border)] rounded-lg shadow-lg z-50">
                <div className="py-1">
                  {/* 수정 버튼 (향후 구현) */}
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      // TODO: 게시물 수정 기능 구현
                      alert("게시물 수정 기능은 곧 제공될 예정입니다.");
                    }}
                    className="w-full px-4 py-3 text-left text-[var(--font-size-sm)] text-[var(--instagram-text)] hover:bg-[var(--instagram-bg-secondary)] flex items-center gap-3 transition-colors"
                  >
                    <Edit size={16} />
                    <span>수정</span>
                  </button>

                  {/* 삭제 버튼 */}
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="w-full px-4 py-3 text-left text-[var(--font-size-sm)] text-red-500 hover:bg-[var(--instagram-bg-secondary)] flex items-center gap-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 size={16} />
                    <span>{isDeleting ? "삭제 중..." : "삭제"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
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
              className="hover:opacity-50 transition-all active:scale-110 ripple"
              aria-label={isLiked ? "좋아요 취소" : "좋아요"}
            >
              {isLiked ? (
                <Heart
                  size={24}
                  className="text-[var(--instagram-heart)] fill-[var(--instagram-heart)] transition-all"
                  style={{
                    animation: "heartClick 0.4s ease-out",
                  }}
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
              onClick={() => {
                console.log("PostCard: 댓글 버튼 클릭", { postId: post.id, hasCallback: !!onCommentClick });
                onCommentClick?.(post.id);
              }}
              className="hover:opacity-50 transition-opacity ripple"
              aria-label="댓글"
            >
              <MessageCircle size={24} className="text-[var(--instagram-text)]" />
            </button>

            {/* 공유 아이콘 */}
            <button
              onClick={() => {
                console.log("PostCard: 공유 버튼 클릭", { postId: post.id });
                // 공유 기능 구현 (Web Share API 또는 클립보드 복사)
                if (navigator.share) {
                  navigator.share({
                    title: `${post.user?.name || "사용자"}님의 게시물`,
                    text: post.caption || "",
                    url: window.location.href,
                  }).catch((err) => {
                    console.log("공유 취소됨:", err);
                  });
                } else {
                  // Web Share API를 지원하지 않는 경우 클립보드에 링크 복사
                  navigator.clipboard.writeText(window.location.href).then(() => {
                    console.log("링크가 클립보드에 복사되었습니다");
                    // TODO: 토스트 메시지 표시 (선택사항)
                  }).catch((err) => {
                    console.error("클립보드 복사 실패:", err);
                  });
                }
              }}
              className="hover:opacity-50 transition-opacity ripple"
              aria-label="공유"
            >
              <Send size={24} className="text-[var(--instagram-text)]" />
            </button>
          </div>

          {/* 북마크 아이콘 */}
          <button
            onClick={() => {
              console.log("PostCard: 북마크 버튼 클릭", { postId: post.id });
              // TODO: 북마크 기능 구현 (향후 기능)
              alert("북마크 기능은 곧 제공될 예정입니다.");
            }}
            className="hover:opacity-50 transition-opacity ripple"
            aria-label="저장"
          >
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
        <div className="mb-2">
          <CommentList
            comments={comments}
            postId={post.id}
            preview={true}
            onShowMore={() => onCommentClick?.(post.id)}
          />
          {comments.length === 0 && (
            <button
              onClick={() => onCommentClick?.(post.id)}
              className="text-[var(--font-size-sm)] text-[var(--instagram-text-secondary)] hover:opacity-50"
            >
              댓글 달기...
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

