/**
 * @file app/api/posts/route.ts
 * @description 게시물 API Route
 * 
 * GET: 게시물 목록 조회 (페이지네이션, 홈 피드)
 * POST: 게시물 생성
 */

import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    const supabase = await createClerkSupabaseClient();

    // 쿼리 파라미터
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const showAll = searchParams.get("all") === "true"; // 탐색 페이지용: 모든 게시물 조회
    const offset = (page - 1) * limit;

    // 현재 사용자 정보 조회 (팔로우한 사용자 확인용)
    let currentUserId: string | null = null;
    let followingUserIds: string[] = [];

    if (userId && !showAll) {
      // 탐색 페이지가 아닌 경우에만 팔로우 필터 적용
      const { data: currentUserData } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", userId)
        .single();

      if (currentUserData) {
        currentUserId = currentUserData.id;

        // 팔로우한 사용자 목록 조회
        const { data: followsData } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", currentUserId);

        followingUserIds = followsData?.map((f) => f.following_id) || [];
      }
    } else if (userId && showAll) {
      // 탐색 페이지인 경우: 좋아요 여부 확인을 위해 사용자 ID만 조회
      const { data: currentUserData } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", userId)
        .single();

      if (currentUserData) {
        currentUserId = currentUserData.id;
      }
    }

    // 게시물 조회
    // 탐색 페이지(all=true) 또는 로그인하지 않은 경우: 모든 게시물 조회
    let query = supabase
      .from("posts")
      .select(`
        *,
        user:users(id, name, clerk_id, created_at)
      `)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // 탐색 페이지가 아닌 경우에만 팔로우 필터 적용
    if (!showAll) {
      // 로그인한 경우: 팔로우한 사용자 + 본인 게시물만 조회
      if (currentUserId && followingUserIds.length > 0) {
        query = query.in("user_id", [currentUserId, ...followingUserIds]);
      } else if (currentUserId) {
        // 팔로우한 사용자가 없으면 본인 게시물만 조회
        query = query.eq("user_id", currentUserId);
      }
    }

    const { data: postsData, error: postsError } = await query;

    if (postsError) {
      console.error("게시물 조회 에러:", postsError);
      return NextResponse.json(
        { error: "게시물을 불러오는데 실패했습니다." },
        { status: 500 }
      );
    }

    // 각 게시물의 통계 및 좋아요 여부 조회
    const postsWithStats = await Promise.all(
      (postsData || []).map(async (post) => {
        // 통계 조회
        const { data: statsData } = await supabase
          .from("post_stats")
          .select("likes_count, comments_count")
          .eq("post_id", post.id)
          .single();

        // 현재 사용자의 좋아요 여부 확인
        let isLiked = false;
        if (currentUserId) {
          const { data: likeData } = await supabase
            .from("likes")
            .select("id")
            .eq("post_id", post.id)
            .eq("user_id", currentUserId)
            .single();

          isLiked = !!likeData;
        }

        return {
          ...post,
          likes_count: statsData?.likes_count || 0,
          comments_count: statsData?.comments_count || 0,
          is_liked: isLiked,
        };
      })
    );

    // 총 게시물 수 조회 (페이지네이션을 위해)
    let countQuery = supabase.from("posts").select("*", { count: "exact", head: true });
    if (!showAll) {
      // 탐색 페이지가 아닌 경우에만 팔로우 필터 적용
      if (currentUserId && followingUserIds.length > 0) {
        countQuery = countQuery.in("user_id", [currentUserId, ...followingUserIds]);
      } else if (currentUserId) {
        countQuery = countQuery.eq("user_id", currentUserId);
      }
    }

    const { count } = await countQuery;
    const totalPages = Math.ceil((count || 0) / limit);

    console.log("게시물 조회 성공:", {
      page,
      limit,
      total: count,
      totalPages,
      postsCount: postsWithStats.length,
    });

    return NextResponse.json(
      {
        success: true,
        data: postsWithStats,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages,
          hasMore: page < totalPages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("게시물 조회 API 에러:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const { image_url, caption } = await req.json();

    // 입력 검증
    if (!image_url) {
      return NextResponse.json({ error: "image_url이 필요합니다." }, { status: 400 });
    }

    // 캡션 검증 (최대 2,200자)
    if (caption && caption.length > 2200) {
      return NextResponse.json(
        { error: "캡션은 최대 2,200자까지 입력할 수 있습니다." },
        { status: 400 }
      );
    }

    const supabase = await createClerkSupabaseClient();

    // 사용자 ID 조회
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

    // 게시물 생성
    const { data, error } = await supabase
      .from("posts")
      .insert({
        user_id: userData.id,
        image_url,
        caption: caption?.trim() || null,
      })
      .select(`
        *,
        user:users(id, name, clerk_id, created_at)
      `)
      .single();

    if (error) {
      console.error("게시물 생성 에러:", error);
      return NextResponse.json(
        { error: "게시물 생성에 실패했습니다." },
        { status: 500 }
      );
    }

    console.log("게시물 생성 성공:", { post_id: data.id, user_id: userData.id });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...data,
          likes_count: 0,
          comments_count: 0,
          is_liked: false,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("게시물 생성 API 에러:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

