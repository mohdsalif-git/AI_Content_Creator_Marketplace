import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

let isConnected = false

export async function connectDB(maxRetries = 5) {
  // Check if existing connection is active
  if (mongoose.connection.readyState === 1) {
    isConnected = true
    return mongoose.connection
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/genra'

  // Attach connection event listeners with clear logs (only once)
  if (!global.__mongooseEventsAttached) {
    mongoose.connection.on('connected', () => {
      console.log(`[Database] MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`)
      isConnected = true
    })
    mongoose.connection.on('disconnected', () => {
      console.warn('[Database] MongoDB disconnected')
      isConnected = false
    })
    mongoose.connection.on('error', (err) => {
      console.error('[Database] MongoDB connection error:', err.message)
    })
    mongoose.connection.on('reconnected', () => {
      console.log('[Database] MongoDB reconnected successfully')
      isConnected = true
    })
    global.__mongooseEventsAttached = true
  }

  const options = {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    retryWrites: true
  }

  let attempt = 0
  let delay = 1000

  while (attempt < maxRetries) {
    attempt++
    try {
      console.log(`[Database] Attempting connection to MongoDB (Attempt ${attempt}/${maxRetries})...`)
      const conn = await mongoose.connect(uri, options)
      isConnected = true
      return conn
    } catch (err) {
      console.error(`[Database] Connection attempt ${attempt} failed: ${err.message}`)

      // Helpful diagnostics for common failures
      if (err.message.includes('bad auth') || err.message.includes('Authentication failed')) {
        console.error('[Database Diagnostic] Authentication failed: check username/password in MONGODB_URI. Special characters in password must be URL-encoded.')
      } else if (
        err.message.includes('selection timed out') ||
        err.message.includes('ENOTFOUND') ||
        err.message.includes('queryTxt ETIMEOUT')
      ) {
        console.error('[Database Diagnostic] Cluster unreachable: Check internet connection and verify your IP is added to the MongoDB Atlas Network Access allowlist (e.g. 0.0.0.0/0).')
      } else if (err.message.includes('database name')) {
        console.error('[Database Diagnostic] Invalid database name specified in MONGODB_URI.')
      }

      if (attempt >= maxRetries) {
        throw new Error(`[Database] Failed to connect to MongoDB after ${maxRetries} attempts: ${err.message}`)
      }

      console.log(`[Database] Retrying in ${delay}ms...`)
      await new Promise((resolve) => setTimeout(resolve, delay))
      delay = Math.min(delay * 2, 10000)
    }
  }
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close()
    isConnected = false
    console.log('[Database] MongoDB connection closed gracefully.')
  }
}
