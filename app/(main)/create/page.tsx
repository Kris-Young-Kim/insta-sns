/**
 * @file app/(main)/create/page.tsx
 * @description 게시물 생성 페이지
 * 
 * 이 페이지는 게시물 작성 모달을 자동으로 엽니다.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CreatePostModal } from "@/components/post/create-post-modal";

export default function CreatePage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleClose = () => {
    setIsModalOpen(false);
    // 모달이 닫히면 홈으로 리다이렉트
    router.push("/home");
  };

  const handleSuccess = () => {
    // 게시물 생성 성공 시 홈으로 리다이렉트
    router.push("/home");
  };

  return (
    <CreatePostModal
      open={isModalOpen}
      onOpenChange={setIsModalOpen}
      onSuccess={handleSuccess}
    />
  );
}

