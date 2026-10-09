import { test, describe, before } from 'node:test'
import assert from 'node:assert/strict'
import { API_URL, loginDemoUser, ensureServer } from './test-helper.js'

describe('AI Studio Generation Endpoints', () => {
  let token = ''

  before(async () => {
    await ensureServer()
    const auth = await loginDemoUser()
    token = auth.token
  })

  test('POST /ai-studio/generate-image - Queues an image generation job', async () => {
    const res = await fetch(`${API_URL}/ai-studio/generate-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        prompt: 'Futuristic architectural sculpture in soft ambient light',
        aspectRatio: '16:9',
        style: 'Cinematic'
      })
    })

    assert.equal(res.status, 202)
    const data = await res.json()
    assert.ok(data.id || data.jobId)
    assert.equal(data.type, 'image')
    assert.equal(data.status, 'queued')
  })

  test('POST /ai-studio/generate-video - Queues a video generation job', async () => {
    const res = await fetch(`${API_URL}/ai-studio/generate-video`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        prompt: 'Hyper-detailed liquid chrome folding into an orb',
        aspectRatio: '16:9',
        duration: 5
      })
    })

    assert.equal(res.status, 202)
    const data = await res.json()
    assert.ok(data.id || data.jobId)
    assert.equal(data.type, 'video')
  })

  test('POST /ai-studio/generate - Backward compatible synchronous generation', async () => {
    const res = await fetch(`${API_URL}/ai-studio/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        prompt: 'A sleek metallic object dissolving into mist, slow motion',
        model: 'Genra Vision Pro',
        ratio: '16:9'
      })
    })

    assert.equal(res.status, 200)
    const data = await res.json()
    assert.ok(data.id)
    assert.ok(data.outputUrl)
    assert.ok(data.metadata)
    assert.equal(data.metadata.modelEngine, 'Genra Vision Pro')
  })

  test('GET /ai-studio/jobs - Lists past generation jobs', async () => {
    const res = await fetch(`${API_URL}/ai-studio/jobs`, {
      headers: { Authorization: `Bearer ${token}` }
    })

    assert.equal(res.status, 200)
    const jobs = await res.json()
    assert.ok(Array.isArray(jobs))
  })
})
