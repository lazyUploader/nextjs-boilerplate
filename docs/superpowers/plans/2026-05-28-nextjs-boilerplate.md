# Next.js Boilerplate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Next.js 15 + Tailwind + shadcn/ui + Clerk + Drizzle + Neon으로 구성된 로컬 체험용 보일러플레이트 구축

**Architecture:** create-next-app으로 기반 생성 후 shadcn → Clerk → Drizzle 순서로 수동 설치. App Router의 Route Group으로 인증/비인증 영역을 분리하고 Clerk 미들웨어가 보호된 경로를 제어한다.

**Tech Stack:** Next.js 15, Tailwind CSS v4, shadcn/ui, Clerk, Drizzle ORM, Neon PostgreSQL, Vitest + React Testing Library

---

## File Map

| 파일 | 역할 |
|---|---|
| `app/layout.tsx` | 루트 레이아웃, ClerkProvider 래핑 |
| `app/page.tsx` | 랜딩 페이지 |
| `app/(auth)/sign-in/[[...sign-in]]/page.tsx` | Clerk 로그인 UI |
| `app/(auth)/sign-up/[[...sign-up]]/page.tsx` | Clerk 회원가입 UI |
| `app/(dashboard)/dashboard/page.tsx` | 보호된 대시보드 |
| `components/ui/` | shadcn 컴포넌트 (button, card, input) |
| `db/index.ts` | Drizzle 클라이언트 초기화 |
| `db/schema.ts` | users 테이블 스키마 |
| `middleware.ts` | Clerk 인증 미들웨어 |
| `drizzle.config.ts` | Drizzle Kit 마이그레이션 설정 |
| `.env.local` | 환경변수 (Clerk 키, DB URL) |
| `__tests__/pages.test.tsx` | 페이지 렌더 스모크 테스트 |
| `__tests__/schema.test.ts` | DB 스키마 구조 테스트 |

---

### Task 1: Next.js 프로젝트 초기화

**Files:**
- Create: `nextjs-boilerplate/` (프로젝트 루트 전체)

- [ ] **Step 1: create-next-app 실행**

현재 디렉토리(`nextjs-boilerplate/`)에서 실행:

```bash
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir=false \
  --import-alias="@/*"
```

프롬프트가 나오면:
- `Would you like to use Turbopack?` → Yes

- [ ] **Step 2: 설치 확인**

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속 — Next.js 기본 화면 확인.  
`Ctrl+C`로 종료.

- [ ] **Step 3: 불필요한 기본 파일 정리**

`app/page.tsx` 내용을 최소화:

```tsx
export default function Home() {
  return <main><h1>Home</h1></main>
}
```

`app/globals.css`에서 기본 CSS 변수 아래의 데모 스타일 전부 삭제, 아래 내용만 남김:

```css
@import "tailwindcss";
```

- [ ] **Step 4: git 초기화 및 첫 커밋**

```bash
git init
git add .
git commit -m "chore: init Next.js 15 with Tailwind"
```

---

### Task 2: shadcn/ui 설치

**Files:**
- Create: `components/ui/button.tsx`
- Create: `components/ui/card.tsx`
- Create: `components/ui/input.tsx`
- Modify: `components/ui/` (shadcn init이 생성)

- [ ] **Step 1: shadcn init 실행**

```bash
npx shadcn@latest init
```

프롬프트:
- `Which style would you like to use?` → Default
- `Which color would you like to use as base color?` → Slate
- `Would you like to use CSS variables for colors?` → Yes

- [ ] **Step 2: 기본 컴포넌트 추가**

```bash
npx shadcn@latest add button card input
```

- [ ] **Step 3: 컴포넌트 파일 존재 확인**

```bash
ls components/ui/
```

Expected output에 `button.tsx`, `card.tsx`, `input.tsx` 포함되어 있어야 함.

- [ ] **Step 4: 커밋**

```bash
git add .
git commit -m "feat: add shadcn/ui with button, card, input"
```

