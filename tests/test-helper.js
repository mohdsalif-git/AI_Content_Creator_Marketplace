import { startServer } from '../server/index.js'
import { connectDB } from '../server/config/db.js'

export const BASE_URL = 'http://localhost:4000'
export const API_URL = `${BASE_URL}/api`

export async function ensureServer() {
  try {
    const res = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(600) })
    if (res.ok) {
      return
    }
  } catch {
    // server not responding yet
  }

  try {
    await connectDB()
    await startServer()
  } catch (err) {
    if (err.code !== 'EADDRINUSE') {
      console.warn('[Test Helper] Server start notice:', err.message)
    }
  }

  // Poll until ready or timeout
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(500) })
      if (res.ok) return
    } catch {}
    await new Promise((r) => setTimeout(r, 200))
  }
}

export async function loginDemoUser() {
  await ensureServer()
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'demo@genra.ai',
      password: 'Genra123'
    })
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Login failed (${res.status}): ${text}`)
  }
  const data = await res.json()
  return { token: data.accessToken, user: data.user, cookie: res.headers.get('set-cookie') }
}
