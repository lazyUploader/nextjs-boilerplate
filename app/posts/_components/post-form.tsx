'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { FormState } from '../actions'

type PostFormProps = {
  action: (state: FormState | void, formData: FormData) => Promise<FormState | void>
  submitLabel: string
  initialValues?: {
    postId?: string
    title?: string
    content?: string
  }
}

const initialState: FormState = {}

export function PostForm({ action, submitLabel, initialValues }: PostFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState)

  return (
    <form action={formAction} className="space-y-6">
      {initialValues?.postId ? (
        <input type="hidden" name="postId" value={initialValues.postId} />
      ) : null}

      {state?.errors?.form?.length ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {state.errors.form[0]}
        </p>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          제목
        </label>
        <Input
          id="title"
          name="title"
          type="text"
          defaultValue={initialValues?.title}
          placeholder="게시글 제목을 입력하세요"
          aria-invalid={Boolean(state?.errors?.title?.length)}
          required
        />
        {state?.errors?.title?.length ? (
          <p className="text-sm text-destructive">{state.errors.title[0]}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="content" className="text-sm font-medium">
          본문
        </label>
        <Textarea
          id="content"
          name="content"
          defaultValue={initialValues?.content}
          placeholder="게시글 내용을 입력하세요"
          aria-invalid={Boolean(state?.errors?.content?.length)}
          required
        />
        {state?.errors?.content?.length ? (
          <p className="text-sm text-destructive">{state.errors.content[0]}</p>
        ) : null}
      </div>

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? '처리 중...' : submitLabel}
      </Button>
    </form>
  )
}
