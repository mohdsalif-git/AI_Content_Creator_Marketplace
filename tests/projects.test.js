import { test, describe, before } from 'node:test'
import assert from 'node:assert/strict'
import { API_URL, ensureServer } from './test-helper.js'

describe('Public Projects Endpoints', () => {
  before(async () => {
    await ensureServer()
  })

  test('GET /projects - Public access without token returns projects', async () => {
    const res = await fetch(`${API_URL}/projects`)
    assert.equal(res.status, 200)

    const data = await res.json()
    assert.ok(Array.isArray(data.items))
    assert.ok(data.items.length > 0)
    assert.ok(data.items[0].title)
  })

  test('GET /projects/:id - Retrieves project details by ID without auth', async () => {
    const listRes = await fetch(`${API_URL}/projects`)
    const listData = await listRes.json()
    const projectId = listData.items[0].id

    const res = await fetch(`${API_URL}/projects/${projectId}`)
    assert.equal(res.status, 200)

    const data = await res.json()
    assert.equal(data.id, projectId)
    assert.ok(data.title)
  })
})
