/**
 * @file app/api/likes/route.ts
 * @description 좋아요 API Route
 * 
 * POST: 좋아요 추가
 * DELETE: 좋아요 취소
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const { post_id } = await req.json();
    if (!post_id) {
      return NextResponse.json({ error: "post_id가 필요합니다." }, { status: 400 });
    }

    const supabase = await createClerkSupabaseClient();

    // 1. 사용자 ID 조회 (clerk_id로 users 테이블에서 조회)
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: "사용자 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 2. 이미 좋아요가 있는지 확인
    const { data: existingLike } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", post_id)
      .eq("user_id", userData.id)
      .single();

    if (existingLike) {
      return NextResponse.json(
        { error: "이미 좋아요를 누른 게시물입니다." },
        { status: 400 }
      );
    }

    // 3. 좋아요 추가
    const { data, error } = await supabase
      .from("likes")
      .insert({
        post_id,
        user_id: userData.id,
      })
      .select()
      .single();

    if (error) {
      console.error("좋아요 추가 에러:", error);
      return NextResponse.json(
        { error: "좋아요 추가에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error("좋아요 API 에러:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const post_id = searchParams.get("post_id");

    if (!post_id) {
      return NextResponse.json({ error: "post_id가 필요합니다." }, { status: 400 });
    }

    const supabase = await createClerkSupabaseClient();

    // 1. 사용자 ID 조회
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: "사용자 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 2. 좋아요 삭제
    const { error } = await supabase
      .from("likes")
      .delete()
      .eq("post_id", post_id)
      .eq("user_id", userData.id);

    if (error) {
      console.error("좋아요 삭제 에러:", error);
      return NextResponse.json(
        { error: "좋아요 삭제에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("좋아요 삭제 API 에러:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

