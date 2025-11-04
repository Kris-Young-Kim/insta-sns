/**
 * @file components/profile/profile-header.tsx
 * @description 프로필 헤더 컴포넌트
 * 
 * 큰 아바타, 팔로워/팔로잉 카운트, 팔로우 버튼을 표시합니다.
 * 본인 프로필과 타인 프로필을 구분하여 처리합니다.
 */

"use client";

import { User } from "@/types/post";
import { Button } from "@/components/ui/button";

interface ProfileHeaderProps {
  user: User;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  isOwnProfile: boolean;
  isFollowing?: boolean;
  onFollow?: () => void;
  onUnfollow?: () => void;
}

export function ProfileHeader({
  user,
  postsCount,
  followersCount,
  followingCount,
  isOwnProfile,
  isFollowing = false,
  onFollow,
  onUnfollow,
}: ProfileHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-6 px-4 py-6">
      {/* 아바타 */}
      <div className="flex-shrink-0 flex justify-center sm:justify-start">
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-[3px]">
          <div className="w-full h-full rounded-full bg-[var(--instagram-bg)] flex items-center justify-center">
            <span className="text-3xl sm:text-4xl font-bold text-[var(--instagram-text)]">
              {user.name?.[0]?.toUpperCase() || "U"}
            </span>
          </div>
        </div>
      </div>

      {/* 사용자 정보 */}
      <div className="flex-1 space-y-4">
        {/* 사용자 이름 및 팔로우 버튼 */}
        <div className="flex items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-light text-[var(--instagram-text)]">
            {user.name}
          </h1>
          {!isOwnProfile && (
            <div className="flex gap-2">
              {isFollowing ? (
                <Button
                  onClick={onUnfollow}
                  variant="outline"
                  className="text-[var(--font-size-sm)] font-semibold"
                >
                  팔로잉
                </Button>
              ) : (
                <Button
                  onClick={onFollow}
                  className="bg-[var(--instagram-link)] hover:bg-[var(--instagram-link)]/90 text-white text-[var(--font-size-sm)] font-semibold"
                >
                  팔로우
                </Button>
              )}
            </div>
          )}
          {isOwnProfile && (
            <Button
              variant="outline"
              className="text-[var(--font-size-sm)] font-semibold"
            >
              프로필 편집
            </Button>
          )}
        </div>

        {/* 통계: 게시물, 팔로워, 팔로잉 */}
        <div className="flex gap-6">
          <div className="flex items-center gap-1">
            <span className="text-[var(--font-size-base)] font-semibold text-[var(--instagram-text)]">
              {postsCount.toLocaleString()}
            </span>
            <span className="text-[var(--font-size-base)] text-[var(--instagram-text)]">
              게시물
            </span>
          </div>
          <button className="flex items-center gap-1 hover:opacity-50">
            <span className="text-[var(--font-size-base)] font-semibold text-[var(--instagram-text)]">
              {followersCount.toLocaleString()}
            </span>
            <span className="text-[var(--font-size-base)] text-[var(--instagram-text)]">
              팔로워
            </span>
          </button>
          <button className="flex items-center gap-1 hover:opacity-50">
            <span className="text-[var(--font-size-base)] font-semibold text-[var(--instagram-text)]">
              {followingCount.toLocaleString()}
            </span>
            <span className="text-[var(--font-size-base)] text-[var(--instagram-text)]">
              팔로잉
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

