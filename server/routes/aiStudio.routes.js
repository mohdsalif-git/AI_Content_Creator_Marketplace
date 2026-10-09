import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import {
  generateImage,
  generateVideo,
  getJobs,
  getJobById,
  generateContent
} from '../controllers/aiStudio.controller.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// Rate limit: 60 generation requests per user per hour
const generateRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 60,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  validate: false,
  message: {
    error: 'Too many generation requests. Please try again in an hour.'
  },
  standardHeaders: true,
  legacyHeaders: false
})

// Protected generation routes
router.post('/generate-image', requireAuth, generateRateLimiter, generateImage)
router.post('/generate-video', requireAuth, generateRateLimiter, generateVideo)
router.get('/jobs', requireAuth, getJobs)
router.get('/jobs/:id', requireAuth, getJobById)

// Backwards-compatible route
router.post('/generate', requireAuth, generateRateLimiter, generateContent)

export default router
