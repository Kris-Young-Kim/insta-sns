/**
 * @file docs/design-system.md
 * @description INSIDE 디자인 시스템 가이드
 * 
 * Instagram 기반의 일관된 디자인 시스템 문서입니다.
 */

# INSIDE 디자인 시스템

## 1. 컬러 팔레트

### Instagram 기반 컬러

INSIDE는 Instagram의 컬러 스키마를 기반으로 하며, Tailwind CSS 커스텀 변수로 정의되어 있습니다.

#### Primary Colors
- `--instagram-primary`: `#0077FF` - Instagram blue
- `--instagram-link`: `#0095F6` - Link blue (팔로우 버튼 등)

#### Text Colors
- `--instagram-text`: `#262626` - Primary text (주요 텍스트)
- `--instagram-text-secondary`: `#8E8E8E` - Secondary text (보조 텍스트)

#### Background Colors
- `--instagram-bg`: `#FFFFFF` - Main background (흰색 배경)
- `--instagram-bg-secondary`: `#FAFAFA` - Secondary background (회색 배경)

#### Border Colors
- `--instagram-border`: `#DBDBDB` - Main border (기본 테두리)
- `--instagram-border-light`: `#EFEFEF` - Light border (연한 테두리)

#### Action Colors
- `--instagram-error`: `#ED4956` - Error/Delete red (에러 및 삭제)
- `--instagram-heart`: `#ED4956` - Heart/Like red (좋아요)

### 사용 예시

```tsx
// Tailwind CSS 클래스 사용
<div className="bg-[var(--instagram-bg)] text-[var(--instagram-text)]">
  <button className="bg-[var(--instagram-link)] text-white">
    팔로우
  </button>
</div>

// 인라인 스타일 사용
{% raw %}
<div style={{ color: 'var(--instagram-text)' }}>
  텍스트
</div>
{% endraw %}
```

## 2. 폰트 체계

### 폰트 크기 (Font Sizes)

Instagram 스타일의 폰트 크기 시스템입니다.

| 변수명 | 크기 | rem | px | 용도 |
|--------|------|-----|-----|------|
| `--font-size-xs` | 0.75rem | 0.75rem | 12px | 작은 텍스트, 시간 표시 |
| `--font-size-sm` | 0.875rem | 0.875rem | 14px | 본문 텍스트, 캡션 |
| `--font-size-base` | 1rem | 1rem | 16px | 기본 텍스트 |
| `--font-size-lg` | 1.125rem | 1.125rem | 18px | 제목, 부제목 |
| `--font-size-xl` | 1.25rem | 1.25rem | 20px | 큰 제목 |
| `--font-size-2xl` | 1.5rem | 1.5rem | 24px | 큰 헤딩 |
| `--font-size-3xl` | 2rem | 2rem | 32px | 매우 큰 헤딩 |

### 폰트 굵기 (Font Weights)

| 변수명 | 값 | 용도 |
|--------|-----|------|
| `--font-weight-normal` | 400 | 기본 텍스트 |
| `--font-weight-medium` | 500 | 중간 강조 |
| `--font-weight-semibold` | 600 | 강조 텍스트 |
| `--font-weight-bold` | 700 | 굵은 강조 |

### 행간 (Line Height)

Instagram 스타일의 행간은 다음과 같이 사용합니다:

- **작은 텍스트**: `line-height: 1.2` (xs, sm)
- **본문 텍스트**: `line-height: 1.4` (base)
- **제목 텍스트**: `line-height: 1.5` (lg, xl, 2xl, 3xl)

### 사용 예시

```tsx
// Tailwind CSS 클래스 사용
<p className="text-[var(--font-size-sm)] font-semibold">
  사용자 이름
</p>

<span className="text-[var(--font-size-xs)] text-[var(--instagram-text-secondary)]">
  5분 전
</span>

// 인라인 스타일 사용
{% raw %}
<h1 style={{ 
  fontSize: 'var(--font-size-2xl)', 
  fontWeight: 'var(--font-weight-bold)',
  lineHeight: '1.5'
}}>
  제목
</h1>
{% endraw %}
```

## 3. 간격 시스템 (Spacing Scale)

Instagram 스타일의 간격 시스템입니다.

| 변수명 | 크기 | px | 용도 |
|--------|------|-----|------|
| `--spacing-xs` | 4px | 4px | 매우 작은 간격 |
| `--spacing-sm` | 8px | 8px | 작은 간격 |
| `--spacing-md` | 16px | 16px | 기본 간격 |
| `--spacing-lg` | 24px | 24px | 큰 간격 |
| `--spacing-xl` | 32px | 32px | 매우 큰 간격 |
| `--spacing-2xl` | 48px | 48px | 최대 간격 |

### 사용 예시

```tsx
// Tailwind CSS 클래스 사용
<div className="gap-[var(--spacing-md)]">
  <div>아이템 1</div>
  <div>아이템 2</div>
</div>

// 인라인 스타일 사용
{% raw %}
<div style={{ 
  padding: 'var(--spacing-md)',
  marginBottom: 'var(--spacing-lg)'
}}>
  콘텐츠
</div>
{% endraw %}
```

