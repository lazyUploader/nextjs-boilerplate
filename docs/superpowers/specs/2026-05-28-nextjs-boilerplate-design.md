# Next.js Boilerplate Design

**Date:** 2026-05-28  
**Status:** Approved

## Overview

로컬 체험/학습 목적의 Next.js 보일러플레이트. 실전에서 자주 쓰이는 스택을 수동 설치 방식으로 구성해 각 도구의 역할을 직접 확인할 수 있도록 한다.

## Stack

| 도구 | 버전/선택 | 역할 |
|---|---|---|
| Next.js | 15 (App Router) | 프레임워크 |
| Tailwind CSS | v4 | 스타일링 |
| shadcn/ui | latest | UI 컴포넌트 |
| Clerk | latest | 인증 |
| Drizzle ORM | latest | DB ORM |
| Neon | PostgreSQL | 데이터베이스 |

## Project Structure

```
nextjs-boilerplate/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   ├── (dashboard)/
│   │   └── dashboard/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ui/                    # shadcn 컴포넌트
├── db/
│   ├── index.ts               # Drizzle 클라이언트
│   └── schema.ts              # 테이블 스키마
├── middleware.ts              # Clerk 인증 미들웨어
├── drizzle.config.ts
└── .env.local
```

## Pages

| 경로 | 접근 | 내용 |
|---|---|---|
| `/` | 공개 | 랜딩 페이지, "시작하기" 버튼 |
| `/sign-in` | 공개 | Clerk SignIn 컴포넌트 |
| `/sign-up` | 공개 | Clerk SignUp 컴포넌트 |
| `/dashboard` | 보호 | UserButton + 샘플 카드 |

## Authentication (Clerk)

- `app/layout.tsx`에 `<ClerkProvider>` 래핑
- `middleware.ts`에서 `/dashboard/*` 보호 — 미인증 시 `/sign-in`으로 리다이렉트
- 사용 컴포넌트: `<SignIn />`, `<SignUp />`, `<UserButton />`
- 환경변수: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`

## Database (Drizzle + Neon)

**스키마:**
```ts
// db/schema.ts
export const users = pgTable('users', {
  id: text('id').primaryKey(),      // Clerk userId
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})
```

- Clerk `userId`를 PK로 사용해 인증과 DB를 연결
- 비밀번호는 Clerk이 관리하므로 DB에 저장하지 않음
- 마이그레이션: `drizzle-kit generate` → `drizzle-kit migrate`
- 환경변수: `DATABASE_URL` (Neon connection string)

## UI Components (shadcn)

초기 설치 컴포넌트: `Button`, `Card`, `Input`

- `components/ui/`에 소스 파일로 복사되어 자유롭게 수정 가능
- Tailwind 기반으로 동작

## Installation Order

1. `create-next-app` (Tailwind 옵션 포함)
2. `shadcn init` + 기본 컴포넌트 추가
3. Clerk 설치 + 환경변수 설정 + Provider/middleware 추가
4. Drizzle + Neon 설치 + 스키마 작성 + 마이그레이션
5. 페이지 구성 (랜딩, auth, dashboard)
