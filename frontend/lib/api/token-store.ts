import type { TokenResponse } from "./types"

const STORAGE_KEY = "civic_ai_session"

export type StoredSession = TokenResponse & {
  expires_at: number
}

export function saveSession(token: TokenResponse) {
  if (typeof window === "undefined") return
  const session: StoredSession = {
    ...token,
    expires_at: Date.now() + token.expires_in_minutes * 60_000,
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function getSession(): StoredSession | null {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    return JSON.parse(raw) as StoredSession
  } catch {
    clearSession()
    return null
  }
}

export function getAccessToken() {
  return getSession()?.access_token ?? null
}

export function isSessionExpired(session: StoredSession | null) {
  if (!session) return true
  return Date.now() > session.expires_at - 30_000
}

export function clearSession() {
  if (typeof window === "undefined") return
  window.localStorage.removeItem(STORAGE_KEY)
}
