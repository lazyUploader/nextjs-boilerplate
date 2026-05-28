import { describe, it, expect } from 'vitest'
import { users, posts, comments } from '../db/schema'

describe('users schema', () => {
  it('has id column as primary key', () => {
    const idCol = users.id
    expect(idCol).toBeDefined()
  })

  it('has email column', () => {
    const emailCol = users.email
    expect(emailCol).toBeDefined()
  })

  it('has createdAt column', () => {
    const createdAtCol = users.createdAt
    expect(createdAtCol).toBeDefined()
  })
})

describe('posts schema', () => {
  it('has required columns', () => {
    expect(posts.id).toBeDefined()
    expect(posts.title).toBeDefined()
    expect(posts.content).toBeDefined()
    expect(posts.authorId).toBeDefined()
    expect(posts.createdAt).toBeDefined()
    expect(posts.updatedAt).toBeDefined()
  })
})

describe('comments schema', () => {
  it('has required columns', () => {
    expect(comments.id).toBeDefined()
    expect(comments.postId).toBeDefined()
    expect(comments.authorId).toBeDefined()
    expect(comments.content).toBeDefined()
    expect(comments.createdAt).toBeDefined()
    expect(comments.updatedAt).toBeDefined()
  })
})
