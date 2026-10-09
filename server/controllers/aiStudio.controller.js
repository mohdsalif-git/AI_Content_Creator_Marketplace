import { GenerationJob } from '../models/GenerationJob.js'
import { generateImageSchema, generateVideoSchema } from '../validators/aiStudio.validator.js'
import { seedanceAdapter } from '../services/media/seedance.adapter.js'

function emitUpdate(req, userId, job) {
  try {
    const io = req.app.get('io')
    if (io) {
      io.to(`user:${userId}`).emit('generation:update', job.toJSON ? job.toJSON() : job)
      // Also broadcast general event if needed
      io.emit('generation:event', { userId, jobId: job.id, status: job.status })
    }
  } catch (err) {
    console.warn('[AI Studio] Socket emission failed:', err.message)
  }
}

/**
 * Initiates an asynchronous image generation job
 * POST /ai-studio/generate-image
 */
export async function generateImage(req, res, next) {
  try {
    const validated = generateImageSchema.parse(req.body)
    const userId = req.user._id

    const job = await GenerationJob.create({
      userId,
      type: 'image',
      prompt: validated.prompt,
      aspectRatio: validated.aspectRatio,
      style: validated.style,
      status: 'queued',
      provider: 'seedream'
    })

    // Return immediately to client
    res.status(202).json({
      id: job.id,
      jobId: job.id,
      status: 'queued',
      type: 'image',
      prompt: job.prompt,
      createdAt: job.createdAt
    })

    // Run background processing
    setImmediate(async () => {
      try {
        job.status = 'processing'
        await job.save()
        emitUpdate(req, userId, job)

        const result = await seedanceAdapter.generateImage({
          prompt: validated.prompt,
          aspectRatio: validated.aspectRatio,
          style: validated.style
        })

        job.status = 'completed'
        job.resultUrl = result.url
        job.metadata = result.metadata || {}
        await job.save()
        emitUpdate(req, userId, job)
      } catch (err) {
        console.error(`[AI Studio] Job ${job.id} failed:`, err.message)
        job.status = 'failed'
        job.error = err.message
        await job.save()
        emitUpdate(req, userId, job)
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Initiates an asynchronous video generation job
 * POST /ai-studio/generate-video
 */
export async function generateVideo(req, res, next) {
  try {
    const validated = generateVideoSchema.parse(req.body)
    const userId = req.user._id

    const job = await GenerationJob.create({
      userId,
      type: 'video',
      prompt: validated.prompt,
      aspectRatio: validated.aspectRatio,
      duration: validated.duration,
      imageUrl: validated.imageUrl,
      status: 'queued',
      provider: 'seedance'
    })

    // Return immediately to client
    res.status(202).json({
      id: job.id,
      jobId: job.id,
      status: 'queued',
      type: 'video',
      prompt: job.prompt,
      createdAt: job.createdAt
    })

    // Run background processing
    setImmediate(async () => {
      try {
        job.status = 'processing'
        await job.save()
        emitUpdate(req, userId, job)

        const result = await seedanceAdapter.generateVideo({
          prompt: validated.prompt,
          aspectRatio: validated.aspectRatio,
          duration: validated.duration,
          imageUrl: validated.imageUrl
        })

        job.status = 'completed'
        job.resultUrl = result.url
        job.metadata = result.metadata || {}
        if (result.providerTaskId) {
          job.providerTaskId = result.providerTaskId
        }
        await job.save()
        emitUpdate(req, userId, job)
      } catch (err) {
        console.error(`[AI Studio] Video Job ${job.id} failed:`, err.message)
        job.status = 'failed'
        job.error = err.message
        await job.save()
        emitUpdate(req, userId, job)
      }
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Get all generation jobs for authenticated user
 * GET /ai-studio/jobs
 */
export async function getJobs(req, res, next) {
  try {
    const userId = req.user._id
    const jobs = await GenerationJob.find({ userId }).sort({ createdAt: -1 }).limit(50)
    res.json(jobs)
  } catch (error) {
    next(error)
  }
}

/**
 * Get a specific generation job by ID
 * GET /ai-studio/jobs/:id
 */
export async function getJobById(req, res, next) {
  try {
    const { id } = req.params
    const userId = req.user._id

    const job = await GenerationJob.findOne({ _id: id, userId })
    if (!job) {
      return res.status(404).json({ error: 'Generation job not found' })
    }

    res.json(job)
  } catch (error) {
    next(error)
  }
}

/**
 * Backwards compatibility endpoint
 * POST /ai-studio/generate
 */
export async function generateContent(req, res, next) {
  try {
    const { prompt, model = 'Genra Vision Pro', ratio = '9:16', style = 'Cinematic', kind = 'Create' } = req.body

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt is required for generation' })
    }

    const isVideo = kind?.toLowerCase().includes('video') || model?.toLowerCase().includes('video')
    if (isVideo) {
      const result = await seedanceAdapter.generateVideo({
        prompt: prompt.trim(),
        aspectRatio: ratio
      })
      return res.status(200).json({
        id: `gen-${Date.now()}`,
        status: 'completed',
        model,
        kind,
        prompt: prompt.trim(),
        ratio,
        style,
        outputUrl: result.url,
        metadata: {
          modelEngine: model || 'Genra Vision Pro',
          ...(result.metadata || {})
        },
        gradient: 'linear-gradient(135deg, #181926 0%, #2f334d 100%)',
        createdAt: new Date().toISOString()
      })
    }

    const result = await seedanceAdapter.generateImage({
      prompt: prompt.trim(),
      aspectRatio: ratio,
      style
    })

    return res.status(200).json({
      id: `gen-${Date.now()}`,
      status: 'completed',
      model,
      kind,
      prompt: prompt.trim(),
      ratio,
      style,
      outputUrl: result.url,
      metadata: {
        modelEngine: model || 'Genra Vision Pro',
        ...(result.metadata || {})
      },
      gradient: 'linear-gradient(135deg, #181926 0%, #2f334d 100%)',
      createdAt: new Date().toISOString()
    })
  } catch (error) {
    next(error)
  }
}
