import http from 'http'
import path from 'path'
import fs from 'fs'
import dns from 'dns'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { Server as SocketIOServer } from 'socket.io'

import { connectDB, disconnectDB } from './config/db.js'
import authRoutes from './routes/auth.routes.js'
import creatorRoutes from './routes/creator.routes.js'
import projectRoutes from './routes/project.routes.js'
import briefRoutes from './routes/brief.routes.js'
import dashboardRoutes from './routes/dashboard.routes.js'
import aiStudioRoutes from './routes/aiStudio.routes.js'
import { errorHandler } from './middleware/errorHandler.js'

// Set Google DNS so Atlas SRV records resolve on restrictive ISP/corporate DNS
try {
  dns.setServers(['1.1.1.1', '8.8.8.8'])
} catch {
  // Ignore in environments where setting custom DNS servers is restricted
}

// Load environment variables (supports root .env and server/.env)
dotenv.config()
if (fs.existsSync(path.resolve(process.cwd(), 'server', '.env'))) {
  dotenv.config({ path: path.resolve(process.cwd(), 'server', '.env') })
}

const app = express()
const port = process.env.PORT || process.env.API_PORT || 4000
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:3000'

// 1. Core Security & Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false
  })
)

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server, curl, localhost on any port, or configured client origin
      if (
        !origin ||
        origin === clientOrigin ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')
      ) {
        callback(null, true)
      } else {
        callback(new Error('Blocked by CORS policy'))
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
)

app.use(cookieParser())
app.use(express.json({ limit: '10mb' }))

// Ensure /uploads directory exists and serve statically
const uploadsDir = path.resolve(process.cwd(), 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}
app.use('/uploads', express.static(uploadsDir))

// 2. Health check (Public, no auth) - returns uptime & Mongo readyState
app.get(['/health', '/api/health'], (_req, res) => {
  const readyState = mongoose.connection.readyState
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting']
  res.json({
    status: readyState === 1 ? 'ok' : 'degraded',
    service: 'genra-api',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    mongo: {
      readyState,
      status: states[readyState] || 'unknown',
      host: mongoose.connection.host || null,
      name: mongoose.connection.name || null
    }
  })
})

// 3. API Routes
app.use('/api/auth', authRoutes)
app.use('/auth', authRoutes)

app.use('/api/creators', creatorRoutes)
app.use('/creators', creatorRoutes)

// Public: GET /projects and GET /projects/:id
app.use('/api/projects', projectRoutes)
app.use('/projects', projectRoutes)

app.use('/api/briefs', briefRoutes)
app.use('/briefs', briefRoutes)

app.use('/api/dashboard', dashboardRoutes)
app.use('/dashboard', dashboardRoutes)

app.use('/api/ai-studio', aiStudioRoutes)
app.use('/ai-studio', aiStudioRoutes)

// 4. Central Error Handler
app.use(errorHandler)

// 5. Create HTTP & Socket.IO server
const server = http.createServer(app)

const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, callback) => callback(null, true),
    credentials: true
  }
})

app.set('io', io)

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId || socket.handshake.auth?.userId
  if (userId) {
    socket.join(`user:${userId}`)
  }

  socket.on('join', (room) => {
    socket.join(room)
  })

  socket.on('disconnect', () => {
    // clean disconnection
  })
})

// 6. Graceful Shutdown & Process Resiliency
let isShuttingDown = false

async function gracefulShutdown(signal) {
  if (isShuttingDown) return
  isShuttingDown = true
  console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`)

  // Stop accepting new connections
  server.close(async () => {
    console.log('[Server] HTTP server closed.')

    // Close Socket.IO
    try {
      io.close()
      console.log('[Server] Socket.IO closed.')
    } catch (e) {
      console.warn('[Server] Error closing Socket.IO:', e.message)
    }

    // Close MongoDB connection
    try {
      await disconnectDB()
      console.log('[Server] Database connection closed.')
    } catch (e) {
      console.warn('[Server] Error disconnecting DB:', e.message)
    }

    process.exit(0)
  })

  // Force exit if hanging
  setTimeout(() => {
    console.error('[Server] Graceful shutdown timed out. Forcing exit.')
    process.exit(1)
  }, 10000).unref()
}

// Remove previous listeners if reload occurs in dev
process.removeAllListeners('SIGTERM')
process.removeAllListeners('SIGINT')
process.removeAllListeners('uncaughtException')
process.removeAllListeners('unhandledRejection')

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

process.on('uncaughtException', (err) => {
  console.error('[Server] Uncaught Exception:', err)
  // Exit non-zero so process manager (pm2 / tsx) restarts cleanly
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Server] Unhandled Rejection at:', promise, 'reason:', reason)
  // Exit non-zero so process manager restarts cleanly
  process.exit(1)
})

// 7. Start Server (Only after Mongo connects)
export async function startServer() {
  try {
    await connectDB()
    if (!server.listening) {
      await new Promise((resolve, reject) => {
        server.once('error', reject)
        server.listen(port, '0.0.0.0', () => {
          server.removeListener('error', reject)
          console.log(`[Server] Genra API server running on http://localhost:${port}`)
          resolve(server)
        })
      })
    }
    return server
  } catch (err) {
    if (err.code === 'EADDRINUSE') {
      console.log(`[Server] Port ${port} is already listening.`)
      return server
    }
    console.error('[Server] Failed to initialize server:', err.message)
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1)
    }
    throw err
  }
}

// Auto-start if directly executed
const isDirectRun =
  process.argv[1] &&
  (process.argv[1].endsWith('index.js') ||
    process.argv[1].endsWith('index.mjs') ||
    process.argv[1].includes('tsx'))

if (isDirectRun && process.env.NODE_ENV !== 'test') {
  startServer()
}

export { app, server, io }
export default app
