import mongoose from 'mongoose'
import dotenv from 'dotenv'
import dns from 'dns'

// Set dependable DNS servers so Atlas SRV records resolve across different ISP / VPN configs
try {
  dns.setServers(['8.8.8.8', '1.1.1.1'])
} catch {
  // Ignore in environments where setting custom DNS is restricted
}

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
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 45000,
    maxPoolSize: 10,
    retryWrites: true,
    family: 4
  }

  let attempt = 0
  const maxAttempts = uri.includes('mongodb+srv') ? 2 : maxRetries
  let delay = 1000

  while (attempt < maxAttempts) {
    attempt++
    try {
      console.log(`[Database] Attempting connection to MongoDB (Attempt ${attempt}/${maxAttempts})...`)
      const conn = await mongoose.connect(uri, options)
      isConnected = true
      return conn
    } catch (err) {
      console.error(`[Database] Connection attempt ${attempt} failed: ${err.message}`)

      if (err.message.includes('bad auth') || err.message.includes('Authentication failed')) {
        console.error('[Database Diagnostic] Authentication failed: check username/password in MONGODB_URI. Special characters in password must be URL-encoded.')
      } else if (
        err.message.includes('whitelist') ||
        err.message.includes('selection timed out') ||
        err.message.includes('ENOTFOUND') ||
        err.message.includes('queryTxt ETIMEOUT')
      ) {
        console.warn('\n======================================================')
        console.warn('⚠️  MONGODB ATLAS NETWORK ACCESS NOTICE:')
        console.warn('Your IP address is not whitelisted in MongoDB Atlas.')
        console.warn('To connect to Atlas:')
        console.warn('  1. Go to cloud.mongodb.com -> Network Access')
        console.warn('  2. Click "Add IP Address" -> Select "Allow Access from Anywhere" (0.0.0.0/0) or add your current IP.')
        console.warn('  3. Click Confirm.')
        console.warn('======================================================\n')
      }

      if (attempt >= maxAttempts) {
        // If connecting to Atlas failed, try falling back to local MongoDB
        if (uri.includes('mongodb+srv') && uri !== 'mongodb://127.0.0.1:27017/genra') {
          console.warn('[Database] Falling back to local MongoDB (mongodb://127.0.0.1:27017/genra) to keep server operational...')
          try {
            const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/genra', {
              serverSelectionTimeoutMS: 3000,
              family: 4
            })
            isConnected = true
            console.log('[Database] Connected to fallback local MongoDB.')
            return localConn
          } catch (localErr) {
            console.error('[Database] Fallback to local MongoDB also failed:', localErr.message)
          }
        }
        throw new Error(`[Database] Failed to connect to MongoDB: ${err.message}`)
      }

      console.log(`[Database] Retrying in ${delay}ms...`)
      await new Promise((resolve) => setTimeout(resolve, delay))
      delay = Math.min(delay * 2, 5000)
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
