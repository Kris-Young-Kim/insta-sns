/**
 * @file app/(main)/profile/[userId]/page.tsx
 * @description 프로필 페이지
 * 
 * 사용자 프로필을 표시하는 페이지입니다.
 * 본인 프로필과 타인 프로필을 구분하여 처리합니다.
 */

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { ProfileHeader, PostGrid, FollowListModal } from "@/components/profile";
import { Post, User } from "@/types/post";
import { PostModal } from "@/components/post";

interface ProfileData {
  user: User;
  stats: {
    posts_count: number;
    followers_count: number;
    following_count: number;
  };
  isFollowing: boolean;
  isOwnProfile: boolean;
  posts: Post[];
}

export default function ProfilePage() {
  const params = useParams();
  const { user: currentUser } = useUser();
  const userId = params.userId as string;

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFollowersModalOpen, setIsFollowersModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);

  // 프로필 데이터 로드
  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error("프로필을 불러올 수 없습니다.");
      }

      const data = await response.json();
      setProfileData(data);
    } catch (err) {
      console.error("프로필 로드 에러:", err);
      setError(err instanceof Error ? err.message : "프로필을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 팔로우 처리
  const handleFollow = async () => {
    if (!profileData) return;

    // 낙관적 업데이트: 즉시 UI 반영
    const previousData = profileData;
    setProfileData((prev) =>
      prev
        ? {
            ...prev,
            isFollowing: true,
            stats: {
              ...prev.stats,
              followers_count: prev.stats.followers_count + 1,
            },
          }
        : null
    );

    try {
      const response = await fetch("/api/follows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ following_id: userId }),
      });

      if (!response.ok) {
        throw new Error("팔로우에 실패했습니다.");
      }

      console.log("팔로우 성공:", userId);
    } catch (error) {
      console.error("팔로우 에러:", error);
      // 에러 발생 시 롤백
      setProfileData(previousData);
    }
  };

  // 언팔로우 처리
  const handleUnfollow = async () => {
    if (!profileData) return;

    // 낙관적 업데이트: 즉시 UI 반영
    const previousData = profileData;
    setProfileData((prev) =>
      prev
        ? {
            ...prev,
            isFollowing: false,
            stats: {
              ...prev.stats,
              followers_count: Math.max(0, prev.stats.followers_count - 1),
            },
          }
        : null
    );

    try {
      const response = await fetch(`/api/follows?following_id=${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("언팔로우에 실패했습니다.");
      }

      console.log("언팔로우 성공:", userId);
    } catch (error) {
      console.error("언팔로우 에러:", error);
      // 에러 발생 시 롤백
      setProfileData(previousData);
    }
  };

  // 게시물 클릭 처리
  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  };

  // 댓글 작성 처리
  const handleCommentSubmit = async (postId: string, content: string) => {
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ post_id: postId, content }),
      });

      if (!response.ok) {
        throw new Error("댓글 작성에 실패했습니다.");
      }

      // 프로필 데이터 새로고침 (댓글 수 업데이트)
      await loadProfile();
    } catch (error) {
      console.error("댓글 작성 에러:", error);
      throw error;
    }
  };

  // 댓글 삭제 처리
  const handleCommentDelete = async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments?comment_id=${commentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("댓글 삭제에 실패했습니다.");
      }

      // 프로필 데이터 새로고침 (댓글 수 업데이트)
      await loadProfile();
    } catch (error) {
      console.error("댓글 삭제 에러:", error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-[var(--instagram-text-secondary)]">로딩 중...</div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-[var(--instagram-error)]">{error || "프로필을 찾을 수 없습니다."}</div>
      </div>
    );
  }

  return (
    <div className="py-4 page-transition">
      {/* 프로필 헤더 */}
      <ProfileHeader
        user={profileData.user}
        postsCount={profileData.stats.posts_count}
        followersCount={profileData.stats.followers_count}
        followingCount={profileData.stats.following_count}
        isOwnProfile={profileData.isOwnProfile}
        isFollowing={profileData.isFollowing}
        onFollow={handleFollow}
        onUnfollow={handleUnfollow}
        onFollowersClick={() => setIsFollowersModalOpen(true)}
        onFollowingClick={() => setIsFollowingModalOpen(true)}
      />

      {/* 게시물 그리드 */}
      <div className="mt-8">
        <PostGrid posts={profileData.posts} onPostClick={handlePostClick} />
      </div>

      {/* 포스트 상세보기 모달 */}
      <PostModal
        post={selectedPost}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onCommentSubmit={handleCommentSubmit}
        onCommentDelete={handleCommentDelete}
      />

      {/* 팔로워 목록 모달 */}
      <FollowListModal
        open={isFollowersModalOpen}
        onOpenChange={setIsFollowersModalOpen}
        userId={userId}
        type="followers"
      />

      {/* 팔로잉 목록 모달 */}
      <FollowListModal
        open={isFollowingModalOpen}
        onOpenChange={setIsFollowingModalOpen}
        userId={userId}
        type="following"
      />
    </div>
  );
}

