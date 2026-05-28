import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CommentForm } from '../../../../_components/comment-form'
import { getPostById } from '@/lib/posts'
import { updateComment } from '../../../../actions'

export default async function EditCommentPage({
  params,
}: {
  params: Promise<{ id: string; commentId: string }>
}) {
  const { id, commentId } = await params
  const [post, session] = await Promise.all([getPostById(id), auth()])

  if (!post) {
    notFound()
  }

  const comment = post.comments.find((item) => item.id === commentId)
  if (!comment) {
    notFound()
  }

  const canEdit = session.userId && session.userId === comment.authorId

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <Link href={`/posts/${post.id}`} className="text-sm text-muted-foreground hover:underline">
        ← 상세로
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>댓글 수정</CardTitle>
          <CardDescription>댓글 작성자만 수정할 수 있어요.</CardDescription>
        </CardHeader>
        <CardContent>
          {canEdit ? (
            <CommentForm
              action={updateComment}
              submitLabel="수정 저장"
              postId={post.id}
              commentId={comment.id}
              initialContent={comment.content}
            />
          ) : (
            <div className="space-y-3">
              <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                이 댓글을 수정할 권한이 없습니다.
              </p>
              <Link href={`/posts/${post.id}`} className="text-sm text-muted-foreground hover:underline">
                상세로 돌아가기
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
