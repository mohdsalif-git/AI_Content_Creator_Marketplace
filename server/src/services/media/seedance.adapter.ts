import fs from 'fs'
import path from 'path'

export interface ImageGenerationOptions {
  prompt: string
  aspectRatio?: string
  style?: string
}

export interface VideoGenerationOptions {
  prompt: string
  aspectRatio?: string
  duration?: number
  imageUrl?: string
}

export interface GenerationResult {
  url: string
  provider: string
  providerTaskId?: string
  metadata?: Record<string, any>
}

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads')
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true })
}

/**
 * Downloads a remote media file to the local /uploads directory so that
 * temporary provider URLs never expire.
 */
async function downloadToUploads(remoteUrl: string, extension = 'png'): Promise<string> {
  try {
    const res = await fetch(remoteUrl)
    if (!res.ok) throw new Error(`Failed to download remote file: ${res.statusText}`)
    const buffer = Buffer.from(await res.arrayBuffer())
    const filename = `gen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`
    const filePath = path.join(UPLOADS_DIR, filename)
    fs.writeFileSync(filePath, buffer)
    return `/uploads/${filename}`
  } catch (err: any) {
    console.warn(`[SeedanceAdapter] Failed to save media locally: ${err.message}. Using remote URL.`)
    return remoteUrl
  }
}

/**
 * Map standard aspect ratio string to pixel dimensions
 */
function getDimensionsFromRatio(ratio = '16:9'): string {
  switch (ratio) {
    case '1:1':
      return '1024x1024'
    case '9:16':
      return '720x1280'
    case '4:3':
      return '1024x768'
    case '16:9':
    default:
      return '1280x720'
  }
}

/**
 * Seedance / Seedream Adapter
 * ONLY file that knows BytePlus ModelArk request and response formats.
 */
export class SeedanceAdapter {
  private apiKey: string
  private baseUrl: string
  private imageModel: string
  private videoModel: string
  private isMock: boolean

  constructor() {
    this.apiKey = process.env.SEEDANCE_API_KEY || ''
    this.baseUrl = (process.env.SEEDANCE_BASE_URL || 'https://ark.ap-southeast.bytepluses.com/api/v3').replace(/\/+$/, '')
    this.imageModel = process.env.SEEDREAM_IMAGE_MODEL || 'seedream-5-0-pro'
    this.videoModel = process.env.SEEDANCE_VIDEO_MODEL || 'seedance-2-0'
    this.isMock = process.env.MEDIA_MOCK === 'true' || !this.apiKey
  }

  /**
   * Generates an image via BytePlus ModelArk Seedream (POST /api/v3/images/generations)
   */
  async generateImage(options: ImageGenerationOptions): Promise<GenerationResult> {
    const { prompt, aspectRatio = '16:9', style = 'Cinematic' } = options

    if (this.isMock) {
      console.log(`[SeedanceAdapter] [Mock Mode] Generating image for prompt: "${prompt}"`)
      await new Promise((r) => setTimeout(r, 1200)) // simulate latency
      const mockImages = [
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=1200&q=80'
      ]
      const chosenUrl = mockImages[Math.floor(Math.random() * mockImages.length)]
      return {
        url: chosenUrl,
        provider: 'seedream-mock',
        metadata: {
          model: this.imageModel,
          aspectRatio,
          style,
          mock: true
        }
      }
    }

    try {
      const url = `${this.baseUrl}/images/generations`
      const body = {
        model: this.imageModel,
        prompt: `${prompt}, ${style} aesthetic`,
        size: getDimensionsFromRatio(aspectRatio),
        response_format: 'url'
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        this.handleProviderError(response.status, errorData)
      }

      const data = await response.json()
      const remoteUrl = data?.data?.[0]?.url || data?.outputUrl || data?.url

      if (!remoteUrl) {
        throw new Error('Seedream returned no image URL in response')
      }

      // Download locally so URL does not expire
      const localUrl = await downloadToUploads(remoteUrl, 'png')

      return {
        url: localUrl,
        provider: 'seedream',
        metadata: {
          model: this.imageModel,
          rawResponse: data
        }
      }
    } catch (err: any) {
      console.error('[SeedanceAdapter] Image generation error:', err.message)
      throw err
    }
  }

