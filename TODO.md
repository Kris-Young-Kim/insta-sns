# INSIDE 프로젝트 TODO

## 1. 환경 세팅
- [ ] Next.js 14 + TypeScript + Tailwind CSS 프로젝트 초기화
- [ ] Supabase 프로젝트 생성 및 연결
- [ ] Clerk 인증 연동 (이메일+소셜, 한글화)
- [ ] Tailwind에 인스타그램 기반 컬러·폰트 커스텀

## 2. DB/스토리지 구조 설계 및 구축
- [ ] users, posts, comments, likes, follows 테이블 설계 및 생성
- [ ] Supabase Storage 버킷 구축(이미지 전용)

## 3. 레이아웃 / 반응형
- [ ] Desktop 사이드바, Tablet 아이콘 사이드바, Mobile 헤더+BottomNav 구현
- [ ] Global layout 세팅 및 라우팅 그룹 분리

## 4. 기능별 컴포넌트 개발
- [ ] PostCard (헤더, 이미지, 액션, 컨텐츠)
- [ ] PostFeed (홈피드, 무한스크롤)
- [ ] CreatePostModal (포스트 작성)
- [ ] PostModal (상세, 댓글리스트)
- [ ] CommentList & CommentForm
- [ ] 프로필: ProfileHeader, PostGrid 3열

## 5. API Route 구축
- [ ] /api/posts (GET/POST)
- [ ] /api/likes (POST/DELETE)
- [ ] /api/comments (POST/DELETE)
- [ ] /api/follows (POST/DELETE)
- [ ] /api/users/[userId] (GET)

## 6. 유저 상호작용 및 애니메이션 구현
- [ ] 하트 클릭/더블탭 애니메이션
- [ ] 무한 스크롤 Intersection Observer
- [ ] Skeleton/로딩 UI 구현

## 7. 최종 QA/배포
- [ ] 모바일~데스크탑 반응형 QA
- [ ] 예외/에러 핸들링 보강
- [ ] Vercel 배포 & README 작성

## 8. 2차 확장 아이디어(설계만)
- [ ] 메시지/DM, 트렌드(추천), 공개범위, 위치·스팟 태그 설계
- [ ] 프로필 커스터마이징
