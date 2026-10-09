import { Router } from 'express'
import { getDashboardProjects } from '../controllers/dashboard.controller.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// Protected: requires login
router.get('/projects', requireAuth, getDashboardProjects)

export default router
