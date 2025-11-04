/**
 * @file app/api/follows/route.ts
 * @description 팔로우/언팔로우 API Route
 * 
 * POST: 팔로우 추가
 * DELETE: 팔로우 취소
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

    const { following_id } = await req.json();
    if (!following_id) {
      return NextResponse.json({ error: "following_id가 필요합니다." }, { status: 400 });
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

    // 2. 자기 자신 팔로우 방지
    if (userData.id === following_id) {
      return NextResponse.json(
        { error: "자기 자신을 팔로우할 수 없습니다." },
        { status: 400 }
      );
    }

    // 3. 대상 사용자가 존재하는지 확인
    const { data: targetUser, error: targetUserError } = await supabase
      .from("users")
      .select("id")
      .eq("id", following_id)
      .single();

    if (targetUserError || !targetUser) {
      return NextResponse.json(
        { error: "팔로우할 사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 4. 이미 팔로우 중인지 확인
    const { data: existingFollow } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", userData.id)
      .eq("following_id", following_id)
      .single();

    if (existingFollow) {
      return NextResponse.json(
        { error: "이미 팔로우 중인 사용자입니다." },
        { status: 400 }
      );
    }

    // 5. 팔로우 추가
    const { data, error } = await supabase
      .from("follows")
      .insert({
        follower_id: userData.id,
        following_id: following_id,
      })
      .select()
      .single();

    if (error) {
      console.error("팔로우 추가 에러:", error);
      return NextResponse.json(
        { error: "팔로우 추가에 실패했습니다." },
        { status: 500 }
      );
    }

    console.log("팔로우 추가 성공:", { follower_id: userData.id, following_id });

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error("팔로우 API 에러:", error);
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
    const following_id = searchParams.get("following_id");

    if (!following_id) {
      return NextResponse.json({ error: "following_id가 필요합니다." }, { status: 400 });
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

    // 2. 팔로우 삭제
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", userData.id)
      .eq("following_id", following_id);

    if (error) {
      console.error("팔로우 삭제 에러:", error);
      return NextResponse.json(
        { error: "팔로우 삭제에 실패했습니다." },
        { status: 500 }
      );
    }

    console.log("팔로우 삭제 성공:", { follower_id: userData.id, following_id });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("팔로우 삭제 API 에러:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

