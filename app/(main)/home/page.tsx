/**
 * @file app/(main)/home/page.tsx
 * @description 메인 홈 페이지
 * 
 * 홈 피드가 표시될 페이지입니다.
 * 현재는 임시 콘텐츠를 표시합니다.
 */

export default function HomePage() {
  return (
    <div className="py-4">
      <h1 className="text-2xl font-bold text-[var(--instagram-text)] mb-4">
        홈 피드
      </h1>
      <p className="text-[var(--instagram-text-secondary)]">
        게시물이 여기에 표시됩니다.
      </p>
    </div>
  );
}

