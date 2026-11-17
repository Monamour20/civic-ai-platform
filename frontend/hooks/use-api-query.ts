"use client"

import { useCallback, useEffect, useState } from "react"

type QueryState<T> = {
  data: T | null
  error: string | null
  isLoading: boolean
  refetch: () => Promise<void>
}

export function useApiQuery<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: { enabled?: boolean; intervalMs?: number } = {}
): QueryState<T> {
  const { enabled = true, intervalMs } = options
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(enabled)

  const refetch = useCallback(async () => {
    if (!enabled) return
    setIsLoading(true)
    setError(null)
    try {
      const result = await fetcher()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "API request failed")
    } finally {
      setIsLoading(false)
    }
  }, [enabled, fetcher])

  useEffect(() => {
    const id = window.setTimeout(() => void refetch(), 0)
    return () => window.clearTimeout(id)
  }, [key, refetch])

  useEffect(() => {
    if (!enabled || !intervalMs) return
    const id = window.setInterval(() => void refetch(), intervalMs)
    return () => window.clearInterval(id)
  }, [enabled, intervalMs, refetch])

  return { data, error, isLoading, refetch }
}
