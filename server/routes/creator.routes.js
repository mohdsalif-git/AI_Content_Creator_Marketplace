import { Router } from 'express'
import { listCreators, getCreatorById } from '../controllers/creator.controller.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// Protected: requires login
router.get('/', requireAuth, listCreators)
router.get('/:id', requireAuth, getCreatorById)

export default router
