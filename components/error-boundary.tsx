/**
 * @file components/error-boundary.tsx
 * @description 에러 바운더리 컴포넌트
 * 
 * React 컴포넌트 트리에서 발생한 에러를 캐치하고
 * 사용자 친화적인 에러 UI를 표시합니다.
 */

"use client";

import { Component, ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <AlertCircle className="w-16 h-16 text-[var(--instagram-error)] mb-4" />
          <h2 className="text-[var(--font-size-xl)] font-semibold text-[var(--instagram-text)] mb-2">
            오류가 발생했습니다
          </h2>
          <p className="text-[var(--font-size-sm)] text-[var(--instagram-text-secondary)] mb-6 text-center max-w-md">
            {this.state.error?.message ||
              "예기치 않은 오류가 발생했습니다. 페이지를 새로고침해주세요."}
          </p>
          <Button onClick={this.handleReset} variant="outline">
            페이지 새로고침
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

