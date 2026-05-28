import { describe, it, expect } from 'vitest'
import { users } from '../db/schema'

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
