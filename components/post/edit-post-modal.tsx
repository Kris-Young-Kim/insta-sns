/**
 * @file components/post/edit-post-modal.tsx
 * @description 포스트 수정 모달 컴포넌트
 * 
 * Instagram 스타일의 포스트 수정 모달입니다.
 * 
 * 주요 기능:
 * - 기존 캡션 표시 및 수정
 * - 이미지 미리보기 (수정 불가)
 * - 수정 버튼 (유효성 검사: 캡션 최대 2,200자)
 * - 게시물 수정 API 호출
 */

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Post } from "@/types/post";
import { apiPut } from "@/lib/utils/api-client";

interface EditPostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post | null;
  onSuccess?: (updatedPost: Post) => void;
}

export function EditPostModal({
  open,
  onOpenChange,
  post,
  onSuccess,
}: EditPostModalProps) {
  const [caption, setCaption] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 게시물이 변경되면 캡션 초기화
  useEffect(() => {
    if (post) {
      setCaption(post.caption || "");
      setError(null);
    }
  }, [post]);

  // 게시물 수정
  const handleUpdate = async () => {
    if (!post) {
      setError("게시물 정보가 없습니다.");
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      console.log("EditPostModal: 게시물 수정 시작", { postId: post.id, caption });

      const result = await apiPut<Post>(`/api/posts/${post.id}`, {
        caption,
      });

      if (result.success === false) {
        throw new Error(result.error || "게시물 수정에 실패했습니다.");
      }

      console.log("EditPostModal: 게시물 수정 성공", { postId: post.id });

      // 성공 콜백 호출
      if (onSuccess && result.data) {
        onSuccess(result.data);
      }

      handleClose();
    } catch (err) {
      console.error("EditPostModal: 게시물 수정 실패:", err);
      setError(err instanceof Error ? err.message : "게시물 수정에 실패했습니다.");
    } finally {
      setIsUpdating(false);
    }
  };

  // 모달 닫기
  const handleClose = () => {
    if (!isUpdating) {
      setCaption("");
      setError(null);
      onOpenChange(false);
    }
  };

  if (!post) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="!max-w-[700px] !w-[90vw] sm:!w-[600px] lg:!w-[700px] sm:!max-w-[600px] lg:!max-w-[700px] max-h-[90vh] min-h-[400px] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-center text-[var(--font-size-lg)] font-semibold text-[var(--instagram-text)]">
            게시물 수정
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          {/* 이미지 미리보기 */}
          <div className="relative w-full aspect-square max-h-[400px] bg-[var(--instagram-bg-secondary)] rounded-lg overflow-hidden">
            <Image
              src={post.image_url}
              alt={post.caption || "게시물 이미지"}
              fill
              className="object-contain"
            />
          </div>

          {/* 캡션 입력 */}
          <div className="space-y-2 flex-1">
            <label 
              htmlFor="edit-post-caption"
              className="text-[var(--font-size-sm)] font-medium text-[var(--instagram-text)] block"
            >
              캡션
            </label>
            <Textarea
              id="edit-post-caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="캡션을 입력하세요..."
              className="min-h-[120px] resize-none w-full"
              maxLength={2200}
            />
            <div className="flex justify-between items-center">
              <span className="text-[var(--font-size-xs)] text-[var(--instagram-text-secondary)]">
                {caption.length}/2,200자
              </span>
            </div>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-[var(--font-size-sm)] text-red-600">{error}</p>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-2">
            <Button
              onClick={handleClose}
              variant="outline"
              disabled={isUpdating}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="flex-1 bg-[var(--instagram-link)] hover:bg-[var(--instagram-link)]/90"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  수정 중...
                </>
              ) : (
                "수정하기"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

