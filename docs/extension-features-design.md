# INSIDE 2차 확장 기능 설계 문서

## 개요

이 문서는 INSIDE 프로젝트의 2차 확장 기능에 대한 설계 문서입니다. MVP 이후 추가될 수 있는 기능들을 설계 단계에서 정의합니다.

---

## 1. 게시글 공개범위 기능 (Post Visibility)

### 목적
사용자가 게시물의 공개 범위를 선택할 수 있도록 하여 프라이버시를 보장하고 원하는 대상에게만 콘텐츠를 공유할 수 있게 합니다.

### 기능 요구사항

#### 공개 범위 옵션
1. **전체 공개 (Public)**
   - 모든 사용자가 볼 수 있음
   - 기본값

2. **친구만 (Friends Only)**
   - 상호 팔로우 관계인 사용자만 볼 수 있음
   - 팔로워만 있는 경우 볼 수 없음

3. **나만 보기 (Private)**
   - 작성자만 볼 수 있음
   - 프로필에서도 표시되지 않음

### 데이터베이스 설계

#### posts 테이블 수정
```sql
ALTER TABLE posts ADD COLUMN visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'friends', 'private'));
CREATE INDEX idx_posts_visibility ON posts(visibility);
```

#### 데이터 타입
- `visibility`: `'public' | 'friends' | 'private'`

### UI/UX 설계

#### 게시물 작성 시
- CreatePostModal에 공개 범위 선택 드롭다운 추가
- 기본값: "전체 공개"
- 옵션: "전체 공개", "친구만", "나만 보기"

#### 게시물 표시
- 공개 범위에 따라 필터링된 게시물만 홈 피드에 표시
- 프로필 페이지에서도 공개 범위에 따라 필터링

### API 설계

#### POST `/api/posts`
```typescript
{
  image_url: string;
  caption?: string;
  visibility?: 'public' | 'friends' | 'private'; // 기본값: 'public'
}
```

#### GET `/api/posts`
- `visibility` 필터링 로직 추가
- 현재 사용자와의 관계에 따라 게시물 필터링

### 구현 우선순위
- **High**: MVP 이후 첫 번째 추가 기능
- **예상 개발 시간**: 2-3일

---

## 2. 트렌드 큐레이션 (Trends & Discovery)

### 목적
사용자에게 인기 있는 콘텐츠를 추천하고, 트렌딩 키워드와 추천 게시물을 제공하여 사용자 참여를 높입니다.

### 기능 요구사항

#### 실시간 인기 게시물
- 좋아요 수와 댓글 수를 기반으로 인기 점수 계산
- 최근 24시간 내 게시물만 대상
- 시간 가중치 적용 (최근 게시물에 가중치 부여)

#### 키워드 추천
- 캡션에서 자주 사용되는 키워드 추출
- 해시태그 기반 트렌드 분석
- 실시간 트렌딩 키워드 표시

#### 추천 피드
- 사용자가 팔로우하지 않은 인기 사용자 게시물 추천
- 좋아요 패턴 기반 개인화 추천

### 데이터베이스 설계

#### trends 테이블 (신규)
```sql
CREATE TABLE trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL,
  post_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_trends_keyword ON trends(keyword);
CREATE INDEX idx_trends_updated_at ON trends(updated_at DESC);
```

#### post_trends 테이블 (신규)
```sql
CREATE TABLE post_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  trend_id UUID NOT NULL REFERENCES trends(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, trend_id)
);
```

### UI/UX 설계

#### 트렌드 섹션
- 사이드바 또는 별도 페이지에 트렌딩 키워드 표시
- 키워드 클릭 시 해당 키워드 게시물 필터링

#### 추천 피드
- 홈 피드 하단에 "추천 게시물" 섹션
- "팔로우하지 않은 사용자" 라벨 표시

### API 설계

#### GET `/api/trends`
```typescript
{
  trends: Array<{
    keyword: string;
    post_count: number;
    like_count: number;
  }>;
  limit?: number; // 기본값: 10
}
```

#### GET `/api/posts/trending`
```typescript
{
  posts: Post[];
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
}
```

### 구현 우선순위
- **Medium**: 사용자 참여도 향상에 중요
- **예상 개발 시간**: 3-5일

---

## 3. 스팟 태그 기능 (Spot Tags)

### 목적
위치 기반 태그와 모임 태그를 통해 사용자들이 장소와 모임을 공유하고 발견할 수 있게 합니다.

### 기능 요구사항

#### 위치 태그
- 게시물에 위치 정보 추가
- 지도 API 연동 (Google Maps, Naver Maps 등)
- 위치 검색 기능

#### 모임 태그
- 모임/이벤트 태그 생성 및 공유
- 모임 일정, 참여자 관리
- 모임별 게시물 그룹화

### 데이터베이스 설계

#### spots 테이블 (신규)
```sql
CREATE TABLE spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('location', 'event', 'meetup')),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address TEXT,
  description TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_spots_type ON spots(type);
CREATE INDEX idx_spots_location ON spots(latitude, longitude);
```

