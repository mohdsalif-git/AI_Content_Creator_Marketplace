import { test, describe, before } from 'node:test'
import assert from 'node:assert/strict'
import { API_URL, loginDemoUser, ensureServer } from './test-helper.js'

describe('Dashboard Endpoints', () => {
  let token = ''

  before(async () => {
    await ensureServer()
    const auth = await loginDemoUser()
    token = auth.token
  })

  test('GET /dashboard/projects - Returns the 4 project lifecycle sections', async () => {
    const res = await fetch(`${API_URL}/dashboard/projects`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    assert.equal(res.status, 200)
    const data = await res.json()
    assert.ok(Array.isArray(data.activeBriefs), 'activeBriefs should be array')
    assert.ok(Array.isArray(data.applications), 'applications should be array')
    assert.ok(Array.isArray(data.inProgress), 'inProgress should be array')
    assert.ok(Array.isArray(data.completed), 'completed should be array')
  })
})
