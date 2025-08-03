# JustForum

![Next.js](https://img.shields.io/badge/Next.js-15.4.5-black)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Convex](https://img.shields.io/badge/Convex-1.25.4-orange)
![Clerk](https://img.shields.io/badge/Clerk-Auth-purple)

한국어 커뮤니티 포럼 플랫폼으로, 실시간 데이터베이스와 현대적인 웹 기술을 사용하여 구축된 포럼 애플리케이션입니다.

## ✨ 주요 기능

### 🔐 사용자 인증
- **Clerk 통합**: 간편한 회원가입/로그인
- **소셜 로그인**: 다양한 소셜 플랫폼 지원
- **자동 사용자 동기화**: Convex 데이터베이스와 실시간 동기화

### 📝 게시글 관리
- **카테고리 분류**: 질문 / 피드백 카테고리
- **리치 텍스트 에디터**: TipTap 기반 WYSIWYG 에디터
- **실시간 조회수**: 게시글 방문 시 자동 조회수 증가
- **좋아요 시스템**: 실시간 좋아요 기능

### 💬 댓글 시스템
- **중첩 댓글**: 무제한 대댓글 지원
- **실시간 업데이트**: 새 댓글 즉시 반영
- **댓글 좋아요**: 개별 댓글에 대한 좋아요 기능
- **댓글 수정/삭제**: 작성자 권한 관리

### 🔍 검색 및 필터링
- **실시간 검색**: 제목, 내용별 검색 지원
- **카테고리 필터**: 질문/피드백 분류별 조회
- **페이지네이션**: 효율적인 데이터 로딩

### 📱 반응형 디자인
- **모바일 최적화**: 모든 디바이스에서 완벽한 사용 경험
- **다크 모드**: 사용자 선호도에 따른 테마 지원
- **접근성**: WCAG 가이드라인 준수

## 🛠 기술 스택

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Component Library**: Radix UI
- **Rich Text Editor**: TipTap
- **Form Management**: React Hook Form + Zod
- **State Management**: Convex 실시간 쿼리

### Backend
- **Database**: Convex (실시간 데이터베이스)
- **Authentication**: Clerk
- **API**: Convex Functions (자동 생성)
- **Real-time**: Convex 실시간 구독

### Development
- **Build Tool**: Turbopack (Next.js 15)
- **Type Safety**: TypeScript + Zod 스키마 검증
- **Code Quality**: ESLint + Prettier
- **Package Manager**: pnpm

## 📁 프로젝트 구조

```
justforum/
├── src/
│   ├── app/                    # Next.js App Router 페이지
│   │   ├── page.tsx           # 메인 포럼 페이지
│   │   ├── create/            # 게시글 작성 페이지
│   │   ├── [pid]/             # 게시글 상세 페이지
│   │   └── layout.tsx         # 루트 레이아웃
│   ├── components/            # React 컴포넌트
│   │   ├── post/              # 게시글 관련 컴포넌트
│   │   ├── comment/           # 댓글 관련 컴포넌트
│   │   └── ui/                # Radix UI 기반 공통 컴포넌트
│   ├── lib/                   # 유틸리티 함수
│   │   ├── subjects.ts        # 카테고리 관리
│   │   ├── time.ts           # 시간 포맷팅
│   │   └── utils.ts          # 공통 유틸리티
│   └── hooks/                 # 커스텀 React 훅
├── convex/                    # Convex 백엔드
│   ├── schema.ts             # 데이터베이스 스키마
│   ├── posts.ts              # 게시글 쿼리/뮤테이션
│   ├── comments.ts           # 댓글 쿼리/뮤테이션
│   ├── likes.ts              # 좋아요 쿼리/뮤테이션
│   └── users.ts              # 사용자 관리
└── public/                    # 정적 파일
```

## 🚀 시작하기

### 필수 요구사항
- Node.js 18.17 이상
- pnpm (권장) 또는 npm

### 설치 및 실행

1. **저장소 클론**
```bash
git clone <repository-url>
cd justforum
```

2. **의존성 설치**
```bash
pnpm install
# 또는
npm install
```

3. **환경 변수 설정**
`.env.local` 파일을 생성하고 다음 값들을 설정합니다:

```env
# Convex
CONVEX_DEPLOYMENT=<your-convex-deployment>
NEXT_PUBLIC_CONVEX_URL=<your-convex-url>

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>
CLERK_SECRET_KEY=<your-clerk-secret-key>
CLERK_WEBHOOK_SECRET=<your-clerk-webhook-secret>

# Clerk URLs (개발환경)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
```

4. **Convex 데이터베이스 설정**
```bash
# Convex CLI 설치 (전역)
npm install -g convex

# Convex 프로젝트 설정
npx convex dev
```

5. **개발 서버 실행**
```bash
pnpm dev
# 또는
npm run dev
```

애플리케이션이 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

## 📊 데이터베이스 스키마

### Users (사용자)
```typescript
{
  clerkId: string,      // Clerk 사용자 ID
  name: string,         // 사용자 이름
}
```

### Subjects (카테고리)
```typescript
{
  name: string,         // 카테고리 이름 ("질문", "피드백")
  description?: string, // 카테고리 설명
}
```

### Posts (게시글)
```typescript
{
  title: string,        // 게시글 제목
  content: string,      // 게시글 내용 (HTML)
  views: number,        // 조회수
  subjectId: Id,        // 카테고리 ID
  type: "notice" | "general", // 게시글 유형
  authorId: Id,         // 작성자 ID
}
```

### Comments (댓글)
```typescript
{
  content: string,      // 댓글 내용
  authorId: Id,         // 작성자 ID
  postId: Id,          // 게시글 ID
  parentId?: Id,       // 부모 댓글 ID (대댓글인 경우)
}
```

### Likes (좋아요)
```typescript
{
  userId: Id,           // 사용자 ID
  postId?: Id,         // 게시글 ID (게시글 좋아요)
  commentId?: Id,      // 댓글 ID (댓글 좋아요)
  type: "post" | "comment", // 좋아요 유형
}
```

## 🔧 개발 명령어

```bash
# 개발 서버 실행 (Turbopack 사용)
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start

# 코드 린팅
pnpm lint

# 타입 체크
npx tsc --noEmit

# Convex 개발 서버
npx convex dev
```

## 🎨 UI 컴포넌트

프로젝트는 **Radix UI**를 기반으로 한 재사용 가능한 컴포넌트 시스템을 사용합니다:

- **Button**: 다양한 variants와 sizes 지원
- **Input/Textarea**: 폼 입력 컴포넌트
- **Card**: 콘텐츠 카드 레이아웃
- **Dialog**: 모달 다이얼로그
- **Dropdown Menu**: 드롭다운 메뉴
- **Tabs**: 탭 네비게이션
- **Pagination**: 페이지네이션
- **Badge**: 상태 표시 배지

## 🔐 인증 플로우

1. **사용자 로그인**: Clerk를 통한 인증
2. **사용자 동기화**: Webhook을 통해 Convex 데이터베이스에 사용자 정보 저장
3. **세션 관리**: Clerk가 JWT 토큰 관리
4. **권한 검증**: Convex 함수에서 사용자 권한 확인

## 🌟 주요 특징

### 실시간 기능
- **실시간 댓글**: 새 댓글이 모든 사용자에게 즉시 표시
- **실시간 좋아요**: 좋아요 수가 실시간으로 업데이트
- **실시간 조회수**: 게시글 조회수 즉시 반영

### 성능 최적화
- **Server Components**: Next.js 15 Server Components 활용
- **Streaming**: 데이터 스트리밍으로 빠른 페이지 로딩
- **이미지 최적화**: Next.js Image 컴포넌트 사용
- **번들 최적화**: Turbopack을 통한 빠른 빌드

### 접근성
- **키보드 네비게이션**: 모든 인터랙티브 요소 키보드 접근 가능
- **스크린 리더**: ARIA 레이블과 semantic HTML 사용
- **색상 대비**: WCAG 가이드라인 준수

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🐛 버그 리포트 및 기능 요청

버그를 발견하거나 새로운 기능을 제안하고 싶다면 [Issues](https://github.com/your-username/justforum/issues) 페이지에서 새로운 이슈를 생성해주세요.

## 📞 연락처

프로젝트에 대한 질문이나 제안사항이 있으시면 언제든지 연락해주세요.

---

**JustForum**은 현대적인 웹 기술을 활용하여 한국어 커뮤니티를 위한 최적의 포럼 경험을 제공합니다. 🚀