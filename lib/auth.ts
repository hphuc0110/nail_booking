// Simple authentication utility for admin
// In production, this should be replaced with proper authentication (e.g., NextAuth.js)
// Using sessionStorage to ensure users must login each time they open a new tab/window

const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin123", // Change this to a secure password in production
}

const AUTH_KEY = "admin_auth_token"
// Session expires when tab/window is closed (sessionStorage behavior)
// Set a short expiry time as additional security measure
const AUTH_EXPIRY = 8 * 60 * 60 * 1000 // 8 hours (sessionStorage clears on tab close anyway)

export interface AuthSession {
  token: string
  expiresAt: number
}

export function login(username: string, password: string): boolean {
  if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
    const session: AuthSession = {
      token: generateToken(),
      expiresAt: Date.now() + AUTH_EXPIRY,
    }
    if (typeof window !== "undefined") {
      // Use sessionStorage instead of localStorage
      // This ensures session is cleared when tab/window is closed
      sessionStorage.setItem(AUTH_KEY, JSON.stringify(session))
    }
    return true
  }
  return false
}

export function logout(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(AUTH_KEY)
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false

  const sessionStr = sessionStorage.getItem(AUTH_KEY)
  if (!sessionStr) return false

  try {
    const session: AuthSession = JSON.parse(sessionStr)
    if (Date.now() > session.expiresAt) {
      logout()
      return false
    }
    return true
  } catch {
    logout()
    return false
  }
}

function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

