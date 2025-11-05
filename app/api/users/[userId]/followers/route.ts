/**
 * @file app/api/users/[userId]/followers/route.ts
 * @description 팔로워 목록 조회 API Route
 * 
 * GET: 특정 사용자의 팔로워 목록 조회
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    console.log("=== 팔로워 목록 조회 API 시작 ===");
    const { userId: targetUserId } = await params;
    const { userId: currentUserId } = await auth();

    const supabase = await createClerkSupabaseClient();

    // 1. 현재 사용자 ID 조회 (팔로우 상태 확인용)
    let currentUserDbId: string | null = null;
    if (currentUserId) {
      const { data: currentUserData } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", currentUserId)
        .single();

      if (currentUserData) {
        currentUserDbId = currentUserData.id;
      }
    }

    // 2. 팔로워 목록 조회 (targetUserId를 팔로우하는 사용자들)
    const { data: followersData, error: followersError } = await supabase
      .from("follows")
      .select("follower_id")
      .eq("following_id", targetUserId)
      .order("created_at", { ascending: false });

    if (followersError) {
      console.error("팔로워 조회 에러:", followersError);
      return NextResponse.json(
        { error: "팔로워 목록 조회에 실패했습니다." },
        { status: 500 }
      );
    }

    if (!followersData || followersData.length === 0) {
      return NextResponse.json(
        {
          success: true,
          data: [],
        },
        { status: 200 }
      );
    }

    // 3. 팔로워 ID 목록 추출
    const followerIds = followersData.map((f) => f.follower_id);

    // 4. 사용자 정보 조회
    const { data: usersData, error: usersError } = await supabase
      .from("users")
      .select("id, name, clerk_id, created_at")
      .in("id", followerIds);

    if (usersError) {
      console.error("사용자 조회 에러:", usersError);
      return NextResponse.json(
        { error: "사용자 정보 조회에 실패했습니다." },
        { status: 500 }
      );
    }

    // 5. 현재 사용자가 각 팔로워를 팔로우하는지 확인
    const followersWithFollowStatus = await Promise.all(
      (usersData || []).map(async (user) => {
        let isFollowing = false;
        
        if (currentUserDbId && user.id) {
          const { data: followData } = await supabase
            .from("follows")
            .select("id")
            .eq("follower_id", currentUserDbId)
            .eq("following_id", user.id)
            .single();

          isFollowing = !!followData;
        }

        return {
          id: user.id,
          name: user.name,
          clerk_id: user.clerk_id,
          created_at: user.created_at,
          isFollowing,
        };
      })
    );

    console.log("팔로워 목록 조회 성공:", { count: followersWithFollowStatus.length });

    return NextResponse.json(
      {
        success: true,
        data: followersWithFollowStatus,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("팔로워 목록 API 에러:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
