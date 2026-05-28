import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">Next.js Boilerplate</h1>
      <p className="text-muted-foreground">Tailwind + shadcn + Clerk + Drizzle</p>
      <div className="flex gap-2">
        <Button render={<Link href="/sign-in" />}>로그인</Button>
        <Button variant="outline" render={<Link href="/sign-up" />}>회원가입</Button>
      </div>
    </main>
  )
}
