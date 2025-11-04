/**
 * @file components/ui/ripple-button.tsx
 * @description Ripple 효과가 있는 버튼 컴포넌트
 * 
 * 클릭 시 ripple 효과를 표시하는 버튼입니다.
 */

"use client";

import { useRef, MouseEvent } from "react";
import { cn } from "@/lib/utils";

interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function RippleButton({ children, className, onClick, ...props }: RippleButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;
    if (!button) return;

    const ripple = document.createElement("span");
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.classList.add("ripple-effect");

    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);

    onClick?.(e);
  };

  return (
    <button
      ref={buttonRef}
      className={cn("relative overflow-hidden", className)}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

