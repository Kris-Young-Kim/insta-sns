/**
 * @file app/(main)/settings/page.tsx
 * @description 설정 페이지
 * 
 * 사용자 설정을 관리하는 페이지입니다.
 */

"use client";

import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { User, Bell, Shield, LogOut } from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";

export default function SettingsPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[var(--instagram-text-secondary)]">로딩 중...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-[var(--instagram-text-secondary)] mb-4">
            로그인이 필요합니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 max-w-4xl mx-auto page-transition">
      <div className="mb-8">
        <h1 className="text-[var(--font-size-2xl)] font-bold text-[var(--instagram-text)] mb-2">
          설정
        </h1>
        <p className="text-[var(--font-size-sm)] text-[var(--instagram-text-secondary)]">
          계정 설정 및 환경설정을 관리하세요.
        </p>
      </div>

      <div className="space-y-6">
        {/* 계정 정보 */}
        <div className="border border-[var(--instagram-border)] rounded-lg bg-[var(--instagram-bg)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-[var(--instagram-text)]" />
            <h2 className="text-[var(--font-size-lg)] font-semibold text-[var(--instagram-text)]">
              계정 정보
            </h2>
          </div>
          <p className="text-[var(--font-size-sm)] text-[var(--instagram-text-secondary)] mb-4">
            사용자 계정 정보를 확인합니다.
          </p>
          <div className="space-y-4">
            <div>
              <label className="text-[var(--font-size-sm)] font-medium text-[var(--instagram-text-secondary)] block mb-1">
                이름
              </label>
              <p className="text-[var(--font-size-base)] text-[var(--instagram-text)]">
                {user.fullName || user.firstName || user.lastName || "이름 없음"}
              </p>
            </div>
            <div>
              <label className="text-[var(--font-size-sm)] font-medium text-[var(--instagram-text-secondary)] block mb-1">
                이메일
              </label>
              <p className="text-[var(--font-size-base)] text-[var(--instagram-text)]">
                {user.emailAddresses[0]?.emailAddress || "이메일 없음"}
              </p>
            </div>
            <div>
              <label className="text-[var(--font-size-sm)] font-medium text-[var(--instagram-text-secondary)] block mb-1">
                사용자 ID
              </label>
              <p className="text-[var(--font-size-xs)] text-[var(--instagram-text-secondary)] font-mono break-all">
                {user.id}
              </p>
            </div>
          </div>
        </div>

        {/* 알림 설정 */}
        <div className="border border-[var(--instagram-border)] rounded-lg bg-[var(--instagram-bg)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-[var(--instagram-text)]" />
            <h2 className="text-[var(--font-size-lg)] font-semibold text-[var(--instagram-text)]">
              알림 설정
            </h2>
          </div>
          <p className="text-[var(--font-size-sm)] text-[var(--instagram-text-secondary)] mb-4">
            알림 설정을 관리합니다.
          </p>
          <p className="text-[var(--font-size-sm)] text-[var(--instagram-text-secondary)]">
            알림 기능은 곧 제공될 예정입니다.
          </p>
        </div>

        {/* 개인정보 보호 */}
        <div className="border border-[var(--instagram-border)] rounded-lg bg-[var(--instagram-bg)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-[var(--instagram-text)]" />
            <h2 className="text-[var(--font-size-lg)] font-semibold text-[var(--instagram-text)]">
              개인정보 보호
            </h2>
          </div>
          <p className="text-[var(--font-size-sm)] text-[var(--instagram-text-secondary)] mb-4">
            개인정보 보호 설정을 관리합니다.
          </p>
          <p className="text-[var(--font-size-sm)] text-[var(--instagram-text-secondary)]">
            개인정보 보호 기능은 곧 제공될 예정입니다.
          </p>
        </div>

        {/* 로그아웃 */}
        <div className="border border-[var(--instagram-border)] rounded-lg bg-[var(--instagram-bg)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <LogOut className="w-5 h-5 text-[var(--instagram-text)]" />
            <h2 className="text-[var(--font-size-lg)] font-semibold text-[var(--instagram-text)]">
              로그아웃
            </h2>
          </div>
          <p className="text-[var(--font-size-sm)] text-[var(--instagram-text-secondary)] mb-4">
            계정에서 로그아웃합니다.
          </p>
          <SignOutButton>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
            >
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </Button>
          </SignOutButton>
        </div>
      </div>
    </div>
  );
}

