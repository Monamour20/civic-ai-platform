export type ApiErrorPayload = {
  error?: {
    type?: string
    message?: string
    details?: unknown
  }
  detail?: string
}

export type LoginRequest = {
  email: string
  password: string
}

export type TokenResponse = {
  access_token: string
  token_type: "bearer"
  role: "admin" | "operator" | "analyst" | "department_user" | "citizen"
  expires_in_minutes: number
}

export type AnalyticsSummary = {
  live_complaints: number
  critical_incidents: number
  mean_resolution_hours: number
  ai_route_accuracy: number
  fraud_alerts: number
  issue_distribution: Array<{ issue: string; count: number }>
  department_load: Array<{
    department: string
    queue: number
    sla_adherence: number
  }>
}

export type TelemetryMetric = {
  service_name: string
  metric_name: string
  metric_value: number
  unit: string
  dimensions: Record<string, string | number>
}

export type GisIssue = {
  complaint_public_id: string
  issue_category: string
  ward: string
  department: string
  severity: string
  status: string
  latitude: number
  longitude: number
  ai_confidence: number
  escalation_risk: number
}

export type CivicComplaint = {
  id: number
  public_id: string
  title: string
  description: string
  issue_category: string
  severity: string
  status: string
  ward: string
  latitude: number | null
  longitude: number | null
  created_at: string
}

export type AiAnalysisResponse = {
  complaint_id: number
  severity_prediction: string
  confidence_score: number
  recommended_department: string
  reasoning_trace: Array<Record<string, string | number>>
  detected_issues: Array<Record<string, string | number>>
  model_outputs: Record<string, unknown>
}

export type AIJobStartResponse = {
  job_id: string
  state: string
  status_url: string
}

export type AIJobStatusResponse = {
  job_id: string
  state: "queued" | "processing" | "completed" | "failed"
  progress: number
  stage: string
  created_at: string
  updated_at: string
  result: MultimodalAnalysisResult | null
  error: string | null
}

export type MultimodalAnalysisResult = {
  job_id: string
  processing_state: string
  latency_ms: number
  exif_metadata: {
    sha256: string
    device_make: string
    device_model: string
    captured_at: string | null
    latitude: number | null
    longitude: number | null
    gps_verified: boolean
    timestamp_verified: boolean
    trust_score: number
    raw: Record<string, unknown>
  }
  fraud_indicators: Array<{
    indicator_type: string
    risk_score: number
    explanation: string
  }>
  model_outputs: Record<string, unknown>
  fusion: {
    confidence_score: number
    severity_prediction: string
    recommended_department: string
    secondary_department: string
    escalation_risk: number
    detected_issues: Array<Record<string, string | number>>
    recommendations: string[]
    reason: string
  }
  reasoning_trace: Array<{
    stage: string
    summary: string
    latency_ms: number
  }>
}
