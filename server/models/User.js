import mongoose from 'mongoose'
import { USER_ROLES } from '../constants/index.js'

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    passwordHash: {
      type: String,
      default: null
    },
    googleId: {
      type: String,
      default: null,
      sparse: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: 'creator'
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.passwordHash
        ret.id = ret._id
        return ret
      }
    }
  }
)

export const User = mongoose.model('User', userSchema)
