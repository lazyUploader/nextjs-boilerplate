# Posts and Comments Design

**Date:** 2026-05-28  
**Status:** Draft

## Goal

Add a public discussion board to the existing Next.js app so anyone can browse posts and comments, while only authenticated users can create, edit, or delete their own content.

## Scope

### In scope

- Public post list page at `/posts`
- Public post detail page at `/posts/[id]`
- Authenticated post creation at `/posts/new`
- Authenticated post editing at `/posts/[id]/edit`
- Public comment viewing on post detail pages
- Authenticated comment creation on post detail pages
- Authenticated comment edit and delete for comment owners
- Drizzle schema updates for posts and comments
- Server-side authorization checks using Clerk

### Out of scope

- Reply threads or nested comments
- Image uploads or file attachments
- Rich text editor support
- Likes, bookmarks, tags, or search
- Pagination and infinite scroll
- Moderation dashboard

## User Experience

### Public browsing

- Visitors can open `/posts` and see a list of posts sorted by newest first.
- Visitors can open a post detail page and read the post body plus its comments.
- Post list entries show title, author, and creation time.
- Post detail pages show title, body, author, timestamps, and comment count.

### Authenticated writing

- Logged-in users can create a new post from `/posts/new`.
- Logged-in users can edit or delete only their own posts.
- Logged-in users can add a comment on any post detail page.
- Logged-in users can edit or delete only their own comments.

### Empty and error states

- Empty post list shows a simple prompt to create the first post when signed in.
- Empty comment list shows a neutral empty-state message.
- Unauthorized write attempts redirect to sign-in or return a permission error.
- Missing records render a not-found state rather than a broken page.

## Proposed Architecture

### Routing

- Keep the current home page as a simple landing page.
- Add a dedicated board section under `/posts`.
- Use server components for read paths and server actions for mutations.

### Data model

Use three tables:

- `users` already exists and stores the Clerk user id plus email.
- `posts` stores the post body and ownership metadata.
- `comments` stores comment content and ownership metadata.

Suggested fields:

- `posts`
  - `id`
  - `title`
  - `content`
  - `authorId`
  - `createdAt`
  - `updatedAt`
- `comments`
  - `id`
  - `postId`
  - `authorId`
  - `content`
  - `createdAt`
  - `updatedAt`

Relationships:

- `posts.authorId` references `users.id`
- `comments.authorId` references `users.id`
- `comments.postId` references `posts.id` with cascade delete

### Server-side operations

- Use server components to fetch post lists and details.
- Use server actions for create, update, and delete flows.
- Validate ownership on every mutation by comparing the Clerk user id to the stored `authorId`.
- Prefer redirect-after-submit patterns so the UI stays simple and predictable.

## Permission Rules

- Read access is public.
- Create, edit, and delete actions require authentication.
- A user may only edit or delete records where `authorId` matches the current Clerk `userId`.
- Post deletion removes related comments through cascade behavior.
- Comment deletion is a hard delete for simplicity.

## Validation Rules

- Post title is required and trimmed.
- Post content is required and trimmed.
- Comment content is required and trimmed.
- Title and content should reject empty strings after trimming.
- Inputs should be constrained to reasonable lengths to avoid accidental abuse.

## Error Handling

- If a post or comment is not found, show a not-found page.
- If an authenticated user is not the owner, reject the mutation with a permission error.
- If validation fails, re-render the form with field-level feedback.
- If the database operation fails, show a generic error state and avoid exposing internals.

## Implementation Notes

- Reuse the existing `ClerkProvider`, `auth`, and Drizzle setup.
- Keep the current app structure intact and add board-related files alongside it.
- Prefer small, focused server action modules rather than one large action file.
- Keep form components reusable where post and comment edit screens share the same inputs.

## Testing Strategy

- Add schema tests for the new tables and relations.
- Add server-side tests for ownership checks and validation behavior.
- Add integration coverage for:
  - public post browsing
  - authenticated post creation
  - authenticated comment creation
  - unauthorized edit/delete rejection

## Rollout Plan

1. Add database schema and generate a migration.
2. Implement post list and post detail pages.
3. Implement post create/edit/delete flows.
4. Implement comment create/edit/delete flows.
5. Add tests and verify the main user journeys end to end.

