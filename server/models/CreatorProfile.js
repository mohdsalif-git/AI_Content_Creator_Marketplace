import mongoose from 'mongoose'

const toolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    verified: { type: Boolean, default: false }
  },
  { _id: false }
)

const rightsSchema = new mongoose.Schema(
  {
    commercialUsage: { type: Boolean, default: true },
    paidAds: { type: Boolean, default: true },
    license12Months: { type: Boolean, default: true },
    exclusive: { type: Boolean, default: false }
  },
  { _id: false }
)

const workflowStepSchema = new mongoose.Schema(
  {
    order: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true }
  },
  { _id: false }
)

const portfolioItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    contentType: { type: String, required: true },
    imageUrl: { type: String, default: '' },
    toolsUsed: { type: [String], default: [] },
    rights: { type: String, default: 'Commercial Use' },
    platform: { type: String, default: 'All' },
    aspectRatio: { type: String, default: '16:9' },
    year: { type: String, default: '2025' },
    gradient: { type: String, default: 'linear-gradient(135deg, #181926 0%, #2f334d 100%)' }
  },
  { _id: false }
)

const creatorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    displayName: {
      type: String,
      required: true,
      trim: true
    },
    handle: {
      type: String,
      trim: true
    },
    mark: {
      type: String,
      default: ''
    },
    headline: {
      type: String,
      default: ''
    },
    specialization: {
      type: String,
      required: true,
      index: true
    },
    bio: {
      type: String,
      default: ''
    },
    location: {
      type: String,
      default: 'Remote'
    },
    avatarUrl: {
      type: String,
      default: ''
    },
    rating: {
      type: Number,
      default: 4.9
    },
    price: {
      type: Number,
      default: 2000
    },
    availability: {
      type: String,
      enum: ['Open', 'Limited', 'Booked', 'open', 'limited', 'booked'],
      default: 'Open'
    },
    isVerified: {
      type: Boolean,
      default: true
    },
    verificationScore: {
      type: Number,
      default: 90
    },
    color: {
      type: String,
      default: '#b08cff'
    },
    tools: {
      type: [toolSchema],
      default: []
    },
    skills: {
      type: [String],
      default: []
    },
    rights: {
      type: rightsSchema,
      default: () => ({})
    },
    workflow: {
      type: [workflowStepSchema],
      default: []
    },
    portfolio: {
      type: [portfolioItemSchema],
      default: []
    },
    formats: {
      type: [String],
      default: ['16:9', '9:16', '1:1']
    },
    stats: {
      projects: { type: Number, default: 24 },
      repeat: { type: Number, default: 75 },
      turnaround: { type: String, default: '3-5 days' }
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id
        // Frontend compatibility helpers:
        ret.name = ret.displayName
        ret.specialties = ret.skills?.length ? [ret.specialization, ...ret.skills] : [ret.specialization]
        ret.verified = ret.isVerified
        return ret
      }
    }
  }
)

// Index on tools.name and skills
creatorProfileSchema.index({ 'tools.name': 1 })
creatorProfileSchema.index({ skills: 1 })

// Text index on displayName, specialization, skills, tools.name
creatorProfileSchema.index(
  {
    displayName: 'text',
    specialization: 'text',
    skills: 'text',
    'tools.name': 'text'
  },
  {
    name: 'creator_profile_text_index',
    weights: {
      displayName: 10,
      specialization: 8,
      skills: 5,
      'tools.name': 5
    }
  }
)

export const CreatorProfile = mongoose.model('CreatorProfile', creatorProfileSchema)
