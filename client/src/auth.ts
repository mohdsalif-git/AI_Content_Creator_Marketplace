export const AUTH_KEY = 'genra-auth'

export function isAuthenticated() {
  return localStorage.getItem(AUTH_KEY) === 'authenticated'
}

export function authenticateDemoUser() {
  localStorage.setItem(AUTH_KEY, 'authenticated')
}

export function signOutDemoUser() {
  localStorage.removeItem(AUTH_KEY)
}