#### post_spots 테이블 (신규)
```sql
CREATE TABLE post_spots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  spot_id UUID NOT NULL REFERENCES spots(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, spot_id)
);

CREATE INDEX idx_post_spots_post_id ON post_spots(post_id);
CREATE INDEX idx_post_spots_spot_id ON post_spots(spot_id);
```

### UI/UX 설계

#### 게시물 작성 시
- 위치 추가 버튼
- 위치 검색 모달
- 지도에서 위치 선택

#### 스팟 페이지
- 스팟 상세 페이지 (`/spot/[spotId]`)
- 해당 스팟에서 촬영된 게시물 그리드
- 스팟 정보 (주소, 설명 등)

### API 설계

#### POST `/api/spots`
```typescript
{
  name: string;
  type: 'location' | 'event' | 'meetup';
  latitude?: number;
  longitude?: number;
  address?: string;
  description?: string;
}
```

#### GET `/api/spots/[spotId]`
- 스팟 정보 및 관련 게시물 조회

#### GET `/api/spots/nearby`
```typescript
{
  latitude: number;
  longitude: number;
  radius?: number; // km, 기본값: 5
}
```

### 구현 우선순위
- **Low**: 추가적인 기능이지만 차별화 포인트
- **예상 개발 시간**: 5-7일

---

## 4. DM(메시지) 기능

### 목적
사용자 간 1:1 메시지 기능을 제공하여 소통을 강화합니다.

### 기능 요구사항

#### 메시지 전송
- 텍스트 메시지
- 이미지 첨부
- 읽음 확인 (읽음/안읽음)

#### 메시지 목록
- 대화 목록 (최신 메시지 순)
- 읽지 않은 메시지 개수 표시
- 메시지 검색 기능

### 데이터베이스 설계

#### conversations 테이블 (신규)
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id != user2_id)
);

CREATE INDEX idx_conversations_user1 ON conversations(user1_id);
CREATE INDEX idx_conversations_user2 ON conversations(user2_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);
```

#### messages 테이블 (신규)
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_unread ON messages(is_read, created_at DESC);
```

### UI/UX 설계

#### 메시지 페이지
- `/messages` - 대화 목록
- `/messages/[conversationId]` - 개별 대화

#### 메시지 입력
- 텍스트 입력 필드
- 이미지 첨부 버튼
- 전송 버튼

### API 설계

#### POST `/api/messages`
```typescript
{
  recipient_id: string;
  content: string;
  image_url?: string;
}
```

#### GET `/api/messages`
- 현재 사용자의 모든 대화 목록 조회

#### GET `/api/messages/[conversationId]`
- 특정 대화의 메시지 목록 조회

#### PUT `/api/messages/[messageId]/read`
- 메시지 읽음 처리

### 실시간 기능
- Supabase Realtime을 활용한 실시간 메시지 전송
- WebSocket 기반 실시간 업데이트

### 구현 우선순위
- **Medium**: 사용자 참여도 향상에 중요
- **예상 개발 시간**: 4-6일

---

## 5. 알림 시스템

### 목적
사용자에게 중요한 활동(좋아요, 댓글, 팔로우 등)에 대한 알림을 제공합니다.

### 기능 요구사항

#### 알림 유형
1. **좋아요 알림**
   - 게시물에 좋아요가 달릴 때

2. **댓글 알림**
   - 게시물에 댓글이 달릴 때
   - 댓글에 답글이 달릴 때

3. **팔로우 알림**
   - 새 팔로워가 생길 때

4. **언급 알림**
   - 댓글이나 캡션에서 @멘션될 때

### 데이터베이스 설계

#### notifications 테이블 (신규)
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'mention')),
  actor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_id UUID, -- 게시물 ID 또는 댓글 ID
  target_type TEXT CHECK (target_type IN ('post', 'comment')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read, created_at DESC);
```

### UI/UX 설계

#### 알림 아이콘
- 헤더에 알림 아이콘 (벨 모양)
- 읽지 않은 알림 개수 배지 표시

#### 알림 페이지
- `/notifications` - 모든 알림 목록
- 알림 유형별 필터링
- 읽음/안읽음 상태 표시

### API 설계

#### GET `/api/notifications`
```typescript
{
  notifications: Notification[];
  unread_count: number;
  pagination: {
    page: number;
    limit: number;
    hasMore: boolean;
  };
}
```

#### PUT `/api/notifications/[notificationId]/read`
- 알림 읽음 처리

#### PUT `/api/notifications/read-all`
- 모든 알림 읽음 처리

### 실시간 알림
- Supabase Realtime을 활용한 실시간 알림 전송
- 브라우저 알림 API 활용 (선택사항)

### 구현 우선순위
- **High**: 사용자 참여도 향상에 매우 중요
- **예상 개발 시간**: 3-4일

---

## 6. 해시태그 및 검색 기능

### 목적
해시태그를 통한 콘텐츠 발견과 검색 기능을 제공하여 사용자가 원하는 콘텐츠를 쉽게 찾을 수 있게 합니다.

### 기능 요구사항

#### 해시태그
- 캡션에서 자동으로 해시태그 추출 (#으로 시작하는 단어)
- 해시태그 클릭 시 해당 태그 게시물 목록 표시
- 인기 해시태그 추천

#### 검색 기능
- 게시물 검색 (캡션 기반)
- 사용자 검색
- 해시태그 검색
- 통합 검색 결과

### 데이터베이스 설계

#### hashtags 테이블 (신규)
```sql
CREATE TABLE hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  post_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_hashtags_name ON hashtags(name);
CREATE INDEX idx_hashtags_post_count ON hashtags(post_count DESC);
```

#### post_hashtags 테이블 (신규)
```sql
CREATE TABLE post_hashtags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  hashtag_id UUID NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, hashtag_id)
);

