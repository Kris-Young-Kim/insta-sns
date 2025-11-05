/**
 * @file components/profile/follow-list-modal.tsx
 * @description 팔로워/팔로잉 목록 모달 컴포넌트
 * 
 * 팔로워 또는 팔로잉 목록을 표시하는 모달입니다.
 * 각 사용자에 대해 팔로우/언팔로우 버튼을 제공합니다.
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { apiGet, apiPost, apiDelete } from "@/lib/utils/api-client";

interface User {
  id: string;
  name: string;
  clerk_id: string;
  created_at: string;
  isFollowing: boolean;
}

interface FollowListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  type: "followers" | "following";
}

export function FollowListModal({
  open,
  onOpenChange,
  userId,
  type,
}: FollowListModalProps) {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingUserIds, setUpdatingUserIds] = useState<Set<string>>(new Set());

  // 모달이 열릴 때마다 목록 로드
  useEffect(() => {
    if (open && userId) {
      loadUsers();
    } else {
      // 모달이 닫힐 때 상태 초기화
      setUsers([]);
      setError(null);
    }
  }, [open, userId, type]);

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log(`FollowListModal: ${type} 목록 로드 시작`, { userId });

      const endpoint = `/api/users/${userId}/${type}`;
      const result = await apiGet<User[]>(endpoint);

      if (result.success === false) {
        throw new Error(result.error || "목록 조회에 실패했습니다.");
      }

      console.log(`FollowListModal: ${type} 목록 로드 성공`, {
        count: result.data?.length || 0,
      });

      setUsers(result.data || []);
    } catch (err) {
      console.error(`FollowListModal: ${type} 목록 로드 실패:`, err);
      setError(err instanceof Error ? err.message : "목록 조회에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async (targetUserId: string) => {
    setUpdatingUserIds((prev) => new Set(prev).add(targetUserId));

    try {
      console.log("FollowListModal: 팔로우 시작", { targetUserId });

      const result = await apiPost("/api/follows", {
        following_id: targetUserId,
      });

      if (result.success === false) {
        throw new Error(result.error || "팔로우에 실패했습니다.");
      }

      // 목록 업데이트
      setUsers((prev) =>
        prev.map((user) =>
          user.id === targetUserId
            ? { ...user, isFollowing: true }
            : user
        )
      );

      console.log("FollowListModal: 팔로우 성공", { targetUserId });
    } catch (err) {
      console.error("FollowListModal: 팔로우 실패:", err);
      alert(err instanceof Error ? err.message : "팔로우에 실패했습니다.");
    } finally {
      setUpdatingUserIds((prev) => {
        const next = new Set(prev);
        next.delete(targetUserId);
        return next;
      });
    }
  };

  const handleUnfollow = async (targetUserId: string) => {
    setUpdatingUserIds((prev) => new Set(prev).add(targetUserId));

    try {
      console.log("FollowListModal: 언팔로우 시작", { targetUserId });

      const result = await apiDelete(`/api/follows?following_id=${targetUserId}`);

      if (result.success === false) {
        throw new Error(result.error || "언팔로우에 실패했습니다.");
      }

      // 목록 업데이트
      setUsers((prev) =>
        prev.map((user) =>
          user.id === targetUserId
            ? { ...user, isFollowing: false }
            : user
        )
      );

      console.log("FollowListModal: 언팔로우 성공", { targetUserId });
    } catch (err) {
      console.error("FollowListModal: 언팔로우 실패:", err);
      alert(err instanceof Error ? err.message : "언팔로우에 실패했습니다.");
    } finally {
      setUpdatingUserIds((prev) => {
        const next = new Set(prev);
        next.delete(targetUserId);
        return next;
      });
    }
  };

  const handleUserClick = (user: User) => {
    onOpenChange(false);
    router.push(`/profile/${user.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[500px] !w-[90vw] sm:!w-[400px] max-h-[600px] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-center text-[var(--font-size-lg)] font-semibold text-[var(--instagram-text)]">
            {type === "followers" ? "팔로워" : "팔로잉"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--instagram-text-secondary)]" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <p className="text-[var(--font-size-sm)] text-red-500 mb-4">{error}</p>
              <Button
                onClick={loadUsers}
                variant="outline"
                className="text-[var(--font-size-sm)]"
              >
                다시 시도
              </Button>
            </div>
          ) : users.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-[var(--font-size-sm)] text-[var(--instagram-text-secondary)]">
                {type === "followers" ? "팔로워가 없습니다." : "팔로잉이 없습니다."}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 hover:bg-[var(--instagram-bg-secondary)] transition-colors"
                >
                  <button
                    onClick={() => handleUserClick(user)}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    {/* 아바타 */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-[2px] flex-shrink-0">
                      <div className="w-full h-full rounded-full bg-[var(--instagram-bg)] flex items-center justify-center">
                        <span className="text-sm font-bold text-[var(--instagram-text)]">
                          {user.name?.[0]?.toUpperCase() || "U"}
                        </span>
                      </div>
                    </div>

                    {/* 사용자 이름 */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[var(--font-size-sm)] font-semibold text-[var(--instagram-text)] truncate">
                        {user.name}
                      </p>
                    </div>
                  </button>

                  {/* 팔로우/언팔로우 버튼 */}
                  {user.isFollowing ? (
                    <Button
                      onClick={() => handleUnfollow(user.id)}
                      disabled={updatingUserIds.has(user.id)}
                      variant="outline"
                      className="text-[var(--font-size-sm)] font-semibold flex-shrink-0 ml-2"
                    >
                      {updatingUserIds.has(user.id) ? (
                        <>
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          처리 중...
                        </>
                      ) : (
                        "팔로잉"
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleFollow(user.id)}
                      disabled={updatingUserIds.has(user.id)}
                      className="bg-[var(--instagram-link)] hover:bg-[var(--instagram-link)]/90 text-white text-[var(--font-size-sm)] font-semibold flex-shrink-0 ml-2"
                    >
                      {updatingUserIds.has(user.id) ? (
                        <>
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          처리 중...
                        </>
                      ) : (
                        "팔로우"
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

