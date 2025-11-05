/**
 * @file app/(main)/page.tsx
 * @description 메인 그룹 루트 페이지
 * 
 * 빌드 오류 방지를 위한 빈 페이지 (실제로는 사용되지 않음)
 */

import { redirect } from "next/navigation";

export default function MainPage() {
  redirect("/home");
}

