/**
 * @file components/layout/main-layout.tsx
 * @description 메인 레이아웃 컴포넌트
 * 
 * Instagram 스타일의 반응형 레이아웃을 구현합니다.
 * - Desktop: Sidebar 244px (텍스트+아이콘) + 메인피드 630px + 여분 공간
 * - Tablet: Sidebar 72px (아이콘 전용) + 메인 100%
 * - Mobile: 상단 헤더(로고+아이콘) + 메인 콘텐츠 + 하단 네비게이션(5개 아이콘)
 */

"use client";

import { Sidebar } from "./sidebar";
import { MobileHeader } from "./mobile-header";
import { BottomNav } from "./bottom-nav";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--instagram-bg)]">
      {/* Desktop & Tablet: Sidebar */}
      <aside className="hidden md:block fixed left-0 top-0 h-screen border-r border-[var(--instagram-border)] bg-[var(--instagram-bg)]">
        <Sidebar />
      </aside>

      {/* Mobile: 상단 헤더 */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[var(--instagram-bg)] border-b border-[var(--instagram-border)]">
        <MobileHeader />
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="pt-14 md:pt-0 pb-16 md:pb-0">
        {/* Desktop: Sidebar 너비만큼 왼쪽 여백, 중앙 정렬 */}
        <div className="mx-auto max-w-[935px] px-0">
          {/* Tablet: Sidebar 너비만큼 왼쪽 여백 */}
          <div className="md:pl-[72px] lg:pl-[244px]">
            {/* 메인 콘텐츠 */}
            <div className="flex justify-center">
              <div className="w-full max-w-[630px]">
                {children}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile: 하단 네비게이션 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--instagram-bg)] border-t border-[var(--instagram-border)]">
        <BottomNav />
      </nav>
    </div>
  );
}

