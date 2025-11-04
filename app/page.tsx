/**
 * @file app/page.tsx
 * @description 루트 페이지 (리다이렉트)
 * 
 * 메인 페이지로 리다이렉트합니다.
 */

import { redirect } from "next/navigation";

export default function RootPage() {
  redirect("/home");
}
