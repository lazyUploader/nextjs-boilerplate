'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export default function PostsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  const looksLikeDbPermissionIssue =
    error.message.toLowerCase().includes('permission denied') ||
    error.message.toLowerCase().includes('failed query')

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-16">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>게시판을 불러오지 못했어요</CardTitle>
          <CardDescription>
            현재 연결된 데이터베이스에 게시글 테이블이 아직 준비되지 않았거나, 스키마 권한이 부족한 상태예요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {looksLikeDbPermissionIssue ? (
            <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-foreground">
              <p className="font-medium">DB 설정이 필요해 보여요.</p>
              <p>
                현재 계정은 `public` 스키마에 테이블을 만들 권한이 없어서, Drizzle 마이그레이션이 적용되지 않았습니다.
              </p>
              <p>
                Neon에서 테이블 생성 권한이 있는 데이터베이스 URL로 바꾼 뒤 `npx drizzle-kit push` 또는
                `npx drizzle-kit migrate`를 다시 실행해 주세요.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              {error.message}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button onClick={reset} className={cn(buttonVariants())}>
              다시 시도
            </button>
            <Link href="/" className={cn(buttonVariants({ variant: 'outline' }))}>
              홈으로
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
