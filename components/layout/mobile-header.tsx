/**
 * @file components/layout/mobile-header.tsx
 * @description 모바일 상단 헤더 컴포넌트
 * 
 * 로고와 주요 아이콘들을 표시합니다.
 */

"use client";

import Link from "next/link";
import { PlusSquare, Heart } from "lucide-react";

export function MobileHeader() {
  return (
    <header className="h-14 flex items-center justify-between px-4">
      {/* 로고 */}
      <Link href="/home" className="text-xl font-bold text-[var(--instagram-text)]">
        INSIDE
      </Link>

      {/* 아이콘들 */}
      <div className="flex items-center gap-4">
        <Link href="/create">
          <PlusSquare size={24} className="text-[var(--instagram-text)]" />
        </Link>
        <Link href="/activity">
          <Heart size={24} className="text-[var(--instagram-text)]" />
        </Link>
      </div>
    </header>
  );
}

