/**
 * @file components/empty-state.tsx
 * @description 빈 상태 컴포넌트
 * 
 * 데이터가 없을 때 표시하는 빈 상태 UI입니다.
 */

"use client";

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {Icon && (
        <Icon
          className="w-16 h-16 text-[var(--instagram-text-secondary)] mb-4"
          strokeWidth={1.5}
        />
      )}
      <h3 className="text-[var(--font-size-lg)] font-semibold text-[var(--instagram-text)] mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-[var(--font-size-sm)] text-[var(--instagram-text-secondary)] mb-6 text-center max-w-md">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

