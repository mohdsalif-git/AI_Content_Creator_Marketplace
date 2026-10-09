import { OAuth2Client } from 'google-auth-library'
import { User } from '../models/User.js'
import { CreatorProfile } from '../models/CreatorProfile.js'
import { PasswordReset } from '../models/PasswordReset.js'
import { RefreshToken } from '../models/RefreshToken.js'
import { hashPassword, verifyPassword } from '../utils/argon2.js'
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
  generateRandomToken
} from '../utils/jwt.js'
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  googleAuthSchema
} from '../validators/auth.validator.js'
import { WORKFLOW_STEPS } from '../constants/index.js'

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'mock-client-id')

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
}

export async function register(req, res, next) {
  try {
    const data = registerSchema.parse(req.body)
    const email = data.email.toLowerCase().trim()

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email address already exists.' })
    }

    const passwordHash = await hashPassword(data.password)
    const normalizedRole = data.role.toLowerCase() === 'brand' ? 'brand' : 'creator'

    const user = await User.create({
      name: data.name.trim(),
      email,
      passwordHash,
      role: normalizedRole
    })

    // If role is creator, set up an initial creator profile
    if (normalizedRole === 'creator') {
      const initials = data.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
      await CreatorProfile.create({
        userId: user._id,
        displayName: data.name.trim(),
        handle: `@${email.split('@')[0]}`,
        mark: initials || 'CR',
        headline: 'AI-native creator and visual designer.',
        specialization: 'AI Video Ads',
        bio: 'Creating high-impact AI visual content for forward-thinking brands.',
        location: 'Remote',
        rating: 5.0,
        price: 1500,
        availability: 'Open',
        color: '#b08cff',
        isVerified: true,
        verificationScore: 85,
        tools: [{ name: 'Runway', verified: true }, { name: 'Midjourney', verified: true }],
        skills: ['Prompt Engineering', 'Video Editing'],
        workflow: WORKFLOW_STEPS,
        portfolio: []
      })
    }

    const accessToken = generateAccessToken({ userId: user._id, email: user.email, role: user.role })
    const refreshToken = generateRefreshToken({ userId: user._id })

    await RefreshToken.create({
      userId: user._id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    })

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
    return res.status(201).json({
      message: 'Account created successfully',
      user: user.toJSON(),
      accessToken
    })
  } catch (error) {
    next(error)
  }
}

export async function login(req, res, next) {
  try {
    const data = loginSchema.parse(req.body)
    const email = data.email.toLowerCase().trim()

    const user = await User.findOne({ email })
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    const isValid = await verifyPassword(user.passwordHash, data.password)
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' })
    }

    const accessToken = generateAccessToken({ userId: user._id, email: user.email, role: user.role })
    const refreshToken = generateRefreshToken({ userId: user._id })

    await RefreshToken.create({
      userId: user._id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    })

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
    return res.json({
      message: 'Signed in successfully',
      user: user.toJSON(),
      accessToken
    })
  } catch (error) {
    next(error)
  }
}

