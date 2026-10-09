import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/genra'
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    })
    console.log(`[Database] MongoDB connected successfully: ${conn.connection.host}/${conn.connection.name}`)
    return conn
  } catch (error) {
    console.error(`[Database] MongoDB connection error: ${error.message}`)
    throw error
  }
}
