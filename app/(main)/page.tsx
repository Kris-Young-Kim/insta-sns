/**
 * @file app/(main)/page.tsx
 * @description 메인 그룹 루트 페이지
 * 
 * 홈으로 리다이렉트합니다.
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MainPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace("/home");
  }, [router]);

  return null;
}


