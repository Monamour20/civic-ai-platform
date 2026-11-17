import { apiRequest } from "./client"
import type {
  AiAnalysisResponse,
  AIJobStartResponse,
  AIJobStatusResponse,
  AnalyticsSummary,
  CivicComplaint,
  GisIssue,
  LoginRequest,
  TelemetryMetric,
  TokenResponse,
} from "./types"

export const api = {
  auth: {
    login: (payload: LoginRequest) =>
      apiRequest<TokenResponse>("/auth/login", {
        authenticated: false,
        body: JSON.stringify(payload),
        method: "POST",
      }),
  },
  analytics: {
    summary: () => apiRequest<AnalyticsSummary>("/analytics/summary"),
  },
  telemetry: {
    runtime: () => apiRequest<TelemetryMetric[]>("/telemetry/runtime"),
    health: () => apiRequest<Record<string, unknown>>("/telemetry/health", { authenticated: false }),
  },
  gis: {
    issues: () => apiRequest<GisIssue[]>("/gis/issues"),
  },
  complaints: {
    list: () => apiRequest<CivicComplaint[]>("/complaints"),
    get: (id: number) => apiRequest<CivicComplaint>(`/complaints/${id}`),
  },
  ai: {
    analyze: (complaintId: number) =>
      apiRequest<AiAnalysisResponse>("/ai/analyze", {
        body: JSON.stringify({ complaint_id: complaintId }),
        method: "POST",
      }),
    uploadMultimodal: (file: File, complaintContext: string, onProgress?: (progress: number) => void) =>
      new Promise<AIJobStartResponse>((resolve, reject) => {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("complaint_context", complaintContext)
        const xhr = new XMLHttpRequest()
        xhr.open("POST", `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8000"}${process.env.NEXT_PUBLIC_API_PREFIX ?? "/api/v1"}/ai/multimodal/upload`)
        const token = window.localStorage.getItem("civic_ai_session")
        if (token) {
          try {
            const parsed = JSON.parse(token) as { access_token?: string }
            if (parsed.access_token) xhr.setRequestHeader("Authorization", `Bearer ${parsed.access_token}`)
          } catch {
            // ignore malformed local session; request will fail with 401
          }
        }
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100))
        }
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText) as AIJobStartResponse)
          } else {
            reject(new Error(xhr.responseText || "Multimodal upload failed"))
          }
        }
        xhr.onerror = () => reject(new Error("Unable to upload image to backend"))
        xhr.send(formData)
      }),
    jobStatus: (jobId: string) => apiRequest<AIJobStatusResponse>(`/ai/jobs/${jobId}`),
  },
}
