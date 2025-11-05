/**
 * @file app/(main)/page.tsx
 * @description 메인 그룹 루트 페이지
 * 
 * 서버 사이드 리다이렉트로 변경하여 빌드 오류 방지
 */

import { redirect } from "next/navigation";

export default function MainPage() {
  redirect("/home");
}

