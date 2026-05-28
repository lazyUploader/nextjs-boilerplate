import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PostListItem } from '@/lib/posts'

type PostCardProps = {
  post: PostListItem
}

export function PostCard({ post }: PostCardProps) {
  return (
    <Card className="transition-colors hover:bg-muted/40">
      <CardHeader>
        <CardTitle className="text-xl">
          <Link href={`/posts/${post.id}`} className="hover:underline">
            {post.title}
          </Link>
        </CardTitle>
        <CardDescription>
          {post.authorEmail ?? '알 수 없는 사용자'} ·{' '}
          {post.createdAt ? post.createdAt.toLocaleString('ko-KR') : '방금 전'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground">
          {post.content}
        </p>
        <Link
          href={`/posts/${post.id}`}
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
        >
          자세히 보기
        </Link>
      </CardContent>
    </Card>
  )
}
