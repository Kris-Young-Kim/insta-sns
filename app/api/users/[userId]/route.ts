/**
 * @file app/api/users/[userId]/route.ts
 * @description 사용자 정보 API Route
 * 
 * GET: 사용자 정보 및 통계 조회
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: targetUserId } = await params;
    const { userId: currentUserId } = await auth();

    const supabase = await createClerkSupabaseClient();

    // 1. 대상 사용자 정보 조회
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", targetUserId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 2. 사용자 통계 조회 (뷰 사용)
    const { data: statsData, error: statsError } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", targetUserId)
      .single();

    if (statsError) {
      console.error("통계 조회 에러:", statsError);
    }

    // 3. 현재 사용자가 이 사용자를 팔로우하는지 확인
    let isFollowing = false;
    if (currentUserId) {
      const { data: currentUserData } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", currentUserId)
        .single();

      if (currentUserData) {
        const { data: followData } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", currentUserData.id)
          .eq("following_id", targetUserId)
          .single();

        isFollowing = !!followData;
      }
    }

    // 4. 사용자의 게시물 목록 조회 (최신순)
    const { data: postsData, error: postsError } = await supabase
      .from("posts")
      .select("*")
      .eq("user_id", targetUserId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (postsError) {
      console.error("게시물 조회 에러:", postsError);
    }

    // 5. 각 게시물의 통계 조회 (post_stats 뷰 사용)
    const postsWithStats = await Promise.all(
      (postsData || []).map(async (post) => {
        const { data: statsData } = await supabase
          .from("post_stats")
          .select("likes_count, comments_count")
          .eq("post_id", post.id)
          .single();

        return {
          ...post,
          likes_count: statsData?.likes_count || 0,
          comments_count: statsData?.comments_count || 0,
        };
      })
    );

    // 6. 응답 데이터 구성
    const response = {
      user: userData,
      stats: statsData || {
        posts_count: 0,
        followers_count: 0,
        following_count: 0,
      },
      isFollowing,
      isOwnProfile: currentUserId === userData.clerk_id,
      posts: postsWithStats || [],
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("사용자 정보 API 에러:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

