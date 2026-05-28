import { describe, it, expect, vi } from 'vitest'

vi.mock('@/db', () => ({
  db: {
    insert: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

import {
  createPost,
  updatePost,
  deletePost,
  createComment,
  updateComment,
  deleteComment,
} from '../app/posts/actions'

describe('post actions', () => {
  it('exports CRUD handlers', () => {
    expect(createPost).toBeTypeOf('function')
    expect(updatePost).toBeTypeOf('function')
    expect(deletePost).toBeTypeOf('function')
    expect(createComment).toBeTypeOf('function')
    expect(updateComment).toBeTypeOf('function')
    expect(deleteComment).toBeTypeOf('function')
  })
})
