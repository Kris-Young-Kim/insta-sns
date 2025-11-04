/**
 * @file app/(main)/layout.tsx
 * @description 메인 피드 페이지 레이아웃
 * 
 * Instagram 스타일의 반응형 레이아웃:
 * - Desktop: Sidebar 244px + 메인피드 630px + 여분 공간
 * - Tablet: Sidebar 72px + 메인 100%
 * - Mobile: 상단 헤더 + 메인 콘텐츠 + 하단 네비게이션
 */

import { MainLayout } from "@/components/layout/main-layout";

export default function MainLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}

