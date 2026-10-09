import { Router } from 'express'
import { listProjects, getProjectById } from '../controllers/project.controller.js'

const router = Router()

// PUBLIC: No auth middleware at all
router.get('/', listProjects)
router.get('/:id', getProjectById)

export default router
