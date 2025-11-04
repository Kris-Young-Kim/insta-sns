/**
 * @file components/comment/comment-list.tsx
 * @description 댓글 목록 컴포넌트
 * 
 * 댓글 목록을 표시하는 컴포넌트입니다.
 * 2줄 미리보기 모드와 전체 목록 모드를 지원합니다.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Comment } from "@/types/post";
import { useUser } from "@clerk/nextjs";

interface CommentListProps {
  comments: Comment[];
  postId: string;
  preview?: boolean; // true면 최대 2개만 표시
  onDelete?: (commentId: string) => Promise<void>;
  onShowMore?: () => void; // 더보기 클릭 시 호출
}

export function CommentList({
  comments,
  postId,
  preview = false,
  onDelete,
  onShowMore,
}: CommentListProps) {
  const { user } = useUser();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 2줄 미리보기 모드
  const displayComments = preview ? comments.slice(0, 2) : comments;
  const hasMore = preview && comments.length > 2;

  const handleDelete = async (commentId: string) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;

    setDeletingId(commentId);
    try {
      await onDelete?.(commentId);
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
    } finally {
      setDeletingId(null);
    }
  };

  if (comments.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      {displayComments.map((comment) => {
        const isOwnComment = user?.id === comment.user?.clerk_id;
        const isDeleting = deletingId === comment.id;

        return (
          <div
            key={comment.id}
            className={`flex items-start gap-2 group ${isDeleting ? "opacity-50" : ""}`}
          >
            <div className="flex-1 min-w-0">
              <span className="text-[var(--font-size-sm)] text-[var(--instagram-text)]">
                <Link
                  href={`/profile/${comment.user_id}`}
                  className="font-semibold hover:opacity-50 mr-2"
                >
                  {comment.user?.name || "사용자"}
                </Link>
                <span className="break-words">{comment.content}</span>
              </span>
            </div>

            {/* 삭제 버튼 (본인 댓글만) */}
            {isOwnComment && onDelete && (
              <button
                onClick={() => handleDelete(comment.id)}
                disabled={isDeleting}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:opacity-50 disabled:opacity-50"
                aria-label="댓글 삭제"
              >
                <Trash2 size={14} className="text-[var(--instagram-text-secondary)]" />
              </button>
            )}
          </div>
        );
      })}

      {/* 더보기 버튼 */}
      {hasMore && onShowMore && (
        <button
          onClick={onShowMore}
          className="text-[var(--font-size-sm)] text-[var(--instagram-text-secondary)] hover:opacity-50"
        >
          댓글 {comments.length}개 모두 보기
        </button>
      )}
    </div>
  );
}