CREATE INDEX idx_post_hashtags_post ON post_hashtags(post_id);
CREATE INDEX idx_post_hashtags_tag ON post_hashtags(hashtag_id);
```

### UI/UX 설계

#### 검색 페이지
- `/search` - 통합 검색 페이지
- 검색 입력 필드
- 검색 결과 탭 (게시물, 사용자, 해시태그)

#### 해시태그 페이지
- `/hashtag/[tagName]` - 특정 해시태그 게시물 목록
- 해시태그 정보 (게시물 수, 인기 여부)

### API 설계

#### GET `/api/search`
```typescript
{
  query: string;
  type?: 'all' | 'posts' | 'users' | 'hashtags';
  page?: number;
  limit?: number;
}

// 응답
{
  posts: Post[];
  users: User[];
  hashtags: Hashtag[];
  pagination: {...};
}
```

#### GET `/api/hashtags/[tagName]`
- 특정 해시태그의 게시물 목록

#### GET `/api/hashtags/trending`
- 인기 해시태그 목록

### 검색 최적화
- PostgreSQL Full-Text Search 활용
- 해시태그 자동 추출 및 저장 로직

### 구현 우선순위
- **High**: 콘텐츠 발견 기능에 중요
- **예상 개발 시간**: 4-5일

---

## 7. 프로필 커스터마이징

### 목적
사용자가 자신의 프로필을 더 자유롭게 커스터마이징할 수 있도록 하여 개성을 표현할 수 있게 합니다.

### 기능 요구사항

#### 프로필 정보 확장
- **바이오 (Bio)**: 짧은 자기소개
- **링크 (Link)**: 외부 링크 (웹사이트, SNS 등)
- **프로필 이미지**: 아바타 이미지 업로드
- **배경 이미지**: 프로필 배경 이미지

#### 테마 설정
- 다크 모드/라이트 모드 선택
- 프로필 색상 테마 커스터마이징 (선택사항)

### 데이터베이스 설계

#### users 테이블 수정
```sql
ALTER TABLE users ADD COLUMN bio TEXT;
ALTER TABLE users ADD COLUMN website_url TEXT;
ALTER TABLE users ADD COLUMN avatar_url TEXT;
ALTER TABLE users ADD COLUMN cover_image_url TEXT;
ALTER TABLE users ADD COLUMN theme_preference TEXT DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark'));
```

### UI/UX 설계

#### 프로필 편집 페이지
- `/profile/edit` - 프로필 편집 페이지
- 바이오 입력 필드
- 링크 입력 필드
- 프로필 이미지 업로드
- 배경 이미지 업로드
- 테마 설정 토글

#### 프로필 표시
- 프로필 헤더에 바이오 및 링크 표시
- 프로필 이미지 및 배경 이미지 표시

### API 설계

#### PUT `/api/users/[userId]`
```typescript
{
  name?: string;
  bio?: string;
  website_url?: string;
  avatar_url?: string;
  cover_image_url?: string;
  theme_preference?: 'light' | 'dark';
}
```

#### POST `/api/users/[userId]/avatar`
- 프로필 이미지 업로드

#### POST `/api/users/[userId]/cover`
- 배경 이미지 업로드

### 구현 우선순위
- **Medium**: 사용자 경험 향상에 중요
- **예상 개발 시간**: 2-3일

---

## 구현 우선순위 요약

### Phase 1 (즉시 구현 권장)
1. **알림 시스템** - 사용자 참여도 향상에 매우 중요
2. **해시태그 및 검색** - 콘텐츠 발견 기능에 중요
3. **게시글 공개범위** - 프라이버시 보장

### Phase 2 (중기 구현)
4. **트렌드 큐레이션** - 사용자 참여도 향상
5. **DM(메시지)** - 사용자 간 소통 강화
6. **프로필 커스터마이징** - 사용자 경험 향상

### Phase 3 (장기 구현)
7. **스팟 태그** - 차별화 포인트, 복잡도 높음

---

## 기술적 고려사항

### 성능 최적화
- 인덱스 최적화
- 캐싱 전략 (Redis 등)
- 데이터베이스 쿼리 최적화

### 확장성
- 마이크로서비스 아키텍처 고려
- 실시간 기능을 위한 WebSocket 서버 분리 고려
- 이미지 최적화 및 CDN 활용

### 보안
- RLS 정책 활성화 (프로덕션)
- 입력 검증 및 XSS 방지
- Rate Limiting 적용

---

## 참고 자료

- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [PostgreSQL Full-Text Search](https://www.postgresql.org/docs/current/textsearch.html)
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)

