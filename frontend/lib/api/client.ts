import { apiUrl } from "./config"
import { clearSession, getAccessToken, saveSession } from "./token-store"
import type { ApiErrorPayload, TokenResponse } from "./types"

type RequestOptions = RequestInit & {
  authenticated?: boolean
  retries?: number
}

export class ApiError extends Error {
  status: number
  payload: unknown

  constructor(message: string, status: number, payload: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.payload = payload
  }
}

async function refreshAccessToken() {
  const token = getAccessToken()
  if (!token) return null

  const response = await fetch(apiUrl("/auth/refresh"), {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  }).catch(() => null)

  if (!response?.ok) return null
  const refreshed = (await response.json()) as TokenResponse
  saveSession(refreshed)
  return refreshed.access_token
}

function resolveErrorMessage(payload: unknown, fallback: string) {
  const data = payload as ApiErrorPayload
  return data?.error?.message ?? data?.detail ?? fallback
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { authenticated = true, retries = 2, headers, ...init } = options
  let attempt = 0

  while (true) {
    const token = authenticated ? getAccessToken() : null
    const requestHeaders = new Headers(headers)
    if (!requestHeaders.has("Content-Type") && !(init.body instanceof FormData)) {
      requestHeaders.set("Content-Type", "application/json")
    }
    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`)
    }

    try {
      const response = await fetch(apiUrl(path), {
        ...init,
        headers: requestHeaders,
      })

      if (response.status === 401 && authenticated) {
        const refreshed = await refreshAccessToken()
        if (refreshed) continue
        clearSession()
      }

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        if (response.status >= 500 && attempt < retries) {
          attempt += 1
          await sleep(250 * attempt)
          continue
        }
        throw new ApiError(resolveErrorMessage(payload, response.statusText), response.status, payload)
      }

      if (response.status === 204) {
        return undefined as T
      }

      return (await response.json()) as T
    } catch (error) {
      if (error instanceof ApiError) throw error
      if (attempt < retries) {
        attempt += 1
        await sleep(250 * attempt)
        continue
      }
      throw new ApiError("Unable to reach CivicAI backend API", 0, error)
    }
  }
}
