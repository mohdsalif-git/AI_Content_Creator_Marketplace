import mongoose from 'mongoose'
import { SUBMISSION_STATUSES } from '../constants/index.js'

const submissionSchema = new mongoose.Schema(
  {
    briefId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brief',
      required: true,
      index: true
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CreatorProfile',
      required: true,
      index: true
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: SUBMISSION_STATUSES,
      default: 'sent',
      index: true
    },
    progress: {
      type: Number,
      default: 10,
      min: 0,
      max: 100
    },
    notes: {
      type: String,
      default: ''
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

export const Submission = mongoose.model('Submission', submissionSchema)
