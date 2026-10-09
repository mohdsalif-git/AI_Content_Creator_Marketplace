import dns from 'dns'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

// Reliable DNS for Atlas SRV resolution
try { dns.setServers(['8.8.8.8', '1.1.1.1']) } catch {}

// Load env
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ── Dynamic imports (works from api/ or from root) ──────────────────────────
// Resolve paths relative to project root regardless of where Vercel invokes us
const root = path.resolve(__dirname, '..')

async function resolveServerModule(rel) {
  const abs = path.join(root, 'server', rel)
  return import(abs)
}

let dbConnected = false

async function ensureDB() {
  if (mongoose.connection.readyState === 1) return
  if (dbConnected) return
  dbConnected = true

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/genra'
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 20000,
      socketTimeoutMS: 45000,
      family: 4
    })
    console.log('[DB] Connected:', mongoose.connection.host)
  } catch (err) {
    console.error('[DB] Connection failed:', err.message)
  }
}

// Build Express app once and cache it
let _app = null

async function buildApp() {
  if (_app) return _app

  await ensureDB()

  const { default: authRoutes }      = await resolveServerModule('routes/auth.routes.js')
  const { default: creatorRoutes }   = await resolveServerModule('routes/creator.routes.js')
  const { default: projectRoutes }   = await resolveServerModule('routes/project.routes.js')
  const { default: briefRoutes }     = await resolveServerModule('routes/brief.routes.js')
  const { default: dashboardRoutes } = await resolveServerModule('routes/dashboard.routes.js')
  const { default: aiStudioRoutes }  = await resolveServerModule('routes/aiStudio.routes.js')
  const { errorHandler }             = await resolveServerModule('middleware/errorHandler.js')

  const clientOrigin = process.env.CLIENT_ORIGIN || 'https://ai-content-creator-marketplace.vercel.app'

  const app = express()

  app.set('trust proxy', 1)

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: false }))

  app.use(cors({
    origin: (origin, cb) => {
      const allowed = [
        clientOrigin,
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'https://ai-content-creator-marketplace.vercel.app'
      ]
      if (!origin || allowed.some(o => origin.startsWith(o))) return cb(null, true)
      cb(null, true) // Allow all for now – tighten after first deploy if needed
    },
    credentials: true,
    methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','X-Requested-With']
  }))

  app.use(cookieParser())
  app.use(express.json({ limit: '10mb' }))

  // Health
  app.get(['/health', '/api/health'], (_req, res) => {
    const s = mongoose.connection.readyState
    res.json({ status: s === 1 ? 'ok' : 'degraded', service: 'genra-api', uptime: Math.floor(process.uptime()), mongo: { readyState: s } })
  })

  // Routes (mounted at /api/* for Vercel routing)
  app.use('/api/auth',       authRoutes)
  app.use('/api/creators',   creatorRoutes)
  app.use('/api/projects',   projectRoutes)
  app.use('/api/briefs',     briefRoutes)
  app.use('/api/dashboard',  dashboardRoutes)
  app.use('/api/ai-studio',  aiStudioRoutes)

  // Also mount without prefix for backwards-compat
  app.use('/auth',       authRoutes)
  app.use('/creators',   creatorRoutes)
  app.use('/projects',   projectRoutes)
  app.use('/briefs',     briefRoutes)
  app.use('/dashboard',  dashboardRoutes)
  app.use('/ai-studio',  aiStudioRoutes)

  app.use(errorHandler)

  _app = app
  return app
}

// Vercel serverless entry-point
export default async function handler(req, res) {
  const app = await buildApp()
  return app(req, res)
}
