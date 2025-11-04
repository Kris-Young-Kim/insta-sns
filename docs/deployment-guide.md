# 배포 가이드

## Vercel 배포 설정

### 1. Vercel 프로젝트 생성

1. [Vercel Dashboard](https://vercel.com/dashboard)에 접속
2. **"Add New Project"** 클릭
3. GitHub 저장소 연결
4. 프로젝트 설정:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `pnpm build` (자동 감지)
   - **Install Command**: `pnpm install` (자동 감지)
   - **Output Directory**: `.next` (기본값)

### 2. 환경 변수 설정

Vercel Dashboard → **Settings** → **Environment Variables**에서 다음 변수들을 추가:

#### 필수 환경 변수

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Storage
NEXT_PUBLIC_STORAGE_BUCKET=uploads
```

#### 환경별 설정

각 환경(Production, Preview, Development)에 동일한 변수를 설정하거나, 환경별로 다른 값을 사용할 수 있습니다.

### 3. Clerk 웹훅 설정 (프로덕션)

1. Clerk Dashboard → **Webhooks** 메뉴
2. **"Add Endpoint"** 클릭
3. Endpoint URL 입력:
   ```
   https://your-vercel-domain.vercel.app/api/webhooks/clerk
   ```
4. 이벤트 선택 (필요한 경우)
5. **"Create"** 클릭

### 4. Supabase 프로덕션 설정

#### RLS 정책 활성화

프로덕션 환경에서는 RLS를 활성화해야 합니다:

```sql
-- 각 테이블에 RLS 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
```

#### RLS 정책 생성 예시

```sql
-- posts 테이블 예시
CREATE POLICY "Users can view all posts"
  ON posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (SELECT id FROM users WHERE clerk_id = auth.jwt()->>'sub')
  );
```

### 5. 배포

1. Vercel Dashboard에서 **"Deploy"** 버튼 클릭
2. 배포 완료 대기 (~2-3분)
3. 배포된 도메인 확인 (예: `your-project.vercel.app`)

### 6. 배포 후 확인 사항

- [ ] 홈페이지가 정상적으로 로드됨
- [ ] 로그인이 정상 작동함
- [ ] 게시물 작성이 정상 작동함
- [ ] 이미지 업로드가 정상 작동함
- [ ] 좋아요/댓글 기능이 정상 작동함
- [ ] 프로필 페이지가 정상 표시됨

## 환경 변수 보안

### ⚠️ 중요 사항

1. **`SUPABASE_SERVICE_ROLE_KEY`는 절대 공개하지 마세요!**
   - 이 키는 모든 RLS를 우회하는 관리자 권한입니다
   - 서버 사이드에서만 사용해야 합니다

2. **환경 변수는 Git에 커밋하지 마세요**
   - `.env` 파일은 `.gitignore`에 포함되어 있습니다
   - Vercel Dashboard에서만 관리하세요

3. **프로덕션과 개발 환경 분리**
   - 프로덕션용 Supabase 프로젝트와 개발용 프로젝트를 분리하는 것을 권장합니다

## 성능 최적화

### 이미지 최적화

Next.js Image 컴포넌트가 자동으로 최적화를 수행합니다:
- WebP/AVIF 포맷 자동 변환
- 반응형 이미지 크기 조정
- Lazy loading

### 코드 스플리팅

Next.js가 자동으로 코드 스플리팅을 수행합니다:
- 페이지별 코드 분리
- 동적 import 지원

## 모니터링

### Vercel Analytics

Vercel Dashboard에서 Analytics를 활성화하여 성능을 모니터링할 수 있습니다.

### 에러 로깅

프로덕션 환경에서는 다음과 같은 에러 로깅 서비스를 고려하세요:
- Sentry
- LogRocket
- Vercel Logs

## 트러블슈팅

### 빌드 에러

```bash
# 로컬에서 빌드 테스트
pnpm build

# 에러 확인
pnpm build 2>&1 | tee build.log
```

### 환경 변수 확인

Vercel Dashboard → Settings → Environment Variables에서 모든 변수가 올바르게 설정되었는지 확인하세요.

### 데이터베이스 연결 확인

Supabase Dashboard → Settings → Database에서 연결 정보를 확인하세요.

