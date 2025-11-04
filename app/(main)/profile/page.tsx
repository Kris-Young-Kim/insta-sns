/**
 * @file app/(main)/profile/page.tsx
 * @description 현재 사용자 프로필 리다이렉트 페이지
 * 
 * /profile로 접근하면 현재 로그인한 사용자의 프로필 페이지로 리다이렉트합니다.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";

export default function ProfileRedirectPage() {
  const router = useRouter();
  const { user: clerkUser, isLoaded } = useUser();
  const supabase = useClerkSupabaseClient();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    const redirectToProfile = async () => {
      if (!clerkUser) {
        // 로그인하지 않은 경우 홈으로 리다이렉트
        router.push("/home");
        return;
      }

      try {
        // Supabase users 테이블에서 현재 사용자의 ID 조회
        const { data: userData, error } = await supabase
          .from("users")
          .select("id")
          .eq("clerk_id", clerkUser.id)
          .single();

        if (error || !userData) {
          console.error("사용자 정보를 찾을 수 없습니다:", error);
          // 사용자 정보가 없으면 홈으로 리다이렉트
          router.push("/home");
          return;
        }

        // 사용자 프로필 페이지로 리다이렉트
        router.push(`/profile/${userData.id}`);
      } catch (err) {
        console.error("프로필 리다이렉트 에러:", err);
        router.push("/home");
      } finally {
        setIsLoading(false);
      }
    };

    redirectToProfile();
  }, [clerkUser, isLoaded, router, supabase]);

  // 로딩 중 표시
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-[var(--instagram-text-secondary)]">프로필 페이지로 이동 중...</p>
        </div>
      </div>
    );
  }

  return null;
}

