import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import { creators, briefs } from './seed-data.mjs'

const app = express()
const port = process.env.API_PORT || 4000
app.use(cors())
app.use(express.json())

const error = (res, message, details = {}) => res.status(400).json({ error: message, details })

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'genra-api', mode: process.env.MONGODB_URI ? 'mongo-configured' : 'memory-fallback' }))
app.get('/api/creators', (req, res) => {
  const q = String(req.query.q || '').toLowerCase()
  const skills = String(req.query.skills || '').split(',').filter(Boolean).map((x) => x.toLowerCase())
  const tools = String(req.query.tools || '').split(',').filter(Boolean).map((x) => x.toLowerCase())
  const verifiedOnly = req.query.verifiedOnly === 'true'
  const items = creators.filter((creator) => {
    const text = [creator.name, creator.headline, ...creator.specializations, ...creator.skills, ...creator.tools.map((tool) => tool.name)].join(' ').toLowerCase()
    return (!q || text.includes(q)) && (!skills.length || skills.some((skill) => text.includes(skill))) && (!tools.length || tools.some((tool) => creator.tools.some((item) => item.name.toLowerCase() === tool))) && (!verifiedOnly || creator.verification.score >= 80)
  })
  const facets = { tools: {}, skills: {}, specializations: {} }
  items.forEach((creator) => {
    creator.tools.forEach((tool) => { facets.tools[tool.name] = (facets.tools[tool.name] || 0) + 1 })
    creator.skills.forEach((skill) => { facets.skills[skill] = (facets.skills[skill] || 0) + 1 })
    creator.specializations.forEach((specialization) => { facets.specializations[specialization] = (facets.specializations[specialization] || 0) + 1 })
  })
  res.json({ items, total: items.length, page: Number(req.query.page || 1), facets })
})
app.get('/api/creators/:id', (req, res) => { const creator = creators.find((item) => item._id === req.params.id); return creator ? res.json(creator) : res.status(404).json({ error: 'Creator not found', details: {} }) })
app.post('/api/creators', (req, res) => { if (!req.body?.name || !req.body?.handle) return error(res, 'name and handle are required'); const creator = { _id: `creator-${Date.now()}`, ...req.body, createdAt: new Date().toISOString() }; creators.push(creator); return res.status(201).json(creator) })
app.put('/api/creators/:id', (req, res) => { const index = creators.findIndex((item) => item._id === req.params.id); if (index < 0) return res.status(404).json({ error: 'Creator not found', details: {} }); creators[index] = { ...creators[index], ...req.body }; return res.json(creators[index]) })
app.get('/api/briefs', (_req, res) => res.json({ items: briefs, total: briefs.length, page: 1 }))
app.get('/api/briefs/:id', (req, res) => { const brief = briefs.find((item) => item._id === req.params.id); return brief ? res.json(brief) : res.status(404).json({ error: 'Brief not found', details: {} }) })
app.post('/api/briefs', (req, res) => { if (!req.body?.title || !req.body?.brand?.name) return error(res, 'title and brand.name are required'); const brief = { _id: `brief-${Date.now()}`, status: 'published', createdAt: new Date().toISOString(), ...req.body }; briefs.push(brief); return res.status(201).json(brief) })
app.put('/api/briefs/:id', (req, res) => { const index = briefs.findIndex((item) => item._id === req.params.id); if (index < 0) return res.status(404).json({ error: 'Brief not found', details: {} }); briefs[index] = { ...briefs[index], ...req.body }; return res.json(briefs[index]) })
app.get('/api/briefs/:id/matches', (req, res) => { const brief = briefs.find((item) => item._id === req.params.id); if (!brief) return res.status(404).json({ error: 'Brief not found', details: {} }); const matches = creators.map((creator) => { const toolOverlap = (brief.requiredTools || brief.tools || []).filter((tool) => creator.tools.some((item) => (item.name || item).toLowerCase() === tool.toLowerCase())).length; const formatOverlap = (brief.formats || []).filter((format) => creator.formats.includes(format)).length; const score = Math.min(99, 50 + toolOverlap * 12 + formatOverlap * 7 + Math.round(creator.verification.score / 10)); return { creator, score, breakdown: { toolOverlap: Math.min(35, toolOverlap * 12), skillOverlap: 20, formatCoverage: Math.min(15, formatOverlap * 7), commercialUse: 15, verification: Math.min(10, Math.round(creator.verification.score / 10)) } } }).sort((a, b) => b.score - a.score); return res.json({ items: matches }) })
app.post('/api/briefs/:id/invite', (req, res) => { if (!req.body?.creatorId) return error(res, 'creatorId is required'); return res.status(201).json({ _id: `engagement-${Date.now()}`, brief: req.params.id, creator: req.body.creatorId, status: 'invited', messages: [], createdAt: new Date().toISOString() }) })
app.post('/api/brief-builder', (req, res) => { const roughIdea = String(req.body?.roughIdea || '').trim(); if (!roughIdea) return error(res, 'roughIdea is required'); const lower = roughIdea.toLowerCase(); const contentType = lower.includes('social') ? 'social-loop' : lower.includes('music') ? 'music-video' : lower.includes('product') ? 'video-ad' : 'brand-film'; const style = ['cinematic']; if (lower.includes('surreal')) style.push('surreal'); if (lower.includes('minimal')) style.push('minimal'); const tools = ['Runway']; if (lower.includes('veo')) tools.push('Veo'); if (lower.includes('3d')) tools.push('Blender'); res.json({ title: null, rawIdea: roughIdea, objective: null, campaignDescription: roughIdea, contentType, style, formats: lower.includes('social') ? ['9:16', '1:1'] : ['16:9', '9:16'], requiredTools: tools, requiredSkills: [], budget: { min: null, max: null, currency: 'USD' }, deadline: null, usage: { commercialUse: true, channels: ['web', 'paid-social'], territories: [], durationMonths: null, exclusivity: false, requireProvenance: true } })
})

async function start() {
  if (process.env.MONGODB_URI) {
    try { await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 1500 }); console.log('Genra API connected to MongoDB') } catch { console.log('MongoDB unavailable; using deterministic memory fallback') }
  }
  app.listen(port, '0.0.0.0', () => console.log(`Genra API listening on ${port}`))
}
start()
