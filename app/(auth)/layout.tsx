/**
 * @file app/(auth)/layout.tsx
 * @description 인증 관련 페이지 레이아웃
 * 
 * 로그인/회원가입 페이지를 위한 레이아웃입니다.
 * 인증 관련 페이지는 간단한 중앙 정렬 레이아웃을 사용합니다.
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--instagram-bg-secondary)]">
      <div className="w-full max-w-md px-4">
        {children}
      </div>
    </div>
  );
}

