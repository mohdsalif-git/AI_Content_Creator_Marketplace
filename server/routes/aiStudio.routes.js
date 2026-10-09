import { Router } from 'express'
import { generateContent } from '../controllers/aiStudio.controller.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// Protected: requires login
router.post('/generate', requireAuth, generateContent)

export default router
