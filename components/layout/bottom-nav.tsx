/**
 * @file components/layout/bottom-nav.tsx
 * @description 모바일 하단 네비게이션 컴포넌트
 * 
 * 5개의 주요 네비게이션 아이콘을 표시합니다.
 */

"use client";

import { Home, Search, PlusSquare, User, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { icon: Home, label: "홈", href: "/home" },
  { icon: Search, label: "탐색", href: "/explore" },
  { icon: PlusSquare, label: "생성", href: "/create" },
  { icon: User, label: "프로필", href: "/profile" },
  { icon: Settings, label: "설정", href: "/settings" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="h-14 flex items-center justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-2 ${
              isActive
                ? "text-[var(--instagram-text)]"
                : "text-[var(--instagram-text-secondary)]"
            }`}
          >
            <Icon size={24} />
            <span className="text-[var(--font-size-xs)]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