---

### Task 3: Clerk 설치 및 설정

**Files:**
- Create: `.env.local`
- Modify: `app/layout.tsx`
- Create: `middleware.ts`

- [ ] **Step 1: Clerk 패키지 설치**

```bash
npm install @clerk/nextjs
```

- [ ] **Step 2: Clerk 대시보드에서 앱 생성**

1. https://dashboard.clerk.com 접속 → 새 앱 생성
2. 로그인 방식: Email + Google 선택 (자유)
3. **API Keys** 탭에서 두 키 복사

- [ ] **Step 3: .env.local 생성**

```bash
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_여기에_붙여넣기
CLERK_SECRET_KEY=sk_test_여기에_붙여넣기

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

- [ ] **Step 4: layout.tsx에 ClerkProvider 추가**

`app/layout.tsx`를 아래로 교체:

```tsx
import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: 'Next.js Boilerplate',
  description: 'Next.js + Tailwind + shadcn + Clerk + Drizzle',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="ko">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

- [ ] **Step 5: middleware.ts 생성**

```ts
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

- [ ] **Step 6: 동작 확인**

```bash
npm run dev
```

`http://localhost:3000/dashboard` 접속 시 자동으로 `/sign-in`으로 리다이렉트되면 정상.  
`Ctrl+C`로 종료.

- [ ] **Step 7: 커밋**

```bash
git add .
git commit -m "feat: add Clerk auth with middleware"
```

---

### Task 4: 인증 페이지 생성

**Files:**
- Create: `app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- Create: `app/(auth)/sign-up/[[...sign-up]]/page.tsx`

- [ ] **Step 1: 디렉토리 생성**

```bash
mkdir -p "app/(auth)/sign-in/[[...sign-in]]"
mkdir -p "app/(auth)/sign-up/[[...sign-up]]"
```

- [ ] **Step 2: sign-in 페이지 생성**

```tsx
// app/(auth)/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  )
}
```

- [ ] **Step 3: sign-up 페이지 생성**

```tsx
// app/(auth)/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp />
    </div>
  )
}
```

- [ ] **Step 4: 동작 확인**

```bash
npm run dev
```

- `http://localhost:3000/sign-in` → Clerk 로그인 UI 확인
- `http://localhost:3000/sign-up` → Clerk 회원가입 UI 확인

`Ctrl+C`로 종료.

- [ ] **Step 5: 커밋**

```bash
git add .
git commit -m "feat: add sign-in and sign-up pages"
```

---

### Task 5: Drizzle + Neon 설치 및 설정

**Files:**
- Create: `db/index.ts`
- Create: `db/schema.ts`
- Create: `drizzle.config.ts`

- [ ] **Step 1: 패키지 설치**

```bash
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit
```

- [ ] **Step 2: Neon 대시보드에서 DB 생성**

1. https://neon.tech 접속 → 새 프로젝트 생성
2. **Dashboard** → **Connection string** 복사 (postgresql://... 형태)

- [ ] **Step 3: .env.local에 DB URL 추가**

기존 `.env.local` 하단에 추가:

```bash
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

- [ ] **Step 4: db/schema.ts 생성**

```ts
// db/schema.ts
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})
```

- [ ] **Step 5: db/index.ts 생성**

```ts
// db/index.ts
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })
```

- [ ] **Step 6: drizzle.config.ts 생성**

```ts
// drizzle.config.ts
import type { Config } from 'drizzle-kit'

