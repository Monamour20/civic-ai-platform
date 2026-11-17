export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8000"

export const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX ?? "/api/v1"

export function apiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${API_BASE_URL}${API_PREFIX}${normalizedPath}`
}
