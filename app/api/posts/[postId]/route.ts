/**
 * @file app/api/posts/[postId]/route.ts
 * @description 게시물 수정 및 삭제 API Route
 * 
 * PUT: 게시물 수정 (작성자만 가능)
 * DELETE: 게시물 삭제 (작성자만 가능)
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    console.log("=== 게시물 수정 API 시작 ===");
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const { postId } = await params;
    const { caption } = await req.json();

    console.log("수정할 게시물 ID:", postId, "새 캡션:", caption?.substring(0, 50));

    const supabase = await createClerkSupabaseClient();

    // 1. 사용자 ID 조회
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (userError || !userData) {
      console.error("사용자 조회 실패:", userError);
      return NextResponse.json(
        { error: "사용자 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    console.log("현재 사용자 ID:", userData.id);

    // 2. 게시물 소유자 확인
    const { data: postData, error: postError } = await supabase
      .from("posts")
      .select("user_id")
      .eq("id", postId)
      .single();

    if (postError || !postData) {
      console.error("게시물 조회 실패:", postError);
      return NextResponse.json(
        { error: "게시물을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    console.log("게시물 소유자 ID:", postData.user_id);

    // 3. 본인 게시물인지 확인
    if (postData.user_id !== userData.id) {
      console.error("권한 없음:", { postUserId: postData.user_id, currentUserId: userData.id });
      return NextResponse.json(
        { error: "본인의 게시물만 수정할 수 있습니다." },
        { status: 403 }
      );
    }

    // 4. 캡션 검증 (최대 2,200자)
    if (caption && caption.length > 2200) {
      return NextResponse.json(
        { error: "캡션은 최대 2,200자까지 입력할 수 있습니다." },
        { status: 400 }
      );
    }

    // 5. 게시물 수정
    const { data, error: updateError } = await supabase
      .from("posts")
      .update({
        caption: caption?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId)
      .eq("user_id", userData.id)
      .select(`
        *,
        user:users(id, name, clerk_id, created_at)
      `)
      .single();

    if (updateError) {
      console.error("게시물 수정 에러:", updateError);
      return NextResponse.json(
        { error: "게시물 수정에 실패했습니다." },
        { status: 500 }
      );
    }

    console.log("게시물 수정 성공:", postId);

    return NextResponse.json(
      {
        success: true,
        data: {
          ...data,
          likes_count: 0,
          comments_count: 0,
          is_liked: false,
        },
        message: "게시물이 수정되었습니다.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("게시물 수정 API 에러:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    console.log("=== 게시물 삭제 API 시작 ===");
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const { postId } = await params;
    console.log("삭제할 게시물 ID:", postId);

    const supabase = await createClerkSupabaseClient();

    // 1. 사용자 ID 조회
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (userError || !userData) {
      console.error("사용자 조회 실패:", userError);
      return NextResponse.json(
        { error: "사용자 정보를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    console.log("현재 사용자 ID:", userData.id);

    // 2. 게시물 소유자 확인
    const { data: postData, error: postError } = await supabase
      .from("posts")
      .select("user_id, image_url")
      .eq("id", postId)
      .single();

    if (postError || !postData) {
      console.error("게시물 조회 실패:", postError);
      return NextResponse.json(
        { error: "게시물을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    console.log("게시물 소유자 ID:", postData.user_id);

    // 3. 본인 게시물인지 확인
    if (postData.user_id !== userData.id) {
      console.error("권한 없음:", { postUserId: postData.user_id, currentUserId: userData.id });
      return NextResponse.json(
        { error: "본인의 게시물만 삭제할 수 있습니다." },
        { status: 403 }
      );
    }

    // 4. 게시물 삭제
    const { error: deleteError } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId)
      .eq("user_id", userData.id);

    if (deleteError) {
      console.error("게시물 삭제 에러:", deleteError);
      return NextResponse.json(
        { error: "게시물 삭제에 실패했습니다." },
        { status: 500 }
      );
    }

    console.log("게시물 삭제 성공:", postId);

    return NextResponse.json(
      { success: true, message: "게시물이 삭제되었습니다." },
      { status: 200 }
    );
  } catch (error) {
    console.error("게시물 삭제 API 에러:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

