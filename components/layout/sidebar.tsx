/**
 * @file components/layout/sidebar.tsx
 * @description 사이드바 컴포넌트
 * 
 * Desktop: 244px 너비, 텍스트 + 아이콘
 * Tablet: 72px 너비, 아이콘만 표시
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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="h-full flex flex-col">
      {/* Desktop: 244px 너비 */}
      <div className="hidden lg:flex flex-col w-[244px] px-3 py-4 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105 ${
                isActive
                  ? "text-[var(--instagram-text)] font-semibold"
                  : "text-[var(--instagram-text)] hover:bg-[var(--instagram-bg-secondary)]"
              }`}
            >
              <Icon size={24} className="transition-transform duration-200" />
              <span className="text-[var(--font-size-base)]">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Tablet: 72px 너비, 아이콘만 */}
      <div className="lg:hidden flex flex-col w-[72px] items-center py-4 gap-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                isActive
                  ? "text-[var(--instagram-text)]"
                  : "text-[var(--instagram-text-secondary)] hover:bg-[var(--instagram-bg-secondary)]"
              }`}
            >
              <Icon size={24} className="transition-transform duration-200" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

