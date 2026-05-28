import Image from 'next/image'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <Image
        src="/posts-icon.png"
        alt="게시판 테스트 아이콘"
        width={96}
        height={96}
        className="rounded-2xl shadow-lg shadow-black/10"
        priority
      />
      <p className="text-sm font-medium uppercase tracking-[0.24em] text-muted-foreground">
        Next.js Boilerplate
      </p>
      <h1 className="max-w-2xl text-4xl font-bold tracking-tight md:text-6xl">
        게시글과 댓글을 올릴 수 있는 공개 게시판
      </h1>
      <p className="max-w-xl text-sm text-muted-foreground md:text-base">
        누구나 읽을 수 있고, 로그인하면 직접 글과 댓글을 작성할 수 있습니다.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/posts" className={cn(buttonVariants())}>
          게시판 보기
        </Link>
        <Link href="/sign-in" className={cn(buttonVariants({ variant: 'outline' }))}>
          로그인
        </Link>
        <Link href="/sign-up" className={cn(buttonVariants({ variant: 'outline' }))}>
          회원가입
        </Link>
      </div>
    </main>
  )
}
