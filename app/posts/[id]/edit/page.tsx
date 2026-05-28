import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PostForm } from '../../_components/post-form'
import { getPostById } from '@/lib/posts'
import { updatePost } from '../../actions'

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [post, session] = await Promise.all([getPostById(id), auth()])

  if (!post) {
    notFound()
  }

  if (!session.userId) {
    notFound()
  }

  const canEdit = session.userId === post.authorId

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <Link href={`/posts/${post.id}`} className="text-sm text-muted-foreground hover:underline">
        ← 상세로
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>게시글 수정</CardTitle>
          <CardDescription>작성자만 수정할 수 있어요.</CardDescription>
        </CardHeader>
        <CardContent>
          {canEdit ? (
            <PostForm
              action={updatePost}
              submitLabel="수정 저장"
              initialValues={{
                postId: post.id,
                title: post.title,
                content: post.content,
              }}
            />
          ) : (
            <div className="space-y-3">
              <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                이 게시글을 수정할 권한이 없습니다.
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
