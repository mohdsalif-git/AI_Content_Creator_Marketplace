import { test, describe, before } from 'node:test'
import assert from 'node:assert/strict'
import { API_URL, loginDemoUser, ensureServer } from './test-helper.js'

describe('Creator Endpoints', () => {
  let token = ''

  before(async () => {
    await ensureServer()
    const auth = await loginDemoUser()
    token = auth.token
  })

  test('GET /creators - Rejects unauthenticated request with 401', async () => {
    const res = await fetch(`${API_URL}/creators`)
    assert.equal(res.status, 401)
  })

  test('GET /creators - Returns creator directory when authenticated', async () => {
    const res = await fetch(`${API_URL}/creators`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    assert.equal(res.status, 200)
    const data = await res.json()
    assert.ok(Array.isArray(data.items))
    assert.ok(data.items.length > 0)
    assert.ok(data.total >= data.items.length)
  })

  test('GET /creators?q=Mara - Correctly filters creators by query', async () => {
    const res = await fetch(`${API_URL}/creators?q=Mara`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    assert.equal(res.status, 200)
    const data = await res.json()
    assert.ok(data.items.length >= 1)
    assert.ok(data.items[0].name.includes('Mara'))
  })

  test('GET /creators?specialization=AI+Video+Ads - Filters by specialization', async () => {
    const res = await fetch(`${API_URL}/creators?specialization=AI+Video+Ads`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    assert.equal(res.status, 200)
    const data = await res.json()
    assert.ok(data.items.length >= 1)
    data.items.forEach((c) => {
      assert.equal(c.specialization, 'AI Video Ads')
    })
  })

  test('GET /creators/:id - Returns full creator profile with portfolio & tools', async () => {
    const listRes = await fetch(`${API_URL}/creators`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const listData = await listRes.json()
    const creatorId = listData.items[0].id

    const res = await fetch(`${API_URL}/creators/${creatorId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    assert.equal(res.status, 200)
    const creator = await res.json()
    assert.equal(creator.id, creatorId)
    assert.ok(creator.name)
    assert.ok(Array.isArray(creator.portfolio))
    assert.ok(Array.isArray(creator.tools))
  })
})
