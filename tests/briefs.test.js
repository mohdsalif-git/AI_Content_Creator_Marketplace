import { test, describe, before } from 'node:test'
import assert from 'node:assert/strict'
import { API_URL, loginDemoUser, ensureServer } from './test-helper.js'

describe('Briefs & 100-Point Match Engine', () => {
  let token = ''

  before(async () => {
    await ensureServer()
    const auth = await loginDemoUser()
    token = auth.token
  })

  test('POST /briefs - Creates structured campaign brief', async () => {
    const res = await fetch(`${API_URL}/briefs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Aurora Spatial Audio Visuals',
        contentType: 'AI Video Ads',
        style: ['Cinematic', 'Minimal'],
        aspectRatio: ['16:9', '9:16'],
        platform: 'YouTube & TikTok',
        budget: '$10,000 – $15,000',
        deadline: 'Nov 30, 2026',
        description: 'Immersive sound-reactive visuals for next-gen headphone launch.'
      })
    })

    assert.equal(res.status, 201)
    const data = await res.json()
    assert.ok(data.id)
    assert.equal(data.title, 'Aurora Spatial Audio Visuals')
    assert.equal(data.type, 'AI Video Ads')
  })

  test('POST /briefs/:id/match - 100-point matching engine scores and ranks creators', async () => {
    // 1. Create a brief to test
    const createRes = await fetch(`${API_URL}/briefs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Lumina Brand Film',
        contentType: 'AI Video Ads',
        style: ['Cinematic'],
        aspectRatio: ['16:9'],
        budget: '$5,000 – $8,000',
        deadline: 'Dec 1, 2026',
        description: 'Test matching engine.'
      })
    })
    const brief = await createRes.json()

    // 2. Run match engine
    const matchRes = await fetch(`${API_URL}/briefs/${brief.id}/match`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    })

    assert.equal(matchRes.status, 200)
    const matchData = await matchRes.json()
    assert.ok(Array.isArray(matchData.matches))
    assert.ok(matchData.matches.length > 0)

    // Check top match structure
    const top = matchData.matches[0]
    assert.ok(top.score >= 0 && top.score <= 100, 'Score should be between 0 and 100')
    assert.ok(top.breakdown.specialization !== undefined)
    assert.ok(top.breakdown.tools !== undefined)
    assert.ok(top.breakdown.rights !== undefined)
    assert.ok(top.breakdown.aspectRatio !== undefined)
    assert.ok(top.flags !== undefined)
  })

  test('POST /briefs/:id/send - Successfully sends brief to creator and creates submission', async () => {
    // Get brief
    const briefsRes = await fetch(`${API_URL}/briefs`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const briefsData = await briefsRes.json()
    const brief = briefsData.items[0]

    // Get a creator
    const creatorsRes = await fetch(`${API_URL}/creators`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const creatorsData = await creatorsRes.json()
    const creator = creatorsData.items[0]

    const sendRes = await fetch(`${API_URL}/briefs/${brief.id}/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        creatorId: creator.id,
        notes: 'We want to invite you to collaborate on this brief.'
      })
    })

    assert.equal(sendRes.status, 201)
    const sendData = await sendRes.json()
    assert.ok(sendData.submission)
    assert.equal(sendData.submission.status, 'sent')
  })
})
