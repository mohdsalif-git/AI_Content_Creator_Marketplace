import { getAccessToken, setAccessToken, clearAuth } from '../auth'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
  const headers = new Headers(options.headers || {})

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const token = getAccessToken()
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include' // allows httpOnly cookie for refresh token
  }

  let response: Response
  try {
    response = await fetch(url, config)
  } catch (error) {
    throw new Error('Network error. Please check if the Genra server is running.')
  }

  // Handle 401 Unauthorized with token refresh
  if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/register')) {
    if (!isRefreshing) {
      isRefreshing = true
      try {
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        })

        if (refreshRes.ok) {
          const refreshData = await refreshRes.json()
          if (refreshData.accessToken) {
            setAccessToken(refreshData.accessToken)
            onRefreshed(refreshData.accessToken)
            isRefreshing = false

            // Retry original request with new token
            headers.set('Authorization', `Bearer ${refreshData.accessToken}`)
            return request<T>(endpoint, { ...options, headers })
          }
        }
      } catch (err) {
        // Refresh failed
      }

      isRefreshing = false
      clearAuth()
    } else {
      // Queue requests until refresh completes
      return new Promise<T>((resolve, reject) => {
        refreshSubscribers.push((newToken: string) => {
          headers.set('Authorization', `Bearer ${newToken}`)
          request<T>(endpoint, { ...options, headers }).then(resolve).catch(reject)
        })
      })
    }
  }

  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const data = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    const errorMsg = (typeof data === 'object' && data?.error) || response.statusText || 'Request failed'
    const error: any = new Error(errorMsg)
    error.status = response.status
    error.details = data?.details
    error.code = data?.code
    throw error
  }

  return data as T
}

export const api = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<{ user: any; accessToken: string; message: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      }),

    register: (userData: { name: string; email: string; password: string; role?: string }) =>
      request<{ user: any; accessToken: string; message: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      }),

    google: (payload: { idToken: string; role?: string }) =>
      request<{ user: any; accessToken: string; message: string }>('/auth/google', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),

    forgotPassword: (email: string) =>
      request<{ message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      }),

    resetPassword: (payload: { token: string; newPassword: string }) =>
      request<{ message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),

    refresh: () =>
      request<{ user: any; accessToken: string }>('/auth/refresh', {
        method: 'POST'
      }),

    logout: () =>
      request<{ message: string }>('/auth/logout', {
        method: 'POST'
      }),

    me: () => request<{ user: any }>('/auth/me')
  },

  creators: {
    list: (params: {
      q?: string
      specialization?: string
      tools?: string
      skills?: string
      rights?: string
      verifiedOnly?: boolean
      page?: number
      limit?: number
    } = {}) => {
      const searchParams = new URLSearchParams()
      if (params.q) searchParams.set('q', params.q)
      if (params.specialization) searchParams.set('specialization', params.specialization)
      if (params.tools) searchParams.set('tools', params.tools)
      if (params.skills) searchParams.set('skills', params.skills)
      if (params.rights) searchParams.set('rights', params.rights)
      if (params.verifiedOnly) searchParams.set('verifiedOnly', 'true')
      if (params.page) searchParams.set('page', params.page.toString())
      if (params.limit) searchParams.set('limit', params.limit.toString())
      const queryStr = searchParams.toString()
      return request<{ items: any[]; total: number; page: number; totalPages: number; facets?: any }>(
        `/creators${queryStr ? `?${queryStr}` : ''}`
      )
    },

    getById: (id: string) => request<any>(`/creators/${id}`)
  },

  projects: {
    // Public endpoints
    list: (params: { status?: string; q?: string } = {}) => {
      const searchParams = new URLSearchParams()
      if (params.status) searchParams.set('status', params.status)
      if (params.q) searchParams.set('q', params.q)
      const queryStr = searchParams.toString()
      return request<{ items: any[]; total: number }>(`/projects${queryStr ? `?${queryStr}` : ''}`)
    },

    getById: (id: string) => request<any>(`/projects/${id}`)
  },

  briefs: {
    create: (data: any) =>
      request<any>('/briefs', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    list: () => request<{ items: any[]; total: number }>('/briefs'),

    getById: (id: string) => request<any>(`/briefs/${id}`),

    match: (id: string) =>
      request<{ briefId: string; briefTitle: string; matches: any[] }>(`/briefs/${id}/match`, {
        method: 'POST'
      }),

    send: (id: string, payload: { creatorId: string; notes?: string }) =>
      request<{ message: string; submission: any }>(`/briefs/${id}/send`, {
        method: 'POST',
        body: JSON.stringify(payload)
      })
  },

  dashboard: {
    getProjects: () =>
      request<{
        activeBriefs: any[]
        applications: any[]
        inProgress: any[]
        completed: any[]
      }>('/dashboard/projects')
  },

  aiStudio: {
    generateImage: (payload: { prompt: string; aspectRatio?: string; style?: string }) =>
      request<{ id: string; jobId: string; status: string; type: string; prompt: string; createdAt: string }>(
        '/ai-studio/generate-image',
        {
          method: 'POST',
          body: JSON.stringify(payload)
        }
      ),

    generateVideo: (payload: { prompt: string; aspectRatio?: string; duration?: number; imageUrl?: string }) =>
      request<{ id: string; jobId: string; status: string; type: string; prompt: string; createdAt: string }>(
        '/ai-studio/generate-video',
        {
          method: 'POST',
          body: JSON.stringify(payload)
        }
      ),

    getJobs: () => request<any[]>('/ai-studio/jobs'),

    getJobById: (id: string) => request<any>(`/ai-studio/jobs/${id}`),

    generate: (payload: { prompt: string; model?: string; ratio?: string; style?: string; kind?: string }) =>
      request<any>('/ai-studio/generate', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
  }
}
