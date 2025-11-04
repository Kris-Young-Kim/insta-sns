# INSIDE - 새로운 세대의 소셜 네트워크

<div align="center">
  <br />
  <div>
    <img src="https://img.shields.io/badge/-Next.JS_15-black?style=for-the-badge&logoColor=white&logo=nextdotjs&color=black" alt="next.js" />
    <img src="https://img.shields.io/badge/-React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="react" />
    <img src="https://img.shields.io/badge/-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="typescript" />
    <img src="https://img.shields.io/badge/-Tailwind_v4-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="tailwind" />
    <img src="https://img.shields.io/badge/-Clerk-6C47FF?style=for-the-badge&logoColor=white&logo=clerk" alt="clerk" />
    <img src="https://img.shields.io/badge/-Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="supabase" />
  </div>

  <h1 align="center">INSIDE</h1>
  <h3 align="center">Instagram 스타일의 소셜 네트워크 서비스</h3>

  <p align="center">
    Next.js 15 + Clerk + Supabase로 구현된 현대적인 소셜 네트워크 플랫폼
  </p>
</div>

## 📋 목차

1. [소개](#소개)
2. [주요 기능](#주요-기능)
3. [기술 스택](#기술-스택)
4. [시작하기](#시작하기)
5. [배포 가이드](#배포-가이드)
6. [프로젝트 구조](#프로젝트-구조)
7. [개발 가이드](#개발-가이드)

## 소개

INSIDE는 Instagram 스타일의 소셜 네트워크 서비스입니다. 사용자는 게시물을 공유하고, 좋아요와 댓글을 통해 소통하며, 다른 사용자를 팔로우할 수 있습니다.

**핵심 특징:**
- 📸 게시물 작성 및 공유 (이미지 + 캡션)
- ❤️ 좋아요 및 댓글 기능
- 👥 팔로우/언팔로우 시스템
- 📱 완전한 반응형 디자인 (모바일, 태블릿, 데스크톱)
- 🎨 Instagram 기반 디자인 시스템
- ⚡ 빠른 성능 및 최적화

## 주요 기능

### 게시물
- 이미지 업로드 및 공유
- 캡션 작성 (최대 2,200자)
- 좋아요 (더블탭 제스처 지원)
- 댓글 작성 및 삭제
- 무한 스크롤 피드

### 프로필
- 사용자 프로필 페이지
- 게시물 그리드 뷰 (3열)
- 팔로워/팔로잉 카운트
- 팔로우/언팔로우 기능

### 인증
- Clerk를 통한 안전한 인증
- 소셜 로그인 지원
- 자동 사용자 동기화 (Clerk → Supabase)

## 기술 스택

### 프레임워크 & 라이브러리
- **Next.js 15** - React 프레임워크 (App Router, Server Components)
- **React 19** - UI 라이브러리
- **TypeScript** - 타입 안정성

### 인증 & 데이터베이스
- **Clerk** - 사용자 인증 및 관리
- **Supabase** - PostgreSQL 데이터베이스 및 파일 스토리지

### UI & 스타일링
- **Tailwind CSS v4** - 유틸리티 우선 CSS 프레임워크
- **shadcn/ui** - 재사용 가능한 컴포넌트 라이브러리
- **lucide-react** - 아이콘 라이브러리

## 시작하기

### 필수 요구사항

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en) (v18 이상)
- [pnpm](https://pnpm.io/) (권장 패키지 매니저)

### 설치

```bash
# 저장소 클론
git clone https://github.com/Kris-Young-Kim/insta-sns.git
cd insta-sns

# 의존성 설치
pnpm install
```

### 환경 변수 설정

`.env.example` 파일을 참고하여 `.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_STORAGE_BUCKET=uploads
```

### 데이터베이스 설정

1. Supabase Dashboard에서 프로젝트 생성
2. SQL Editor에서 마이그레이션 파일 실행:
   - `supabase/migrations/setup_schema.sql`
   - `supabase/migrations/setup_storage.sql`
   - `supabase/migrations/20251104224148_create_posts_comments_likes_follows.sql`

3. Storage 버킷 생성:
   - 버킷 이름: `uploads`
   - Public 설정 (필요에 따라)

### 개발 서버 실행

```bash
# 개발 서버 실행 (Turbopack)
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인합니다.

### 개발 명령어

```bash
# 개발 서버 실행
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start

# 린팅
pnpm lint
```

## 배포 가이드

### Vercel 배포

1. **Vercel 프로젝트 생성**
   - [Vercel Dashboard](https://vercel.com/dashboard)에 접속
   - "Add New Project" 클릭
   - GitHub 저장소 연결

2. **환경 변수 설정**
   - Vercel Dashboard → Settings → Environment Variables
   - 다음 변수들을 추가:
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
     - `CLERK_SECRET_KEY`
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `NEXT_PUBLIC_STORAGE_BUCKET`

3. **배포**
   - "Deploy" 버튼 클릭
   - 배포 완료 후 도메인 확인

### 프로덕션 환경 변수

프로덕션 환경에서는 다음을 확인하세요:

- ✅ 모든 환경 변수가 올바르게 설정됨
- ✅ Supabase RLS 정책이 활성화됨 (개발에서는 비활성화 가능)
- ✅ Clerk 웹훅이 프로덕션 URL로 설정됨
- ✅ 이미지 최적화가 활성화됨

## 프로젝트 구조

```
insta-sns/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 관련 페이지
│   ├── (main)/            # 메인 애플리케이션
│   │   ├── home/         # 홈 피드
│   │   └── profile/       # 프로필 페이지
│   ├── api/               # API Routes
│   │   ├── posts/        # 게시물 API
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
│   └── qa-checklist.md  # QA 체크리스트
│
├── vercel.json           # Vercel 배포 설정
├── next.config.ts        # Next.js 설정
└── README.md             # 프로젝트 문서
```

## 개발 가이드

### 디자인 시스템

프로젝트는 Instagram 기반의 일관된 디자인 시스템을 사용합니다. 자세한 내용은 [디자인 시스템 가이드](docs/design-system.md)를 참고하세요.

### 코드 컨벤션

- **파일명**: kebab-case (예: `post-card.tsx`)
- **컴포넌트**: PascalCase
- **함수/변수**: camelCase
- **타입/인터페이스**: PascalCase

### 에러 핸들링

프로젝트는 다음과 같은 에러 핸들링을 제공합니다:

- 네트워크 오류 처리
- 권한 오류 처리
- 빈 데이터 상태 처리
- 사용자 친화적인 에러 메시지

자세한 내용은 `lib/utils/error-handler.ts`를 참고하세요.

### 성능 최적화

- Next.js Image 컴포넌트를 사용한 이미지 최적화
- 자동 코드 스플리팅
- 무한 스크롤을 통한 효율적인 데이터 로딩
- Skeleton UI를 통한 로딩 상태 표시

## 추가 리소스

- [Next.js 15 문서](https://nextjs.org/docs)
- [Clerk 문서](https://clerk.com/docs)
- [Supabase 문서](https://supabase.com/docs)
- [Tailwind CSS v4 문서](https://tailwindcss.com/docs)
- [shadcn/ui 문서](https://ui.shadcn.com/)

## 라이선스

MIT
