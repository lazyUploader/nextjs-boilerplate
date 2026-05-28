import Link from 'next/link'
import { deleteComment } from '../actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { CommentItem } from '@/lib/posts'

type CommentListProps = {
  comments: CommentItem[]
  postId: string
  currentUserId?: string | null
}

export function CommentList({ comments, postId, currentUserId }: CommentListProps) {
  if (!comments.length) {
    return (
      <p className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
        아직 댓글이 없어요. 첫 댓글을 남겨보세요.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const canManage = currentUserId && currentUserId === comment.authorId

        return (
          <Card key={comment.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-base">
                    {comment.authorEmail ?? '알 수 없는 사용자'}
                  </CardTitle>
                  <CardDescription>
                    {comment.createdAt
                      ? comment.createdAt.toLocaleString('ko-KR')
                      : '방금 전'}
                  </CardDescription>
                </div>
                {canManage ? (
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/posts/${postId}/comments/${comment.id}/edit`}
                      className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                    >
                      수정
                    </Link>
                    <form action={deleteComment}>
                      <input type="hidden" name="postId" value={postId} />
                      <input type="hidden" name="commentId" value={comment.id} />
                      <Button type="submit" variant="ghost" size="sm">
                        삭제
                      </Button>
                    </form>
                  </div>
                ) : null}
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-6">
                {comment.content}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
