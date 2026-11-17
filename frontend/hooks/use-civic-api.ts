"use client"

import { useCallback, useState } from "react"

import { api } from "@/lib/api/endpoints"
import type { AiAnalysisResponse, AIJobStatusResponse } from "@/lib/api/types"

import { useAuth } from "@/contexts/auth-context"
import { useApiQuery } from "./use-api-query"

export function useAnalyticsSummary() {
  const { isAuthenticated } = useAuth()
  return useApiQuery("analytics-summary", api.analytics.summary, {
    enabled: isAuthenticated,
    intervalMs: 30_000,
  })
}

export function useTelemetryRuntime() {
  const { isAuthenticated } = useAuth()
  return useApiQuery("telemetry-runtime", api.telemetry.runtime, {
    enabled: isAuthenticated,
    intervalMs: 15_000,
  })
}

export function useGisIssues() {
  const { isAuthenticated } = useAuth()
  return useApiQuery("gis-issues", api.gis.issues, {
    enabled: isAuthenticated,
    intervalMs: 20_000,
  })
}

export function useComplaints() {
  const { isAuthenticated } = useAuth()
  return useApiQuery("complaints", api.complaints.list, {
    enabled: isAuthenticated,
  })
}

export function useAiAnalysis() {
  const [data, setData] = useState<AiAnalysisResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const analyze = useCallback(async (complaintId: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await api.ai.analyze(complaintId)
      setData(result)
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : "AI analysis request failed"
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { analyze, data, error, isLoading }
}

export function useMultimodalAnalysis() {
  const [job, setJob] = useState<AIJobStatusResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const upload = useCallback(async (file: File, complaintContext: string) => {
    setIsUploading(true)
    setError(null)
    setUploadProgress(0)
    try {
      const started = await api.ai.uploadMultimodal(file, complaintContext, setUploadProgress)
      const initial: AIJobStatusResponse = {
        job_id: started.job_id,
        state: "queued",
        progress: 0,
        stage: "queued",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        result: null,
        error: null,
      }
      setJob(initial)
      return started.job_id
    } catch (err) {
      const message = err instanceof Error ? err.message : "Image upload failed"
      setError(message)
      throw err
    } finally {
      setIsUploading(false)
    }
  }, [])

  const poll = useCallback(async (jobId: string) => {
    const status = await api.ai.jobStatus(jobId)
    setJob(status)
    return status
  }, [])

  return { error, isUploading, job, poll, upload, uploadProgress }
}
