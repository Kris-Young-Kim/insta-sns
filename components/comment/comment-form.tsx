/**
 * @file components/comment/comment-form.tsx
 * @description 댓글 작성 폼 컴포넌트
 * 
 * 댓글을 작성하는 입력 폼입니다.
 */

"use client";

import { useState, useId } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommentFormProps {
  postId: string;
  onSubmit: (content: string) => Promise<void>;
  placeholder?: string;
}

export function CommentForm({ postId, onSubmit, placeholder = "댓글 달기..." }: CommentFormProps) {
  const commentInputId = useId();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent("");
    } catch (error) {
      console.error("댓글 작성 실패:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-[var(--instagram-border)] px-4 py-3">
      <input
        id={commentInputId}
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="flex-1 text-[var(--font-size-sm)] text-[var(--instagram-text)] placeholder:text-[var(--instagram-text-secondary)] bg-transparent outline-none"
        disabled={isSubmitting}
        maxLength={1000}
      />
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        disabled={!content.trim() || isSubmitting}
        className="text-[var(--instagram-link)] hover:text-[var(--instagram-link)]/80 disabled:opacity-50 disabled:cursor-not-allowed px-2"
      >
        <Send size={16} />
      </Button>
    </form>
  );
}

