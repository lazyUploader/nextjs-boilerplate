import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">Next.js Boilerplate</h1>
      <p className="text-muted-foreground">Tailwind + shadcn + Clerk + Drizzle</p>
      <div className="flex gap-2">
        <Link href="/sign-in" className={cn(buttonVariants())}>로그인</Link>
        <Link href="/sign-up" className={cn(buttonVariants({ variant: 'outline' }))}>회원가입</Link>
      </div>
    </main>
  )
}
