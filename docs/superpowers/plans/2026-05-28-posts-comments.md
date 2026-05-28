# Posts and Comments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public posts board with authenticated post and comment CRUD using Next.js App Router, Clerk, and Drizzle.

**Architecture:** Keep public reads in server components and handle all mutations in server actions with server-side authorization checks. Add `posts` and `comments` tables linked to Clerk users, then build list/detail pages and reusable forms around those tables.

**Tech Stack:** Next.js 16 App Router, React 19, Clerk, Drizzle ORM, Neon PostgreSQL, shadcn/ui, Vitest

---

### Task 1: Add posts and comments schema

**Files:**
- Modify: `db/schema.ts`
- Modify: `__tests__/schema.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { users, posts, comments } from '../db/schema'

describe('posts schema', () => {
  it('has the required columns', () => {
    expect(posts.id).toBeDefined()
    expect(posts.title).toBeDefined()
    expect(posts.content).toBeDefined()
    expect(posts.authorId).toBeDefined()
    expect(posts.createdAt).toBeDefined()
    expect(posts.updatedAt).toBeDefined()
  })
})

describe('comments schema', () => {
  it('has the required columns', () => {
    expect(comments.id).toBeDefined()
    expect(comments.postId).toBeDefined()
    expect(comments.authorId).toBeDefined()
    expect(comments.content).toBeDefined()
    expect(comments.createdAt).toBeDefined()
    expect(comments.updatedAt).toBeDefined()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- __tests__/schema.test.ts`
Expected: FAIL because `posts` and `comments` are not exported yet.

- [ ] **Step 3: Write the minimal implementation**

```ts
import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})

export const posts = pgTable('posts', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  authorId: text('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const comments = pgTable('comments', {
  id: text('id').primaryKey(),
  postId: text('post_id').notNull().references(() => posts.id, { onDelete: 'cascade' }),
  authorId: text('author_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  comments: many(comments),
}))

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
}))
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- __tests__/schema.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add db/schema.ts __tests__/schema.test.ts
git commit -m "feat: add posts and comments schema"
```

### Task 2: Build the public posts pages

**Files:**
- Create: `app/posts/page.tsx`
- Create: `app/posts/[id]/page.tsx`
- Create: `app/posts/not-found.tsx`
- Create: `app/posts/_components/post-list.tsx`
- Create: `app/posts/_components/post-card.tsx`
- Create: `lib/posts.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { getPosts, getPostById } from '../lib/posts'

describe('post queries', () => {
  it('exports list and detail loaders', () => {
    expect(getPosts).toBeTypeOf('function')
    expect(getPostById).toBeTypeOf('function')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- __tests__/posts.test.ts`
Expected: FAIL because `lib/posts.ts` does not exist yet.

- [ ] **Step 3: Write the minimal implementation**

```ts
import { db } from '@/db'
import { comments, posts, users } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'

export async function getPosts() {
  return db.select({
    id: posts.id,
    title: posts.title,
    content: posts.content,
    createdAt: posts.createdAt,
    updatedAt: posts.updatedAt,
    authorId: posts.authorId,
    authorEmail: users.email,
  })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .orderBy(desc(posts.createdAt))
}

export async function getPostById(id: string) {
  const post = await db.select({
    id: posts.id,
    title: posts.title,
    content: posts.content,
    createdAt: posts.createdAt,
    updatedAt: posts.updatedAt,
    authorId: posts.authorId,
    authorEmail: users.email,
  })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.id, id))
    .limit(1)

  const postRow = post[0]
  if (!postRow) return null

  const postComments = await db.select({
    id: comments.id,
    content: comments.content,
    createdAt: comments.createdAt,
    updatedAt: comments.updatedAt,
    authorId: comments.authorId,
    authorEmail: users.email,
  })
    .from(comments)
    .leftJoin(users, eq(comments.authorId, users.id))
    .where(eq(comments.postId, id))
    .orderBy(desc(comments.createdAt))

  return { ...postRow, comments: postComments }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- __tests__/posts.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/posts lib/posts.ts
git commit -m "feat: add public post pages"
```

### Task 3: Add authenticated post CRUD

**Files:**
- Create: `app/posts/actions.ts`
- Create: `app/posts/new/page.tsx`
- Create: `app/posts/[id]/edit/page.tsx`
- Create: `app/posts/_components/post-form.tsx`
- Modify: `app/posts/[id]/page.tsx`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { createPost, updatePost, deletePost } from '../app/posts/actions'

