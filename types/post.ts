/**
 * @file types/post.ts
 * @description 게시물 관련 TypeScript 타입 정의
 */

export interface User {
  id: string;
  clerk_id: string;
  name: string;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface Like {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

