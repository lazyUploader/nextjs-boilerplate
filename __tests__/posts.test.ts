import { describe, it, expect, vi } from 'vitest'

vi.mock('@/db', () => ({
  db: {
    select: vi.fn(),
  },
}))

import { getPosts, getPostById, getCommentById } from '../lib/posts'

describe('post queries', () => {
  it('exports list, detail, and comment loaders', () => {
    expect(getPosts).toBeTypeOf('function')
    expect(getPostById).toBeTypeOf('function')
    expect(getCommentById).toBeTypeOf('function')
  })
})
