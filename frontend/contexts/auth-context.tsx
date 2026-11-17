"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"

import { api } from "@/lib/api/endpoints"
import {
  clearSession,
  getSession,
  isSessionExpired,
  saveSession,
  type StoredSession,
} from "@/lib/api/token-store"

type AuthContextValue = {
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  session: StoredSession | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(() => {
    const stored = getSession()
    if (isSessionExpired(stored)) {
      clearSession()
      return null
    }
    return stored
  })
  const isLoading = false

  const login = useCallback(async (email: string, password: string) => {
    const token = await api.auth.login({ email, password })
    saveSession(token)
    setSession(getSession())
  }, [])

  const logout = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(session && !isSessionExpired(session)),
      isLoading,
      login,
      logout,
      session,
    }),
    [isLoading, login, logout, session]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