## 4. Border Radius

| 변수명 | 크기 | 용도 |
|--------|------|------|
| `--radius-sm` | calc(var(--radius) - 4px) | 작은 모서리 |
| `--radius-md` | calc(var(--radius) - 2px) | 중간 모서리 |
| `--radius-lg` | var(--radius) = 0.625rem | 기본 모서리 |
| `--radius-xl` | calc(var(--radius) + 4px) | 큰 모서리 |

### 사용 예시

```tsx
<div className="rounded-lg border border-[var(--instagram-border)]">
  카드
</div>
```

## 5. 컴포넌트 스타일 가이드

### PostCard 컴포넌트

**레이아웃:**
- 배경: `bg-[var(--instagram-bg)]`
- 테두리: `border border-[var(--instagram-border)]`
- 모서리: `rounded-lg`
- 간격: `mb-4` (하단 여백)

**헤더:**
- 패딩: `px-4 py-3`
- 아바타 크기: `w-8 h-8`
- 텍스트: `text-[var(--font-size-sm)] font-semibold`

**이미지:**
- 비율: `aspect-square`
- 배경: `bg-[var(--instagram-bg-secondary)]`

**액션 바:**
- 패딩: `px-4 py-2`
- 아이콘 크기: `24px`
- 아이콘 색상: `text-[var(--instagram-text)]`
- 호버 효과: `hover:opacity-50`

### Button 컴포넌트

**기본 버튼:**
```tsx
<Button className="bg-[var(--instagram-link)] text-white">
  팔로우
</Button>
```

**Outline 버튼:**
```tsx
<Button variant="outline" className="border-[var(--instagram-border)]">
  취소
</Button>
```

### ProfileHeader 컴포넌트

**아바타:**
- 크기: `w-24 h-24` (모바일), `w-32 h-32` (데스크톱)
- 그라디언트: `bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500`

**통계:**
- 텍스트: `text-[var(--font-size-base)] font-semibold`
- 간격: `gap-6`

### PostGrid 컴포넌트

**레이아웃:**
- 그리드: `grid-cols-3`
- 간격: `gap-1` (모바일), `gap-4` (데스크톱)
- 이미지 비율: `aspect-square`

## 6. 애니메이션

### 하트 클릭 애니메이션

```css
@keyframes heartClick {
  0% { transform: scale(1); }
  25% { transform: scale(1.3); }
  50% { transform: scale(0.9); }
  75% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
```

### Shimmer 효과

```css
.shimmer {
  background: linear-gradient(
    90deg,
    var(--instagram-bg-secondary) 0%,
    rgba(255, 255, 255, 0.5) 50%,
    var(--instagram-bg-secondary) 100%
  );
  background-size: 2000px 100%;
  animation: shimmer 2s infinite;
}
```

### 페이지 전환 애니메이션

```css
.page-transition {
  animation: fadeIn 0.3s ease-out;
}
```

## 7. 반응형 디자인

### Breakpoints

- **Mobile**: 320px ~ 768px
- **Tablet**: 768px ~ 1024px
- **Desktop**: 1024px 이상

### 사용 예시

```tsx
// Tailwind 반응형 클래스 사용
<div className="w-full sm:w-1/2 lg:w-1/3">
  콘텐츠
</div>

// 인라인 스타일 (CSS 변수 활용)
{% raw %}
<div style={{
  padding: 'var(--spacing-sm)',
  '@media (min-width: 768px)': {
    padding: 'var(--spacing-md)'
  }
}}>
  콘텐츠
</div>
{% endraw %}
```

## 8. 접근성 가이드라인

- **색상 대비**: WCAG 2.1 AA 준수 (최소 4.5:1)
- **터치 영역**: 최소 44px × 44px
- **포커스 표시**: 명확한 포커스 링 (ring)
- **ARIA 속성**: 적절한 aria-label 사용

## 9. 사용 가이드

### 새로운 컴포넌트 생성 시

1. **컬러**: CSS 변수 사용 (`var(--instagram-*)`)
2. **폰트**: 폰트 크기 변수 사용 (`var(--font-size-*)`)
3. **간격**: 간격 변수 사용 (`var(--spacing-*)`)
4. **일관성**: 기존 컴포넌트와 스타일 통일

### Tailwind CSS 사용 시

```tsx
// ✅ 권장: CSS 변수 사용
<div className="bg-[var(--instagram-bg)] text-[var(--instagram-text)]">
  콘텐츠
</div>

// ❌ 비권장: 하드코딩된 값
<div className="bg-white text-gray-800">
  콘텐츠
</div>
```

## 10. 참고 자료

- [Instagram Design Guidelines](https://about.instagram.com/blog/announcements/instagram-design-system)
- [Tailwind CSS Custom Properties](https://tailwindcss.com/docs/customizing-colors#using-css-variables)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

