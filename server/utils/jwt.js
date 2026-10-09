import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'genra_default_jwt_access_secret_key'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'genra_default_jwt_refresh_secret_key'
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m'
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'

export function generateAccessToken(payload) {
  return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: JWT_ACCESS_EXPIRES_IN })
}

export function generateRefreshToken(payload) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN })
}

export function verifyAccessToken(token) {
  return jwt.verify(token, JWT_ACCESS_SECRET)
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, JWT_REFRESH_SECRET)
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function generateRandomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex')
}
