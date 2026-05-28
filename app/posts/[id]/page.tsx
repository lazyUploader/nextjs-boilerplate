import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { notFound } from 'next/navigation'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { getPostById } from '@/lib/posts'
import { CommentForm } from '../_components/comment-form'
import { CommentList } from '../_components/comment-list'
import { createComment, deletePost } from '../actions'

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [post, session] = await Promise.all([getPostById(id), auth()])
  if (!post) {
    notFound()
  }

  const currentUserId = session.userId
  const canManagePost = currentUserId && currentUserId === post.authorId

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-6 py-10">
      <div className="flex items-center gap-3">
        <Link href="/posts" className="text-sm text-muted-foreground hover:underline">
          ← 목록으로
        </Link>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <CardTitle className="text-3xl">{post.title}</CardTitle>
              <CardDescription>
                {post.authorEmail ?? '알 수 없는 사용자'} ·{' '}
                {post.createdAt ? post.createdAt.toLocaleString('ko-KR') : '방금 전'}
                {post.commentCount ? ` · 댓글 ${post.commentCount}개` : ' · 댓글 0개'}
              </CardDescription>
            </div>

            {canManagePost ? (
              <div className="flex items-center gap-2">
                <Link
                  href={`/posts/${post.id}/edit`}
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                >
                  수정
                </Link>
                <form action={deletePost}>
                  <input type="hidden" name="postId" value={post.id} />
                  <Button type="submit" variant="destructive" size="sm">
                    삭제
                  </Button>
                </form>
              </div>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-base leading-7 text-foreground/90">
            {post.content}
          </p>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">댓글</h2>
        </div>

        {currentUserId ? (
          <CommentForm
            action={createComment}
            submitLabel="댓글 등록"
            postId={post.id}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">댓글을 달려면 로그인이 필요해요</CardTitle>
              <CardDescription>읽기는 공개되어 있고, 작성만 로그인 후 가능합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/sign-in" className={cn(buttonVariants())}>
                로그인하기
              </Link>
            </CardContent>
          </Card>
        )}
      </section>

      <section className="space-y-4">
        <CommentList
          comments={post.comments}
          postId={post.id}
          currentUserId={currentUserId}
        />
      </section>
    </main>
  )
}
