export const AUTH_KEY = 'genra-auth'
export const USER_KEY = 'genra-user'
export const TOKEN_KEY = 'genra-token'

export type DemoUser = {
  id?: string
  name: string
  email: string
  provider?: 'demo' | 'google'
  accountType?: 'Creator' | 'Brand'
  role?: string
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAccessToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(AUTH_KEY, 'authenticated')
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(AUTH_KEY)
  localStorage.removeItem(USER_KEY)
}

export function isAuthenticated(): boolean {
  return Boolean(localStorage.getItem(TOKEN_KEY) || localStorage.getItem(AUTH_KEY) === 'authenticated')
}

export function authenticateDemoUser(token?: string) {
  localStorage.setItem(AUTH_KEY, 'authenticated')
  if (token) localStorage.setItem(TOKEN_KEY, token)
}

export function getUser(): DemoUser | null {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null') as DemoUser | null
  } catch {
    return null
  }
}

export function saveUser(user: DemoUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export async function signOutDemoUser() {
  clearAuth()
  try {
    const { api } = await import('./services/api')
    await api.auth.logout()
  } catch {
    // Ignore error on logout call
  }
}
