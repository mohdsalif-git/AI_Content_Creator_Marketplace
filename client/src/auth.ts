export const AUTH_KEY = 'genra-auth'
export const USER_KEY = 'genra-user'

export type DemoUser = { name: string; email: string }

export function isAuthenticated() {
  return localStorage.getItem(AUTH_KEY) === 'authenticated'
}

export function authenticateDemoUser() {
  localStorage.setItem(AUTH_KEY, 'authenticated')
}

export function getUser(): DemoUser | null {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null') as DemoUser | null } catch { return null }
}

export function saveUser(user: DemoUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function signOutDemoUser() {
  localStorage.removeItem(AUTH_KEY)
  localStorage.removeItem(USER_KEY)
}
