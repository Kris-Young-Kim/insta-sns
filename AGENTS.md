# AI Agent 가이드 - INSIDE 프로젝트

이 문서는 AI 에이전트가 INSIDE 프로젝트를 이해하고 작업할 때 참고해야 할 핵심 정보를 제공합니다.

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [문서 구조](#문서-구조)
3. [작업 워크플로우](#작업-워크플로우)
4. [코드 컨벤션](#코드-컨벤션)
5. [주요 기술 스택](#주요-기술-스택)
6. [디렉토리 구조](#디렉토리-구조)
7. [참고 문서](#참고-문서)

---

## 프로젝트 개요

**INSIDE**는 Instagram 스타일의 소셜 네트워크 서비스입니다.

### 핵심 기술 스택

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL, Storage), Clerk (인증)
- **Deployment**: Vercel

### 주요 기능

- 게시물 작성 및 공유 (이미지 + 캡션)
- 좋아요 및 댓글 기능
- 팔로우/언팔로우 시스템
- 프로필 페이지
- 게시물 삭제 기능 (작성자만 가능)
- 완전한 반응형 디자인

---

## 문서 구조

### 필수 참고 문서

1. **`PRD.md`** - 프로젝트 요구사항 문서

   - 프로젝트 목적 및 기능 요구사항
   - 기술 스택 및 아키텍처 설계
   - MVP 기능 목록

2. **`TODO.md`** - 작업 체크리스트

   - 완료된 항목과 진행 중인 항목
   - 각 기능별 세부 작업 목록
   - **중요**: TODO 문서의 각 섹션에 Markdown 링크가 있으면 반드시 해당 파일을 열어 확인

3. **`README.md`** - 프로젝트 가이드

   - 설치 및 실행 방법
   - 환경 변수 설정
   - 프로젝트 구조

4. **`docs/design-system.md`** - 디자인 시스템 가이드

   - 컬러 팔레트
   - 폰트 체계
   - 간격 시스템
   - 컴포넌트 스타일 가이드

5. **`docs/deployment-guide.md`** - 배포 가이드

   - Vercel 배포 설정
   - 환경 변수 설정
   - 프로덕션 체크리스트

6. **`docs/qa-checklist.md`** - QA 체크리스트

   - 반응형 디자인 QA
   - 예외 상황 처리
   - 성능 최적화

7. **`docs/extension-features-design.md`** - 2차 확장 기능 설계
   - 향후 추가될 기능들의 설계 문서

---

## 작업 워크플로우

### TODO 문서 작업 시

TODO 문서(`TODO.md`)의 각 섹션에 Markdown 링크가 있으면, 해당 링크의 파일을 **반드시** 열어 요약한다.

#### 링크 해석 규칙

- **절대 경로가 주어지면**: 그대로 사용
- **상대 경로인 경우**: 리포지터리 루트 기준으로 해석
  - 예: `./feature/homefeed/homefeed.md` → `docs/feature/homefeed/homefeed.md`
  - 예: `[디자인 시스템](docs/design-system.md)` → `docs/design-system.md`

#### 사용 예시

```
사용자: "@TODO.md 홈피드 페이지 확인"
→ 에이전트는 TODO.md의 관련 섹션을 확인하고, 링크된 파일이 있으면 자동으로 열어 요약
```

### 코드 작성 시

1. **기존 코드 스타일 유지**

   - 프로젝트의 기존 패턴과 컨벤션을 따름
   - 파일 상단에 JSDoc 주석 추가

2. **디자인 시스템 준수**

   - CSS 변수 사용 (`var(--instagram-*)`)
   - 폰트 크기 변수 사용 (`var(--font-size-*)`)
   - 간격 변수 사용 (`var(--spacing-*)`)

3. **에러 핸들링**

   - `lib/utils/error-handler.ts`의 유틸리티 함수 사용
   - 사용자 친화적인 에러 메시지 제공

4. **성능 최적화**
   - Next.js Image 컴포넌트 사용
   - 코드 스플리팅 고려
   - 불필요한 리렌더링 방지

### 파일 작업 시

1. **새 파일 생성 전**

   - 기존 유사한 파일 확인
   - 디렉토리 구조 확인
   - 네이밍 컨벤션 확인

2. **기존 파일 수정 시**
   - 파일 전체를 읽어 컨텍스트 파악
   - 관련 파일들도 함께 확인
   - 변경사항이 다른 부분에 미치는 영향 고려

---

## 코드 컨벤션

### 파일명

- **컴포넌트**: kebab-case (예: `post-card.tsx`, `profile-header.tsx`)
- **유틸리티**: kebab-case (예: `error-handler.ts`)
- **타입 정의**: kebab-case (예: `post.ts`)

### 컴포넌트 구조

- **파일 상단**: JSDoc 주석 (파일 설명, 주요 기능, 의존성)
- **타입 정의**: 파일 상단 또는 별도 타입 파일
- **컴포넌트**: 기본 export

### 네이밍

- **컴포넌트**: PascalCase
- **함수/변수**: camelCase
- **타입/인터페이스**: PascalCase
- **상수**: UPPER_SNAKE_CASE

### 스타일링

- Tailwind CSS 클래스 사용
- CSS 변수 활용 (`var(--instagram-*)`)
- 반응형: 모바일 우선 (`sm:`, `lg:` 등)

---

## 주요 기술 스택

### Next.js 15

- **App Router** 사용
- **Server Components** 기본, Client Components는 `"use client"` 명시
- **API Routes**: `app/api/` 디렉토리

### Supabase

- **클라이언트**: `lib/supabase/clerk-client.ts` (Client Component용)
- **서버**: `lib/supabase/server.ts` (Server Component용)
- **서비스 역할**: `lib/supabase/service-role.ts` (관리자용)
- **RLS**: 개발 단계에서는 비활성화

### Clerk

- **인증**: `@clerk/nextjs` 사용
- **한국어 지원**: `koKR` locale 설정
- **사용자 동기화**: 자동으로 Supabase `users` 테이블에 동기화

### Tailwind CSS v4

- **커스텀 변수**: `app/globals.css`에 정의
- **Instagram 컬러 팔레트**: `var(--instagram-*)` 사용

---

## 디렉토리 구조

```
insta-sns/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 관련 페이지
│   ├── (main)/            # 메인 애플리케이션
│   │   ├── home/         # 홈 피드
│   │   └── profile/       # 프로필 페이지
│   ├── api/               # API Routes
│   │   ├── posts/        # 게시물 API
│   │   │   └── [postId]/ # 게시물 삭제 API
│   │   ├── likes/        # 좋아요 API
│   │   ├── comments/     # 댓글 API
│   │   ├── follows/      # 팔로우 API
│   │   └── users/        # 사용자 API
│   ├── layout.tsx        # Root Layout
│   └── globals.css       # 전역 스타일
│
├── components/            # React 컴포넌트
│   ├── ui/               # shadcn/ui 컴포넌트
│   ├── layout/           # 레이아웃 컴포넌트
│   ├── post/             # 게시물 관련 컴포넌트
│   ├── comment/          # 댓글 관련 컴포넌트
│   ├── profile/          # 프로필 관련 컴포넌트
│   ├── error-boundary.tsx # 에러 바운더리
│   └── empty-state.tsx   # 빈 상태 컴포넌트
│
├── lib/                   # 유틸리티 및 설정
│   ├── supabase/         # Supabase 클라이언트
│   └── utils/            # 공통 유틸리티
│
├── hooks/                 # Custom React Hooks
│   └── use-sync-user.ts  # 사용자 동기화 훅
│
├── supabase/             # Supabase 관련 파일
│   └── migrations/       # 데이터베이스 마이그레이션
│
├── docs/                 # 문서
│   ├── design-system.md  # 디자인 시스템 가이드
│   ├── deployment-guide.md # 배포 가이드
│   ├── qa-checklist.md  # QA 체크리스트
│   └── extension-features-design.md # 2차 확장 기능 설계
│
├── types/                # TypeScript 타입 정의
│   └── post.ts           # 게시물 관련 타입
│
├── .cursor/              # Cursor AI 규칙
│   └── rules/           # 개발 컨벤션 및 가이드
│
├── vercel.json           # Vercel 배포 설정
├── next.config.ts        # Next.js 설정
├── PRD.md                # 프로젝트 요구사항 문서
├── TODO.md               # 작업 체크리스트
└── README.md             # 프로젝트 문서
```

---

## 참고 문서

### 필수 읽기 순서

1. **`PRD.md`** - 프로젝트 요구사항 이해
2. **`README.md`** - 프로젝트 구조 및 설정 방법
3. **`TODO.md`** - 현재 작업 상태 확인
4. **`docs/design-system.md`** - 디자인 시스템 이해

### 작업별 참고 문서

#### 새로운 기능 개발 시

- `PRD.md` - 기능 요구사항 확인
- `docs/design-system.md` - 디자인 가이드 확인
- `docs/extension-features-design.md` - 2차 확장 기능 설계 참고

#### 배포 및 배포 전 작업 시

- `docs/deployment-guide.md` - 배포 설정 확인
- `docs/qa-checklist.md` - QA 체크리스트 확인
- `vercel.json` - 배포 설정 확인

#### 코드 리뷰 및 리팩토링 시

- `.cursor/rules/` - 코드 컨벤션 확인
- `docs/design-system.md` - 스타일 가이드 확인

---

## 작업 시 주의사항

### 1. RLS (Row Level Security)

- **개발 환경**: RLS 비활성화 (규칙에 명시됨)
- **프로덕션 환경**: RLS 활성화 필요 (설계 문서 참고)

### 2. 에러 핸들링

- 네트워크 오류, 권한 오류, 빈 데이터 상황 모두 처리
- `lib/utils/error-handler.ts`의 유틸리티 함수 활용
- 사용자 친화적인 메시지 제공

### 3. 성능 최적화

- Next.js Image 컴포넌트 사용 필수
- 불필요한 리렌더링 방지
- 코드 스플리팅 활용

### 4. 반응형 디자인

- 모바일 우선 설계
- 브레이크포인트: Mobile (320px~), Tablet (768px~), Desktop (1024px~)
- `docs/responsive-test-guide.md` 참고

### 5. 로깅

- 핵심 기능에 `console.log` 추가 (개발 단계)
- 프로덕션에서는 자동 제거 (`next.config.ts` 설정)

---

## 자주 사용하는 패턴

### API Route 작성

```typescript
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createClerkSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 },
      );
    }
    // ... 로직
  } catch (error) {
    console.error("API 에러:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
```

### 컴포넌트 작성

```typescript
/**
 * @file components/example/example-component.tsx
 * @description 컴포넌트 설명
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ExampleComponentProps {
  // props 정의
}

export function ExampleComponent({ ... }: ExampleComponentProps) {
  // 구현
}
```

### 에러 처리

```typescript
import { getErrorMessage } from "@/lib/utils/error-handler";

try {
  // API 호출
} catch (err) {
  const errorMessage = getErrorMessage(err);
  setError(errorMessage);
}
```

---

## 질문 및 문제 해결

### 작업 전 확인 사항

1. TODO.md에서 관련 항목 확인
2. PRD.md에서 요구사항 확인
3. 기존 유사 코드 확인
4. 디자인 시스템 가이드 확인

### 불확실한 경우

- 사용자에게 명확히 질문
- 추측 기반 구현 금지
- 관련 문서 다시 확인

### 에러 발생 시

1. 에러 로그 확인
2. 관련 파일 전체 읽기
3. 웹 검색 또는 공식 문서 확인
4. 최대 3회 수정 시도 후 사용자에게 도움 요청

---

## 참고 링크

- [Next.js 15 문서](https://nextjs.org/docs)
- [Clerk 문서](https://clerk.com/docs)
- [Supabase 문서](https://supabase.com/docs)
- [Tailwind CSS v4 문서](https://tailwindcss.com/docs)
- [shadcn/ui 문서](https://ui.shadcn.com/)

---

## 마지막 업데이트

- **날짜**: 2025-01-XX
- **버전**: MVP 완료 + 게시물 삭제 기능 추가
- **상태**: 프로덕션 배포 완료
- **최근 업데이트**:
  - 게시물 삭제 기능 추가 (작성자 전용)
  - TypeScript 타입 오류 수정
  - Vercel 빌드 오류 해결
  - GitHub Pages Jekyll 빌드 오류 해결