  /**
   * Generates a video via BytePlus ModelArk Seedance (POST /api/v3/contents/generations/tasks)
   * Polls task endpoint until completion.
   */
  async generateVideo(options: VideoGenerationOptions): Promise<GenerationResult> {
    const { prompt, aspectRatio = '16:9', duration = 5, imageUrl } = options

    if (this.isMock) {
      console.log(`[SeedanceAdapter] [Mock Mode] Generating video for prompt: "${prompt}"`)
      await new Promise((r) => setTimeout(r, 2000)) // simulate latency
      return {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        provider: 'seedance-mock',
        metadata: {
          model: this.videoModel,
          aspectRatio,
          duration,
          mock: true
        }
      }
    }

    try {
      const taskUrl = `${this.baseUrl}/contents/generations/tasks`
      const contentPayload: any[] = [{ type: 'text', text: prompt }]

      if (imageUrl) {
        contentPayload.push({
          type: 'image_url',
          image_url: { url: imageUrl }
        })
      }

      const requestBody = {
        model: this.videoModel,
        content: contentPayload,
        aspect_ratio: aspectRatio,
        duration
      }

      const response = await fetch(taskUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        this.handleProviderError(response.status, errorData)
      }

      const taskData = await response.json()
      const taskId = taskData?.id || taskData?.task_id || taskData?.data?.id

      if (!taskId) {
        throw new Error('Seedance did not return a valid task ID')
      }

      console.log(`[SeedanceAdapter] Video task initiated. Task ID: ${taskId}. Polling for completion...`)

      // Poll task status
      const completedTask = await this.pollTaskStatus(taskId, 180000, 3000)
      const remoteVideoUrl =
        completedTask?.content?.video_url ||
        completedTask?.data?.video_url ||
        completedTask?.result?.video_url ||
        completedTask?.video_url

      if (!remoteVideoUrl) {
        throw new Error('Seedance task completed without a video URL')
      }

      const localVideoUrl = await downloadToUploads(remoteVideoUrl, 'mp4')

      return {
        url: localVideoUrl,
        provider: 'seedance',
        providerTaskId: taskId,
        metadata: {
          model: this.videoModel,
          duration
        }
      }
    } catch (err: any) {
      console.error('[SeedanceAdapter] Video generation error:', err.message)
      throw err
    }
  }

  /**
   * Polls task status endpoint with backoff until completion or timeout
   */
  private async pollTaskStatus(taskId: string, timeoutMs = 180000, initialIntervalMs = 3000): Promise<any> {
    const startTime = Date.now()
    let interval = initialIntervalMs

    while (Date.now() - startTime < timeoutMs) {
      await new Promise((r) => setTimeout(r, interval))

      const pollUrl = `${this.baseUrl}/contents/generations/tasks/${taskId}`
      const response = await fetch(pollUrl, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`
        }
      })

      if (!response.ok) {
        console.warn(`[SeedanceAdapter] Status poll HTTP ${response.status}`)
        continue
      }

      const data = await response.json()
      const status = data?.status || data?.data?.status

      if (status === 'succeeded' || status === 'completed') {
        return data
      }

      if (status === 'failed' || status === 'cancelled') {
        const reason = data?.error?.message || data?.message || 'Video task failed or was cancelled by provider'
        throw new Error(`Seedance video task error: ${reason}`)
      }

      // Slightly back off interval up to 8s
      interval = Math.min(interval + 1000, 8000)
    }

    throw new Error('Seedance video task timed out after 3 minutes')
  }

  /**
   * Maps provider HTTP status codes and errors to friendly messages
   */
  private handleProviderError(status: number, errorData: any) {
    const message = errorData?.error?.message || errorData?.message || JSON.stringify(errorData)
    if (status === 401) {
      throw new Error(`BytePlus ModelArk authentication failed: Invalid SEEDANCE_API_KEY. (${message})`)
    }
    if (status === 429) {
      throw new Error(`BytePlus ModelArk rate limit or quota exceeded. Please check credit balance. (${message})`)
    }
    if (status === 400 && message.toLowerCase().includes('filter')) {
      throw new Error(`Content moderation alert: The prompt violates BytePlus safety guidelines. (${message})`)
    }
    throw new Error(`BytePlus ModelArk API error (${status}): ${message}`)
  }
}

export const seedanceAdapter = new SeedanceAdapter()
