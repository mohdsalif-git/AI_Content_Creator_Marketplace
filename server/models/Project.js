import mongoose from 'mongoose'
import { PROJECT_STATUSES } from '../constants/index.js'

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    budget: {
      type: String,
      default: '$5k - $10k'
    },
    deadline: {
      type: String,
      default: 'Nov 30, 2026'
    },
    status: {
      type: String,
      enum: PROJECT_STATUSES,
      default: 'open',
      index: true
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true
    },
    brandName: {
      type: String,
      default: 'Genra Studio'
    },
    tags: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id
        return ret
      }
    }
  }
)

export const Project = mongoose.model('Project', projectSchema)
