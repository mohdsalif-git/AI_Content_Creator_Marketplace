import mongoose from 'mongoose'

const refreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    tokenHash: {
      type: String,
      required: true,
      index: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // TTL index automatically deletes expired documents
    }
  },
  {
    timestamps: true
  }
)

export const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema)
