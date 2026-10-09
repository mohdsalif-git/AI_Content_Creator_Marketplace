import mongoose from 'mongoose'

const briefSchema = new mongoose.Schema(
  {
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    brandName: {
      type: String,
      default: 'Genra Partner'
    },
    contentType: {
      type: String,
      required: true
    },
    style: {
      type: [String],
      default: ['Cinematic']
    },
    aspectRatio: {
      type: [String],
      default: ['16:9']
    },
    platform: {
      type: String,
      default: 'Cross-platform'
    },
    usage: {
      type: String,
      default: 'Commercial · Global'
    },
    rights: {
      type: mongoose.Schema.Types.Mixed,
      default: () => ({
        commercialUsage: true,
        paidAds: true,
        license12Months: true,
        exclusive: false
      })
    },
    requiredTools: {
      type: [String],
      default: []
    },
    assetCount: {
      type: Number,
      default: 3
    },
    budget: {
      type: String,
      default: '$5k - $10k'
    },
    budgetNum: {
      type: Number,
      default: 5000
    },
    deadline: {
      type: String,
      default: 'Dec 15, 2026'
    },
    description: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['Published', 'In review', 'Draft', 'Awarded', 'published', 'in-review', 'draft', 'awarded'],
      default: 'Published'
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        ret.id = ret._id
        // Frontend convenience mappings:
        ret.brand = ret.brandName
        ret.type = ret.contentType
        ret.formats = ret.aspectRatio
        ret.tools = ret.requiredTools
        ret.deliverables = ret.assetCount
        return ret
      }
    }
  }
)

export const Brief = mongoose.model('Brief', briefSchema)
