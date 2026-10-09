import { test, describe, before } from 'node:test'
import assert from 'node:assert/strict'
import { API_URL, ensureServer } from './test-helper.js'

describe('Auth Endpoints', () => {
  before(async () => {
    await ensureServer()
  })

  test('POST /auth/register - Successfully register new creator account', async () => {
    const email = `test_reg_${Date.now()}@example.com`
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alex Rivera',
        email,
        password: 'Password123!',
        role: 'creator'
      })
    })

    assert.equal(res.status, 201)
    const data = await res.json()
    assert.equal(data.user.email, email)
    assert.equal(data.user.role, 'creator')
    assert.ok(data.accessToken, 'Access token should be returned')
  })

  test('POST /auth/register - Rejects duplicate email', async () => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate Test',
        email: 'demo@genra.ai',
        password: 'Password123!',
        role: 'brand'
      })
    })

    assert.equal(res.status, 409)
    const data = await res.json()
    assert.ok(data.error.includes('already exists'))
  })

  test('POST /auth/login - Successfully login with demo credentials', async () => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@genra.ai',
        password: 'Genra123'
      })
    })

    assert.equal(res.status, 200)
    const data = await res.json()
    assert.ok(data.accessToken)
    assert.equal(data.user.email, 'demo@genra.ai')
  })

  test('POST /auth/login - Rejects invalid password', async () => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@genra.ai',
        password: 'WrongPassword999'
      })
    })

    assert.equal(res.status, 401)
    const data = await res.json()
    assert.ok(data.error)
  })

  test('POST /auth/forgot-password - Dispatches reset token', async () => {
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@genra.ai'
      })
    })

    assert.equal(res.status, 200)
    const data = await res.json()
    assert.ok(data.message.includes('password reset instructions'))
  })
})
