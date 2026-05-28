'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { FormState } from '../actions'

type CommentFormProps = {
  action: (state: FormState | void, formData: FormData) => Promise<FormState | void>
  submitLabel: string
  postId: string
  initialContent?: string
  commentId?: string
}

const initialState: FormState = {}

export function CommentForm({
  action,
  submitLabel,
  postId,
  initialContent,
  commentId,
}: CommentFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState)

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="postId" value={postId} />
      {commentId ? (
        <input type="hidden" name="commentId" value={commentId} />
      ) : null}

      {state?.errors?.form?.length ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {state.errors.form[0]}
        </p>
      ) : null}

      <div className="space-y-2">
        <label htmlFor={commentId ? `comment-${commentId}` : 'comment'} className="text-sm font-medium">
          댓글
        </label>
        <Textarea
          id={commentId ? `comment-${commentId}` : 'comment'}
          name="content"
          defaultValue={initialContent}
          placeholder="댓글을 입력하세요"
          aria-invalid={Boolean(state?.errors?.content?.length)}
          required
        />
        {state?.errors?.content?.length ? (
          <p className="text-sm text-destructive">{state.errors.content[0]}</p>
        ) : null}
      </div>

      <Button type="submit" disabled={pending} size="sm">
        {pending ? '저장 중...' : submitLabel}
      </Button>
    </form>
  )
}
