import { Router } from 'express'
import {
  createBrief,
  listBriefs,
  getBriefById,
  matchCreators,
  sendBrief
} from '../controllers/brief.controller.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// Protected: requires login
router.use(requireAuth)

router.post('/', createBrief)
router.get('/', listBriefs)
router.get('/:id', getBriefById)
router.post('/:id/match', matchCreators)
router.post('/:id/send', sendBrief)

export default router