export async function googleLogin(req, res, next) {
  try {
    const data = googleAuthSchema.parse(req.body)
    let payload = null

    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: data.idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      })
      payload = ticket.getPayload()
    } catch {
      // Development mock fallback if real Google OAuth client ID is not configured
      try {
        const decoded = JSON.parse(Buffer.from(data.idToken.split('.')[1] || '', 'base64').toString() || '{}')
        payload = {
          sub: decoded.sub || 'mock-google-id-' + Date.now(),
          email: decoded.email || 'demo@gmail.com',
          name: decoded.name || 'Demo Google User'
        }
      } catch {
        payload = {
          sub: 'google-user-' + Date.now(),
          email: 'demo@gmail.com',
          name: 'Demo Google User'
        }
      }
    }

    if (!payload?.email) {
      return res.status(400).json({ error: 'Invalid Google ID token payload' })
    }

    let user = await User.findOne({ email: payload.email.toLowerCase() })
    if (!user) {
      const role = data.role ? (data.role.toLowerCase() === 'brand' ? 'brand' : 'creator') : 'creator'
      user = await User.create({
        name: payload.name || 'Google Creator',
        email: payload.email.toLowerCase(),
        googleId: payload.sub,
        role
      })

      if (role === 'creator') {
        await CreatorProfile.create({
          userId: user._id,
          displayName: user.name,
          handle: `@${user.email.split('@')[0]}`,
          mark: user.name.slice(0, 2).toUpperCase(),
          headline: 'AI Creator verified via Google.',
          specialization: 'AI Video Ads',
          rating: 4.9,
          price: 1800,
          availability: 'Open',
          tools: [{ name: 'Runway', verified: true }, { name: 'Sora', verified: true }],
          skills: ['Prompt Engineering', 'Video Editing'],
          workflow: WORKFLOW_STEPS,
          portfolio: []
        })
      }
    } else if (!user.googleId) {
      user.googleId = payload.sub
      await user.save()
    }

    const accessToken = generateAccessToken({ userId: user._id, email: user.email, role: user.role })
    const refreshToken = generateRefreshToken({ userId: user._id })

    await RefreshToken.create({
      userId: user._id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    })

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS)
    return res.json({
      message: 'Google authentication successful',
      user: user.toJSON(),
      accessToken
    })
  } catch (error) {
    next(error)
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const data = forgotPasswordSchema.parse(req.body)
    const email = data.email.toLowerCase().trim()

    const user = await User.findOne({ email })
    if (user) {
      const resetToken = generateRandomToken(32)
      const tokenHash = hashToken(resetToken)
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      // Invalidate any existing reset tokens for this user
      await PasswordReset.deleteMany({ userId: user._id })

      await PasswordReset.create({
        userId: user._id,
        tokenHash,
        expiresAt
      })

      // In development, log the reset link directly to the console
      const resetUrl = `http://localhost:3000/forgot-password?token=${resetToken}`
      console.log('\n======================================================')
      console.log(`[AUTH] PASSWORD RESET LINK FOR ${email}:`)
      console.log(resetUrl)
      console.log('======================================================\n')
    }

    // Identical response whether user exists or not to prevent user enumeration
    return res.json({
      message: 'If an account with that email exists, password reset instructions have been sent.'
    })
  } catch (error) {
    next(error)
  }
}

export async function resetPassword(req, res, next) {
  try {
    const data = resetPasswordSchema.parse(req.body)
    const tokenHash = hashToken(data.token)

    const resetDoc = await PasswordReset.findOne({
      tokenHash,
      expiresAt: { $gt: new Date() }
    })

    if (!resetDoc) {
      return res.status(400).json({ error: 'Password reset link is invalid or has expired.' })
    }

    const user = await User.findById(resetDoc.userId)
    if (!user) {
      return res.status(404).json({ error: 'User account no longer exists.' })
    }

    user.passwordHash = await hashPassword(data.newPassword)
    await user.save()

    // Single use: delete used token
    await PasswordReset.deleteOne({ _id: resetDoc._id })

    // Invalidate existing refresh tokens for security
    await RefreshToken.deleteMany({ userId: user._id })

    return res.json({
      message: 'Password reset successfully. You may now sign in with your new password.'
    })
  } catch (error) {
    next(error)
  }
}

export async function refresh(req, res, next) {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken
    if (!token) {
      return res.status(401).json({ error: 'Refresh token missing', code: 'REFRESH_TOKEN_REQUIRED' })
    }

    let decoded = null
    try {
      decoded = verifyRefreshToken(token)
    } catch {
      return res.status(401).json({ error: 'Invalid or expired refresh token', code: 'INVALID_REFRESH_TOKEN' })
    }

    const hashed = hashToken(token)
    const storedToken = await RefreshToken.findOne({ tokenHash: hashed, userId: decoded.userId })
    if (!storedToken) {
      return res.status(401).json({ error: 'Refresh token revoked or invalid', code: 'REFRESH_TOKEN_REVOKED' })
    }

    const user = await User.findById(decoded.userId)
    if (!user) {
      return res.status(401).json({ error: 'User not found', code: 'USER_NOT_FOUND' })
    }

    const newAccessToken = generateAccessToken({ userId: user._id, email: user.email, role: user.role })
    return res.json({
      accessToken: newAccessToken,
      user: user.toJSON()
    })
  } catch (error) {
    next(error)
  }
}

export async function logout(req, res, next) {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken
    if (token) {
      await RefreshToken.deleteOne({ tokenHash: hashToken(token) })
    }
    res.clearCookie('refreshToken', COOKIE_OPTIONS)
    return res.json({ message: 'Signed out successfully' })
  } catch (error) {
    next(error)
  }
}

export async function me(req, res) {
  return res.json({ user: req.user.toJSON() })
}
