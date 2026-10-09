import { Router } from 'express'
import {
  register,
  login,
  googleLogin,
  forgotPassword,
  resetPassword,
  refresh,
  logout,
  me
} from '../controllers/auth.controller.js'
import { loginLimiter, forgotPasswordLimiter } from '../middleware/rateLimiter.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.post('/register', register)
router.post('/login', loginLimiter, login)
router.post('/google', googleLogin)
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword)
router.post('/reset-password', resetPassword)
router.post('/refresh', refresh)
router.post('/logout', logout)
router.get('/me', requireAuth, me)

export default router
