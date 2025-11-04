/**
 * @file components/post/create-post-modal.tsx
 * @description 포스트 작성 모달 컴포넌트
 * 
 * Instagram 스타일의 포스트 작성 모달입니다.
 * 
 * 주요 기능:
 * - 이미지 업로드 (1개, 파일 선택 및 미리보기)
 * - 캡션 입력 (텍스트 에리어)
 * - 업로드 버튼 (유효성 검사: 이미지 필수)
 * - Supabase Storage에 이미지 업로드
 * - posts 테이블에 데이터 저장
 */

"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { X, Upload, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreatePostModal({
  open,
  onOpenChange,
  onSuccess,
}: CreatePostModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = useClerkSupabaseClient();
  const { user } = useUser();

  // 파일 선택
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 이미지 파일 검증
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    // 파일 크기 검증 (6MB 제한)
    if (file.size > 6 * 1024 * 1024) {
      setError("파일 크기는 6MB 이하여야 합니다.");
      return;
    }

    setError(null);
    setSelectedFile(file);

    // 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 파일 선택 버튼 클릭
  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  // 파일 제거
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 포스트 업로드
  const handleUpload = async () => {
    if (!selectedFile) {
      setError("이미지를 선택해주세요.");
      return;
    }

    if (!user) {
      setError("로그인이 필요합니다.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // 1. Supabase users 테이블에서 사용자 ID 조회
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", user.id)
        .single();

      if (userError || !userData) {
        throw new Error("사용자 정보를 찾을 수 없습니다. 먼저 로그인해주세요.");
      }

      // 2. Supabase Storage에 이미지 업로드
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`이미지 업로드 실패: ${uploadError.message}`);
      }

      // 3. 업로드된 이미지 URL 가져오기
      const {
        data: { publicUrl },
      } = supabase.storage.from("uploads").getPublicUrl(filePath);

      // 4. posts 테이블에 데이터 저장
      const { error: insertError } = await supabase
        .from("posts")
        .insert({
          user_id: userData.id,
          image_url: publicUrl,
          caption: caption.trim() || null,
        });

      if (insertError) {
        throw new Error(`포스트 저장 실패: ${insertError.message}`);
      }

      // 성공
      console.log("포스트 업로드 성공");
      onSuccess?.();
      handleClose();
    } catch (err) {
      console.error("포스트 업로드 에러:", err);
      setError(err instanceof Error ? err.message : "포스트 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  };

  // 모달 닫기
  const handleClose = () => {
    if (!isUploading) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setCaption("");
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="!max-w-[700px] !w-[90vw] sm:!w-[600px] lg:!w-[700px] sm:!max-w-[600px] lg:!max-w-[700px] max-h-[90vh] min-h-[400px] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-center text-[var(--font-size-lg)] font-semibold text-[var(--instagram-text)]">
            새 게시물 만들기
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          {/* 이미지 선택 영역 */}
          {!previewUrl ? (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-[var(--instagram-border)] rounded-lg p-8 sm:p-12 min-h-[200px]">
              <Upload size={48} className="text-[var(--instagram-text-secondary)] mb-4" />
              <Button
                onClick={handleSelectFile}
                variant="outline"
                className="text-[var(--font-size-sm)] min-w-[120px]"
              >
                사진 선택
              </Button>
              <input
                id="create-post-file-input"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <p className="text-[var(--font-size-xs)] text-[var(--instagram-text-secondary)] mt-2 text-center">
                JPG, PNG, GIF 파일 (최대 6MB)
              </p>
            </div>
          ) : (
            <div className="relative w-full aspect-square max-h-[400px] bg-[var(--instagram-bg-secondary)] rounded-lg overflow-hidden">
              <Image
                src={previewUrl}
                alt="미리보기"
                fill
                className="object-contain"
              />
              <button
                onClick={handleRemoveFile}
                className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors z-10"
                aria-label="이미지 제거"
              >
                <X size={20} className="text-white" />
              </button>
            </div>
          )}

          {/* 캡션 입력 */}
          <div className="space-y-2 flex-1">
            <label 
              htmlFor="create-post-caption"
              className="text-[var(--font-size-sm)] font-medium text-[var(--instagram-text)] block"
            >
              캡션
            </label>
            <Textarea
              id="create-post-caption"
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
              disabled={isUploading}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="flex-1 bg-[var(--instagram-link)] hover:bg-[var(--instagram-link)]/90"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  업로드 중...
                </>
              ) : (
                "공유하기"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