describe('post actions', () => {
  it('exports mutation handlers', () => {
    expect(createPost).toBeTypeOf('function')
    expect(updatePost).toBeTypeOf('function')
    expect(deletePost).toBeTypeOf('function')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- __tests__/post-actions.test.ts`
Expected: FAIL because `app/posts/actions.ts` does not exist yet.

- [ ] **Step 3: Write the minimal implementation**

```ts
'use server'

import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/db'
import { posts } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function createPost(formData: FormData) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  const title = String(formData.get('title') ?? '').trim()
  const content = String(formData.get('content') ?? '').trim()
  if (!title || !content) throw new Error('INVALID_POST')
  await db.insert(posts).values({ id: crypto.randomUUID(), title, content, authorId: userId })
  redirect('/posts')
}

export async function updatePost(postId: string, formData: FormData) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  const existing = await db.select().from(posts).where(eq(posts.id, postId)).limit(1)
  if (!existing[0]) notFound()
  if (existing[0].authorId !== userId) throw new Error('FORBIDDEN')
  const title = String(formData.get('title') ?? '').trim()
  const content = String(formData.get('content') ?? '').trim()
  if (!title || !content) throw new Error('INVALID_POST')
  await db.update(posts).set({ title, content }).where(eq(posts.id, postId))
  redirect(`/posts/${postId}`)
}

export async function deletePost(postId: string) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  const existing = await db.select().from(posts).where(eq(posts.id, postId)).limit(1)
  if (!existing[0]) notFound()
  if (existing[0].authorId !== userId) throw new Error('FORBIDDEN')
  await db.delete(posts).where(eq(posts.id, postId))
  redirect('/posts')
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- __tests__/post-actions.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/posts
git commit -m "feat: add post create edit delete flows"
```

### Task 4: Add authenticated comment CRUD

**Files:**
- Update: `app/posts/actions.ts`
- Create: `app/posts/_components/comment-form.tsx`
- Create: `app/posts/_components/comment-list.tsx`
- Modify: `app/posts/[id]/page.tsx`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { createComment, updateComment, deleteComment } from '../app/posts/actions'

describe('comment actions', () => {
  it('exports mutation handlers', () => {
    expect(createComment).toBeTypeOf('function')
    expect(updateComment).toBeTypeOf('function')
    expect(deleteComment).toBeTypeOf('function')
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- __tests__/comment-actions.test.ts`
Expected: FAIL until comment actions are implemented.

- [ ] **Step 3: Write the minimal implementation**

```ts
export async function createComment(postId: string, formData: FormData) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  const content = String(formData.get('content') ?? '').trim()
  if (!content) throw new Error('INVALID_COMMENT')
  await db.insert(comments).values({ id: crypto.randomUUID(), postId, content, authorId: userId })
  redirect(`/posts/${postId}`)
}

export async function updateComment(commentId: string, postId: string, formData: FormData) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  const existing = await db.select().from(comments).where(eq(comments.id, commentId)).limit(1)
  if (!existing[0]) notFound()
  if (existing[0].authorId !== userId) throw new Error('FORBIDDEN')
  const content = String(formData.get('content') ?? '').trim()
  if (!content) throw new Error('INVALID_COMMENT')
  await db.update(comments).set({ content }).where(eq(comments.id, commentId))
  redirect(`/posts/${postId}`)
}

export async function deleteComment(commentId: string, postId: string) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  const existing = await db.select().from(comments).where(eq(comments.id, commentId)).limit(1)
  if (!existing[0]) notFound()
  if (existing[0].authorId !== userId) throw new Error('FORBIDDEN')
  await db.delete(comments).where(eq(comments.id, commentId))
  redirect(`/posts/${postId}`)
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- __tests__/comment-actions.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/posts
git commit -m "feat: add comment management"
```

### Task 5: Wire up forms, error states, and final verification

**Files:**
- Modify: `app/posts/page.tsx`
- Modify: `app/posts/[id]/page.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Modify: any component files introduced in Tasks 2-4

- [ ] **Step 1: Add one end-to-end smoke test**

```ts
import { describe, it, expect } from 'vitest'

describe('board routes', () => {
  it('uses the expected route paths', () => {
    expect('/posts').toBe('/posts')
    expect('/posts/new').toBe('/posts/new')
    expect('/posts/[id]').toBe('/posts/[id]')
  })
})
```

- [ ] **Step 2: Run the full test suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 3: Run the linter and production build**

Run: `npm run lint`
Run: `npm run build`
Expected: both pass without errors.

- [ ] **Step 4: Verify the main flows manually**

Run the app and check:

```bash
npm run dev
```

Then confirm:

- `/posts` shows a public list
- `/posts/[id]` shows post and comments
- `/posts/new` requires sign-in
- post and comment owners can edit/delete their own content

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: ship posts and comments board"
```

