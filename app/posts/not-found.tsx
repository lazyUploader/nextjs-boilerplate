import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl items-center px-6 py-16">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>게시글을 찾을 수 없어요</CardTitle>
          <CardDescription>
            요청한 게시글이나 댓글이 삭제되었거나 주소가 잘못되었을 수 있어요.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Link href="/posts" className={cn(buttonVariants())}>
            목록으로
          </Link>
          <Link href="/" className={cn(buttonVariants({ variant: 'outline' }))}>
            홈으로
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