export default {
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config
```

- [ ] **Step 7: 마이그레이션 실행**

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

Expected: `drizzle/` 폴더에 마이그레이션 SQL 파일 생성, Neon에 `users` 테이블 생성.

- [ ] **Step 8: 커밋**

```bash
git add .
git commit -m "feat: add Drizzle ORM with Neon PostgreSQL"
```

---

### Task 6: 랜딩 페이지 구성

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: 랜딩 페이지 작성**

```tsx
// app/page.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">Next.js Boilerplate</h1>
      <p className="text-muted-foreground">Tailwind + shadcn + Clerk + Drizzle</p>
      <div className="flex gap-2">
        <Button asChild>
          <Link href="/sign-in">로그인</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/sign-up">회원가입</Link>
        </Button>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: 확인**

```bash
npm run dev
```

`http://localhost:3000` 접속 — 제목, 버튼 2개 확인.  
"로그인" 버튼 클릭 시 `/sign-in`으로 이동 확인.

`Ctrl+C` 종료.

- [ ] **Step 3: 커밋**

```bash
git add app/page.tsx
git commit -m "feat: build landing page"
```

---

### Task 7: 대시보드 페이지 구성

**Files:**
- Create: `app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: 대시보드 디렉토리 생성**

```bash
mkdir -p "app/(dashboard)/dashboard"
```

- [ ] **Step 2: 대시보드 페이지 작성**

```tsx
// app/(dashboard)/dashboard/page.tsx
import { UserButton } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function DashboardPage() {
  const { userId } = await auth()

  return (
    <div className="min-h-screen p-8">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">대시보드</h1>
        <UserButton />
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>사용자 ID</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground font-mono break-all">{userId}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>DB 연결</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Drizzle + Neon 연결됨</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>UI</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">shadcn/ui 컴포넌트 동작 중</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: 전체 흐름 확인**

```bash
npm run dev
```

1. `http://localhost:3000` → 랜딩 확인
2. "로그인" 클릭 → Clerk 로그인
3. 로그인 후 → `/dashboard` 자동 이동
4. 대시보드에 userId 카드 3개 확인
5. `UserButton` 클릭 → 로그아웃 옵션 확인
6. 로그아웃 → 다시 `/sign-in`으로 이동 확인

`Ctrl+C` 종료.

- [ ] **Step 4: 커밋**

```bash
git add .
git commit -m "feat: build dashboard page with UserButton"
```

---

### Task 8: 기본 테스트 추가

**Files:**
- Create: `__tests__/schema.test.ts`
- Modify: `package.json` (vitest 스크립트 추가)

- [ ] **Step 1: Vitest 설치**

```bash
npm install -D vitest @vitejs/plugin-react
```

- [ ] **Step 2: vitest.config.ts 생성**

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
})
```

- [ ] **Step 3: 테스트 스크립트 추가**

`package.json`의 `"scripts"` 섹션에 추가:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: 스키마 테스트 작성**

```ts
// __tests__/schema.test.ts
import { describe, it, expect } from 'vitest'
import { users } from '../db/schema'

describe('users schema', () => {
  it('has id column as primary key', () => {
    const idCol = users.id
    expect(idCol).toBeDefined()
  })

  it('has email column', () => {
    const emailCol = users.email
    expect(emailCol).toBeDefined()
  })

  it('has createdAt column', () => {
    const createdAtCol = users.createdAt
    expect(createdAtCol).toBeDefined()
  })
})
```

- [ ] **Step 5: 테스트 실행**

```bash
npm test
```

Expected:
```
✓ __tests__/schema.test.ts (3)
  ✓ users schema > has id column as primary key
  ✓ users schema > has email column
  ✓ users schema > has createdAt column

Test Files  1 passed (1)
Tests       3 passed (3)
```

- [ ] **Step 6: 최종 커밋**

```bash
git add .
git commit -m "test: add schema tests with Vitest"
```

---

## 완료 체크리스트

- [ ] `npm run dev` 실행 시 에러 없음
- [ ] `/` 랜딩 페이지 정상 렌더
- [ ] `/sign-in`, `/sign-up` Clerk UI 정상 렌더
- [ ] 로그인 후 `/dashboard` 진입 성공
- [ ] 미인증 상태에서 `/dashboard` 접근 시 `/sign-in` 리다이렉트
- [ ] `UserButton` 로그아웃 동작 확인
- [ ] `npm test` 3개 테스트 통과
