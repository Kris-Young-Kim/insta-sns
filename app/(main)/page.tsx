/**
 * @file app/(main)/page.tsx
 * @description 메인 그룹 루트 페이지
 * 
 * 홈으로 리다이렉트합니다.
 */

import { redirect } from "next/navigation";

export default function MainPage() {
  redirect("/home");
}


