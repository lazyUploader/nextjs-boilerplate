'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { notFound, redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { comments, posts } from '@/db/schema'

export type FormState = {
  errors?: {
    title?: string[]
    content?: string[]
    form?: string[]
  }
}

const TITLE_MAX_LENGTH = 120
const CONTENT_MAX_LENGTH = 5000
const COMMENT_MAX_LENGTH = 1000

function getFieldValue(formData: FormData, name: string) {
  return String(formData.get(name) ?? '').trim()
}

function buildState(errors: FormState['errors']): FormState {
  return { errors }
}

async function requireUserId() {
  const { userId } = await auth()
  if (!userId) {
    redirect('/sign-in')
  }
  return userId
}

function validatePost(title: string, content: string): FormState | null {
  const errors: NonNullable<FormState['errors']> = {}

  if (!title) {
    errors.title = ['제목을 입력해 주세요.']
  } else if (title.length > TITLE_MAX_LENGTH) {
    errors.title = [`제목은 ${TITLE_MAX_LENGTH}자 이하여야 합니다.`]
  }

  if (!content) {
    errors.content = ['본문을 입력해 주세요.']
  } else if (content.length > CONTENT_MAX_LENGTH) {
    errors.content = [`본문은 ${CONTENT_MAX_LENGTH}자 이하여야 합니다.`]
  }

  return Object.keys(errors).length > 0 ? buildState(errors) : null
}

function validateComment(content: string): FormState | null {
  const errors: NonNullable<FormState['errors']> = {}

  if (!content) {
    errors.content = ['댓글을 입력해 주세요.']
  } else if (content.length > COMMENT_MAX_LENGTH) {
    errors.content = [`댓글은 ${COMMENT_MAX_LENGTH}자 이하여야 합니다.`]
  }

  return Object.keys(errors).length > 0 ? buildState(errors) : null
}

export async function createPost(
  _state: FormState | void,
  formData: FormData
): Promise<FormState | void> {
  const userId = await requireUserId()
  const title = getFieldValue(formData, 'title')
  const content = getFieldValue(formData, 'content')

  const validation = validatePost(title, content)
  if (validation) {
    return validation
  }

  await db.insert(posts).values({
    id: crypto.randomUUID(),
    title,
    content,
    authorId: userId,
  })

  revalidatePath('/posts')
  redirect('/posts')
}

export async function updatePost(
  _state: FormState | void,
  formData: FormData
): Promise<FormState | void> {
  const userId = await requireUserId()
  const postId = getFieldValue(formData, 'postId')
  const title = getFieldValue(formData, 'title')
  const content = getFieldValue(formData, 'content')

  if (!postId) {
    return buildState({ form: ['게시글을 찾을 수 없습니다.'] })
  }

  const existing = await db
    .select({
      id: posts.id,
      authorId: posts.authorId,
    })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1)

  const post = existing[0]
  if (!post) {
    notFound()
  }

  if (post.authorId !== userId) {
    return buildState({ form: ['이 게시글을 수정할 권한이 없습니다.'] })
  }

  const validation = validatePost(title, content)
  if (validation) {
    return validation
  }

  await db
    .update(posts)
    .set({
      title,
      content,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, postId))

  revalidatePath('/posts')
  revalidatePath(`/posts/${postId}`)
  redirect(`/posts/${postId}`)
}

export async function deletePost(formData: FormData) {
  const userId = await requireUserId()
  const postId = getFieldValue(formData, 'postId')

  if (!postId) {
    notFound()
  }

  const existing = await db
    .select({
      id: posts.id,
      authorId: posts.authorId,
    })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1)

  const post = existing[0]
  if (!post) {
    notFound()
  }

  if (post.authorId !== userId) {
    return
  }

  await db.delete(posts).where(eq(posts.id, postId))
  revalidatePath('/posts')
  redirect('/posts')
}

export async function createComment(
  _state: FormState | void,
  formData: FormData
): Promise<FormState | void> {
  const userId = await requireUserId()
  const postId = getFieldValue(formData, 'postId')
  const content = getFieldValue(formData, 'content')

  if (!postId) {
    notFound()
  }

  const validation = validateComment(content)
  if (validation) {
    return validation
  }

  const postExists = await db
    .select({
      id: posts.id,
    })
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1)

  if (!postExists[0]) {
    notFound()
  }

  await db.insert(comments).values({
    id: crypto.randomUUID(),
    postId,
    content,
    authorId: userId,
  })

  revalidatePath('/posts')
  revalidatePath(`/posts/${postId}`)
  redirect(`/posts/${postId}`)
}

export async function updateComment(
  _state: FormState | void,
  formData: FormData
): Promise<FormState | void> {
  const userId = await requireUserId()
  const postId = getFieldValue(formData, 'postId')
  const commentId = getFieldValue(formData, 'commentId')
  const content = getFieldValue(formData, 'content')

  if (!postId || !commentId) {
    notFound()
  }

  const existing = await db
    .select({
      id: comments.id,
      authorId: comments.authorId,
    })
    .from(comments)
    .where(eq(comments.id, commentId))
    .limit(1)

  const comment = existing[0]
  if (!comment) {
    notFound()
  }

  if (comment.authorId !== userId) {
    return buildState({ form: ['이 댓글을 수정할 권한이 없습니다.'] })
  }

  const validation = validateComment(content)
  if (validation) {
    return validation
  }

  await db
    .update(comments)
    .set({
      content,
      updatedAt: new Date(),
    })
    .where(eq(comments.id, commentId))

  revalidatePath('/posts')
  revalidatePath(`/posts/${postId}`)
  redirect(`/posts/${postId}`)
}

export async function deleteComment(formData: FormData) {
  const userId = await requireUserId()
  const postId = getFieldValue(formData, 'postId')
  const commentId = getFieldValue(formData, 'commentId')

  if (!postId || !commentId) {
    notFound()
  }

  const existing = await db
    .select({
      id: comments.id,
      authorId: comments.authorId,
    })
    .from(comments)
    .where(eq(comments.id, commentId))
    .limit(1)

  const comment = existing[0]
  if (!comment) {
    notFound()
  }

  if (comment.authorId !== userId) {
    return
  }

  await db.delete(comments).where(eq(comments.id, commentId))
  revalidatePath('/posts')
  revalidatePath(`/posts/${postId}`)
  redirect(`/posts/${postId}`)
}
