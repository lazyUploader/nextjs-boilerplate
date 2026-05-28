import { desc, eq, asc } from 'drizzle-orm'
import { db } from '@/db'
import { comments, posts, users } from '@/db/schema'

export type PostListItem = {
  id: string
  title: string
  content: string
  authorId: string
  authorEmail: string | null
  createdAt: Date | null
  updatedAt: Date | null
}

export type CommentItem = {
  id: string
  postId: string
  content: string
  authorId: string
  authorEmail: string | null
  createdAt: Date | null
  updatedAt: Date | null
}

export type PostDetail = PostListItem & {
  comments: CommentItem[]
  commentCount: number
}

export async function getPosts(): Promise<PostListItem[]> {
  return db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      authorId: posts.authorId,
      authorEmail: users.email,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .orderBy(desc(posts.createdAt))
}

export async function getPostById(id: string): Promise<PostDetail | null> {
  const postRows = await db
    .select({
      id: posts.id,
      title: posts.title,
      content: posts.content,
      authorId: posts.authorId,
      authorEmail: users.email,
      createdAt: posts.createdAt,
      updatedAt: posts.updatedAt,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(eq(posts.id, id))
    .limit(1)

  const post = postRows[0]
  if (!post) {
    return null
  }

  const commentRows = await db
    .select({
      id: comments.id,
      postId: comments.postId,
      content: comments.content,
      authorId: comments.authorId,
      authorEmail: users.email,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
    })
    .from(comments)
    .leftJoin(users, eq(comments.authorId, users.id))
    .where(eq(comments.postId, id))
    .orderBy(asc(comments.createdAt))

  return {
    ...post,
    comments: commentRows,
    commentCount: commentRows.length,
  }
}

export async function getCommentById(
  commentId: string
): Promise<CommentItem | null> {
  const rows = await db
    .select({
      id: comments.id,
      postId: comments.postId,
      content: comments.content,
      authorId: comments.authorId,
      authorEmail: users.email,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
    })
    .from(comments)
    .leftJoin(users, eq(comments.authorId, users.id))
    .where(eq(comments.id, commentId))
    .limit(1)

  return rows[0] ?? null
}
