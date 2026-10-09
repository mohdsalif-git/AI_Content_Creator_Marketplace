import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Try to find uploads dir relative to project root (local) or /tmp (serverless)
function getUploadsDir() {
  // On Vercel, filesystem is read-only except /tmp
  if (process.env.VERCEL || process.env.NOW_REGION) {
    return '/tmp/uploads'
  }
  return path.resolve(__dirname, '..', '..', '..', 'uploads')
}

async function ensureDir(dir) {
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  } catch {}
}

/**
 * Downloads a remote media file to the local uploads directory.
 * On Vercel, this writes to /tmp and returns a temporary path.
 * On production with persistent storage, it returns a local /uploads path.
 */
async function downloadToUploads(remoteUrl, extension = 'png') {
  try {
    const uploadsDir = getUploadsDir()
    await ensureDir(uploadsDir)
    const res = await fetch(remoteUrl)
    if (!res.ok) throw new Error(`Failed to download remote file: ${res.statusText}`)
    const buffer = Buffer.from(await res.arrayBuffer())
    const filename = `gen-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`
    const filePath = path.join(uploadsDir, filename)
    fs.writeFileSync(filePath, buffer)
    // On Vercel return the original remote URL since /tmp is not served
    if (process.env.VERCEL || process.env.NOW_REGION) {
      return remoteUrl
    }
    return `/uploads/${filename}`
  } catch (err) {
    console.warn(`[SeedanceAdapter] Failed to save media locally: ${err.message}. Using remote URL.`)
    return remoteUrl
  }
}

function getDimensionsFromRatio(ratio = '16:9') {
  switch (ratio) {
    case '1:1':   return '1024x1024'
    case '9:16':  return '720x1280'
    case '4:3':   return '1024x768'
    case '16:9':
    default:       return '1280x720'
  }
}

export class SeedanceAdapter {
  constructor() {
    this.apiKey     = process.env.SEEDANCE_API_KEY || process.env.ARK_API_KEY || ''
    this.baseUrl    = (process.env.SEEDANCE_BASE_URL || 'https://ark.ap-southeast.bytepluses.com/api/v3').replace(/\/+$/, '')
    this.imageModel = process.env.SEEDREAM_IMAGE_MODEL || 'seedream-5-0-pro'
    this.videoModel = process.env.SEEDANCE_VIDEO_MODEL || 'seedance-2-0'
    this.isMock     = process.env.MEDIA_MOCK === 'true' || !this.apiKey
  }

  async generateImage({ prompt, aspectRatio = '16:9', style = 'Cinematic' }) {
    if (this.isMock) {
      console.log(`[SeedanceAdapter] [Mock] Generating image for: "${prompt}"`)
      await new Promise(r => setTimeout(r, 1200))
      const mockImages = [
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=1200&q=80'
      ]
      return {
        url: mockImages[Math.floor(Math.random() * mockImages.length)],
        provider: 'seedream-mock',
        metadata: { model: this.imageModel, aspectRatio, style, mock: true }
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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` },
        body: JSON.stringify(body)
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        this.handleProviderError(response.status, errorData)
      }
      const data = await response.json()
      const remoteUrl = data?.data?.[0]?.url || data?.outputUrl || data?.url
      if (!remoteUrl) throw new Error('Seedream returned no image URL in response')
      const localUrl = await downloadToUploads(remoteUrl, 'png')
      return { url: localUrl, provider: 'seedream', metadata: { model: this.imageModel, rawResponse: data } }
    } catch (err) {
      console.error('[SeedanceAdapter] Image generation error:', err.message)
      throw err
    }
  }

  async generateVideo({ prompt, aspectRatio = '16:9', duration = 5, imageUrl }) {
    if (this.isMock) {
      console.log(`[SeedanceAdapter] [Mock] Generating video for: "${prompt}"`)
      await new Promise(r => setTimeout(r, 2000))
      return {
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        provider: 'seedance-mock',
        metadata: { model: this.videoModel, aspectRatio, duration, mock: true }
      }
    }

    try {
      const taskUrl = `${this.baseUrl}/contents/generations/tasks`
      const contentPayload = [{ type: 'text', text: prompt }]
      if (imageUrl) contentPayload.push({ type: 'image_url', image_url: { url: imageUrl } })
      const requestBody = { model: this.videoModel, content: contentPayload, aspect_ratio: aspectRatio, duration }
      const response = await fetch(taskUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` },
        body: JSON.stringify(requestBody)
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        this.handleProviderError(response.status, errorData)
      }
      const taskData = await response.json()
      const taskId = taskData?.id || taskData?.task_id || taskData?.data?.id
      if (!taskId) throw new Error('Seedance did not return a valid task ID')
      console.log(`[SeedanceAdapter] Video task: ${taskId}. Polling...`)
      const completedTask = await this.pollTaskStatus(taskId, 180000, 3000)
      const remoteVideoUrl = completedTask?.content?.video_url || completedTask?.data?.video_url || completedTask?.result?.video_url || completedTask?.video_url
      if (!remoteVideoUrl) throw new Error('Seedance task completed without a video URL')
      const localVideoUrl = await downloadToUploads(remoteVideoUrl, 'mp4')
      return { url: localVideoUrl, provider: 'seedance', providerTaskId: taskId, metadata: { model: this.videoModel, duration } }
    } catch (err) {
      console.error('[SeedanceAdapter] Video generation error:', err.message)
      throw err
    }
  }

  async pollTaskStatus(taskId, timeoutMs = 180000, initialIntervalMs = 3000) {
    const startTime = Date.now()
    let interval = initialIntervalMs
    while (Date.now() - startTime < timeoutMs) {
      await new Promise(r => setTimeout(r, interval))
      const pollUrl = `${this.baseUrl}/contents/generations/tasks/${taskId}`
      const response = await fetch(pollUrl, { headers: { Authorization: `Bearer ${this.apiKey}` } })
      if (!response.ok) { console.warn(`[SeedanceAdapter] Poll HTTP ${response.status}`); continue }
      const data = await response.json()
      const status = data?.status || data?.data?.status
      if (status === 'succeeded' || status === 'completed') return data
      if (status === 'failed' || status === 'cancelled') {
        throw new Error(`Seedance video task error: ${data?.error?.message || data?.message || 'Failed'}`)
      }
      interval = Math.min(interval + 1000, 8000)
    }
    throw new Error('Seedance video task timed out after 3 minutes')
  }

  handleProviderError(status, errorData) {
    const message = errorData?.error?.message || errorData?.message || JSON.stringify(errorData)
    if (status === 401) throw new Error(`BytePlus ModelArk authentication failed: Invalid API key. (${message})`)
    if (status === 429) throw new Error(`BytePlus ModelArk rate limit exceeded. (${message})`)
    if (status === 400 && message.toLowerCase().includes('filter')) throw new Error(`Content moderation: prompt blocked. (${message})`)
    throw new Error(`BytePlus ModelArk API error (${status}): ${message}`)
  }
}

export const seedanceAdapter = new SeedanceAdapter()
export default seedanceAdapter
