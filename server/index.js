import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import authRoutes from './routes/auth.routes.js'
import creatorRoutes from './routes/creator.routes.js'
import projectRoutes from './routes/project.routes.js'
import briefRoutes from './routes/brief.routes.js'
import dashboardRoutes from './routes/dashboard.routes.js'
import aiStudioRoutes from './routes/aiStudio.routes.js'
import { errorHandler } from './middleware/errorHandler.js'

dotenv.config()

const app = express()
const port = process.env.PORT || process.env.API_PORT || 4000
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:3000'

// 1. Core middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server) or from client origin
      if (!origin || origin === clientOrigin || origin.startsWith('http://localhost:')) {
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
app.use(express.json())

// 2. Health check
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'genra-api',
    status: 'online',
    timestamp: new Date().toISOString()
  })
})

// 3. API Routes (prefixed with /api and also root aliases for flexibility)
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

// 5. Start Server
async function startServer() {
  try {
    await connectDB()
    app.listen(port, '0.0.0.0', () => {
      console.log(`[Server] Genra API server running on http://localhost:${port}`)
    })
  } catch (err) {
    console.error('[Server] Failed to initialize server:', err)
    process.exit(1)
  }
}

startServer()

export default app
