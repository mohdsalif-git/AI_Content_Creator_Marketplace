import { verifyAccessToken } from '../utils/jwt.js'
import { User } from '../models/User.js'

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required. Missing Bearer token.',
        code: 'AUTH_REQUIRED'
      })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyAccessToken(token)

    const user = await User.findById(decoded.userId)
    if (!user) {
      return res.status(401).json({
        error: 'User account not found or has been deactivated.',
        code: 'USER_NOT_FOUND'
      })
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Access token expired',
        code: 'TOKEN_EXPIRED'
      })
    }
    return res.status(401).json({
      error: 'Invalid or malformed authorization token',
      code: 'INVALID_TOKEN'
    })
  }
}

export async function optionalAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      const decoded = verifyAccessToken(token)
      const user = await User.findById(decoded.userId)
      if (user) req.user = user
    }
  } catch {
    // Silently continue for optional auth
  }
  next()
}
