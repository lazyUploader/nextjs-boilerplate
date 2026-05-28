import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PostForm } from '../_components/post-form'
import { createPost } from '../actions'

export default async function NewPostPage() {
  const { userId } = await auth()
  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10">
      <Link href="/posts" className="text-sm text-muted-foreground hover:underline">
        ← 목록으로
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>새 게시글</CardTitle>
          <CardDescription>제목과 본문만 입력하면 바로 올릴 수 있어요.</CardDescription>
        </CardHeader>
        <CardContent>
          <PostForm action={createPost} submitLabel="게시글 등록" />
        </CardContent>
      </Card>
    </main>
  )
}
