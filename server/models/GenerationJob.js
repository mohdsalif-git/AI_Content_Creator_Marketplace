import mongoose from 'mongoose'

const generationJobSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['image', 'video'],
      required: true
    },
    prompt: {
      type: String,
      required: true,
      maxlength: 1000
    },
    aspectRatio: {
      type: String,
      default: '16:9'
    },
    style: {
      type: String,
      default: 'Cinematic'
    },
    duration: {
      type: Number,
      default: 5
    },
    imageUrl: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['queued', 'processing', 'completed', 'failed'],
      default: 'queued',
      index: true
    },
    resultUrl: {
      type: String,
      default: ''
    },
    error: {
      type: String,
      default: null
    },
    provider: {
      type: String,
      default: 'seedream'
    },
    providerTaskId: {
      type: String,
      default: null
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
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

export const GenerationJob = mongoose.model('GenerationJob', generationJobSchema)
