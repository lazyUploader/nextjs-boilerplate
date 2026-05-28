import Image from 'next/image'
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { getPosts } from '@/lib/posts'
import { PostCard } from './_components/post-card'

export default async function PostsPage() {
  const { userId } = await auth()
  const posts = await getPosts()

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 py-10">
      <section className="flex flex-col gap-4 rounded-3xl border bg-gradient-to-br from-background to-muted/40 p-6 shadow-sm md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <Image
            src="/posts-icon.png"
            alt="게시판 아이콘"
            width={72}
            height={72}
            className="rounded-2xl shadow-md shadow-black/10"
          />
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Board
          </p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            게시글과 댓글
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
            누구나 읽을 수 있고, 로그인한 사용자는 글과 댓글을 직접 올릴 수 있는 공개 게시판입니다.
          </p>
        </div>

        <div className="flex gap-3">
          {userId ? (
            <Link href="/posts/new" className={cn(buttonVariants())}>
              새 글 쓰기
            </Link>
          ) : (
            <Link href="/sign-in" className={cn(buttonVariants())}>
              로그인하고 글 쓰기
            </Link>
          )}
          <Link href="/" className={cn(buttonVariants({ variant: 'outline' }))}>
            홈
          </Link>
        </div>
      </section>

      {posts.length ? (
        <section className="grid gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </section>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>아직 게시글이 없어요</CardTitle>
            <CardDescription>
              로그인한 상태라면 첫 게시글을 바로 작성할 수 있어요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userId ? (
              <Link href="/posts/new" className={cn(buttonVariants())}>
                첫 글 작성하기
              </Link>
            ) : (
              <Link href="/sign-in" className={cn(buttonVariants())}>
                로그인하기
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </main>
  )
}
