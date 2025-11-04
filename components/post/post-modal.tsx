/**
 * @file components/post/post-modal.tsx
 * @description 포스트 상세보기 모달 컴포넌트
 * 
 * Instagram 스타일의 포스트 상세보기 모달입니다.
 * 
 * 레이아웃:
 * - 이미지 영역 (50% 너비, 왼쪽)
 * - 댓글 영역 (50% 너비, 오른쪽, 스크롤 가능)
 */

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Post, Comment } from "@/types/post";
import { CommentForm, CommentList } from "@/components/comment";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { useUser } from "@clerk/nextjs";

interface PostModalProps {
  post: Post | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCommentSubmit?: (postId: string, content: string) => Promise<void>;
  onCommentDelete?: (commentId: string) => Promise<void>;
}

export function PostModal({
  post,
  open,
  onOpenChange,
  onCommentSubmit,
  onCommentDelete,
}: PostModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const supabase = useClerkSupabaseClient();
  const { user } = useUser();

  // 댓글 목록 로드
  useEffect(() => {
    if (open && post) {
      loadComments();
    } else {
      setComments([]);
    }
  }, [open, post]);

  const loadComments = async () => {
    if (!post) return;

    setIsLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from("comments")
        .select(`
          *,
          user:users(id, name, clerk_id)
        `)
        .eq("post_id", post.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("댓글 로드 실패:", error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleCommentSubmit = async (content: string) => {
    if (!post || !onCommentSubmit) return;

    try {
      await onCommentSubmit(post.id, content);
      await loadComments(); // 댓글 목록 새로고침
    } catch (error) {
      throw error;
    }
  };

  const handleCommentDelete = async (commentId: string) => {
    if (!onCommentDelete) return;

    try {
      await onCommentDelete(commentId);
      await loadComments(); // 댓글 목록 새로고침
    } catch (error) {
      throw error;
    }
  };

  if (!post) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden sm:max-w-4xl">
        {/* 접근성을 위한 숨겨진 제목 */}
        <DialogTitle className="sr-only">
          {post.user?.name || "사용자"}님의 게시물
        </DialogTitle>
        <div className="flex flex-col sm:flex-row h-[90vh] max-h-[90vh]">
          {/* 이미지 영역 (50% 너비, 왼쪽) */}
          <div className="w-full sm:w-1/2 h-1/2 sm:h-full relative bg-[var(--instagram-bg-secondary)]">
            <Image
              src={post.image_url}
              alt={post.caption || "게시물 이미지"}
              fill
              className="object-contain"
              sizes="50vw"
            />
          </div>

          {/* 댓글 영역 (50% 너비, 오른쪽, 스크롤 가능) */}
          <div className="w-full sm:w-1/2 h-1/2 sm:h-full flex flex-col bg-[var(--instagram-bg)]">
            {/* 헤더: 사용자 정보 */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--instagram-border)]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-[2px]">
                <div className="w-full h-full rounded-full bg-[var(--instagram-bg)] flex items-center justify-center">
                  <span className="text-[var(--font-size-sm)] font-semibold text-[var(--instagram-text)]">
                    {post.user?.name?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
              </div>
              <span className="text-[var(--font-size-sm)] font-semibold text-[var(--instagram-text)]">
                {post.user?.name || "사용자"}
              </span>
            </div>

            {/* 댓글 목록 (스크롤 가능) */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {isLoadingComments ? (
                <div className="text-center py-8 text-[var(--instagram-text-secondary)]">
                  댓글을 불러오는 중...
                </div>
              ) : (
                <CommentList
                  comments={comments}
                  postId={post.id}
                  preview={false}
                  onDelete={handleCommentDelete}
                />
              )}
            </div>

            {/* 댓글 작성 폼 */}
            <CommentForm
              postId={post.id}
              onSubmit={handleCommentSubmit}
              placeholder="댓글 달기..."
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

