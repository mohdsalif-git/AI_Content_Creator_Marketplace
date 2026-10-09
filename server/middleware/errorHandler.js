import { ZodError } from 'zod'

export function errorHandler(err, _req, res, _next) {
  console.error('[Error Handler]', err)

  // 1. Handle Zod validation errors (Zod v4 uses .issues, v3 uses .errors)
  if (err instanceof ZodError) {
    const zodIssues = err.issues || err.errors || []
    const formattedErrors = zodIssues.map((e) => ({
      field: Array.isArray(e.path) ? e.path.join('.') : String(e.path || ''),
      message: e.message
    }))
    return res.status(400).json({
      error: formattedErrors[0]?.message || 'Validation error',
      details: formattedErrors
    })
  }

  // 2. Handle Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field'
    return res.status(409).json({
      error: `An account with that ${field} already exists.`,
      details: { field }
    })
  }

  // 3. Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: `Invalid resource identifier: ${err.value}`,
      details: { field: err.path }
    })
  }

  // 4. Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid authorization token',
      code: 'INVALID_TOKEN'
    })
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Authorization token expired',
      code: 'TOKEN_EXPIRED'
    })
  }

  // 5. Default internal server error
  const statusCode = err.status || err.statusCode || 500
  const message = err.message || 'An unexpected error occurred'
  return res.status(statusCode).json({
    error: message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  })
}
