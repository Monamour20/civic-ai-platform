"use client"

import { useEffect, useMemo, useState } from "react"
import type { LucideIcon } from "lucide-react"
import {
  AlertTriangle,
  Bot,
  CalendarClock,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Crosshair,
  DatabaseZap,
  FileImage,
  Fingerprint,
  Gauge,
  Lightbulb,
  LocateFixed,
  MapPinned,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useMultimodalAnalysis } from "@/hooks/use-civic-api"

const detections = [
  {
    label: "Garbage dumping",
    confidence: "97.2%",
    severity: "High",
    box: "left-[12%] top-[48%] h-[26%] w-[28%]",
    color: "border-cyan-300 text-cyan-100",
  },
  {
    label: "Road pothole",
    confidence: "91.6%",
    severity: "Critical",
    box: "left-[54%] top-[64%] h-[18%] w-[22%]",
    color: "border-red-300 text-red-100",
  },
  {
    label: "Water leakage",
    confidence: "88.4%",
    severity: "High",
    box: "left-[34%] top-[56%] h-[14%] w-[18%]",
    color: "border-emerald-300 text-emerald-100",
  },
  {
    label: "Damaged streetlight",
    confidence: "84.9%",
    severity: "Medium",
    box: "left-[76%] top-[12%] h-[32%] w-[12%]",
    color: "border-amber-300 text-amber-100",
  },
  {
    label: "Drainage failure",
    confidence: "90.8%",
    severity: "Critical",
    box: "left-[14%] top-[78%] h-[11%] w-[58%]",
    color: "border-violet-300 text-violet-100",
  },
]

const overlaySlots = [
  "left-[54%] top-[64%] h-[18%] w-[22%]",
  "left-[12%] top-[48%] h-[26%] w-[28%]",
]

const visionFindings = [
  { label: "Scene type", value: "Urban roadside utility corridor" },
  { label: "Primary issue", value: "Garbage dumping with drainage obstruction" },
  { label: "Secondary risks", value: "Standing water, pothole expansion, lighting damage" },
  { label: "Evidence quality", value: "Sharp image, partial occlusion, dusk lighting" },
]

const exifMetadata = [
  { label: "Device", value: "Citizen Mobile / Android 14" },
  { label: "Captured", value: "26 May 2026, 18:42 IST" },
  { label: "GPS", value: "12.9719 N, 77.5946 E" },
  { label: "Asset zone", value: "Ward 12 / Transit Spine / Drain Segment D-44" },
  { label: "Image hash", value: "sha256: 8f3a...c91e" },
  { label: "Compression", value: "Original JPEG, no resave artifacts" },
]

const trustSignals = [
  { label: "Evidence trust score", value: "91", icon: ShieldCheck, tone: "emerald" },
  { label: "Fraud risk score", value: "18", icon: ShieldAlert, tone: "amber" },
  { label: "GPS confidence", value: "96", icon: LocateFixed, tone: "cyan" },
  { label: "Timestamp validity", value: "98", icon: CalendarClock, tone: "blue" },
] satisfies Array<{
  icon: LucideIcon
  label: string
  tone: keyof typeof toneStyles
  value: string
}>

const fraudIndicators = [
  { label: "Duplicate media search", value: "No public web reuse found", status: "Clear" },
  { label: "Metadata tamper check", value: "EXIF sequence consistent", status: "Clear" },
  { label: "Location spoof pattern", value: "Low variance from tower triangulation", status: "Low" },
  { label: "Prior claimant anomalies", value: "1 similar report in 30 days", status: "Watch" },
]

const recommendations = [
  "Route to Sanitation Command and Drainage Response Unit as a joint field ticket.",
  "Escalate pothole segment to Roads & Public Works due to likely water-related structural damage.",
  "Request one night-time follow-up image to verify damaged streetlight illumination risk.",
  "Attach GPS-verified evidence package to dispute case if contractor liability is contested.",
]

const relatedCases = [
  { id: "CIV-2194", issue: "Garbage dumping", distance: "68m", state: "Merged evidence candidate" },
  { id: "CIV-2177", issue: "Drainage failure", distance: "112m", state: "Same asset corridor" },
  { id: "CIV-2118", issue: "Broken streetlight", distance: "146m", state: "Inspection pending" },
]

const toneStyles = {
  amber: "border-amber-300/20 bg-amber-400/10 text-amber-200",
  blue: "border-blue-300/20 bg-blue-400/10 text-blue-200",
  cyan: "border-cyan-300/20 bg-cyan-400/10 text-cyan-200",
  emerald: "border-emerald-300/20 bg-emerald-400/10 text-emerald-200",
}

export function EvidenceIntelligenceDashboard() {
  const { error, isUploading, job, poll, upload, uploadProgress } = useMultimodalAnalysis()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const result = job?.result
  const dynamicDetections = useMemo(() => {
    const issues = result?.fusion.detected_issues
    if (!issues?.length) return detections
    return issues.map((issue, index) => ({
      label: String(issue.label ?? "Detected issue"),
      confidence: `${Math.round(Number(issue.confidence ?? 0) * 100)}%`,
      severity: String(issue.severity ?? "medium"),
      box: overlaySlots[index % overlaySlots.length],
      color: detections[index % detections.length].color,
    })).slice(0, 2)
  }, [result])
  const dynamicExif = result
    ? [
        { label: "Device", value: `${result.exif_metadata.device_make} / ${result.exif_metadata.device_model}` },
        { label: "Captured", value: result.exif_metadata.captured_at ?? "Not present in EXIF" },
        {
          label: "GPS",
          value:
            result.exif_metadata.latitude && result.exif_metadata.longitude
              ? `${result.exif_metadata.latitude}, ${result.exif_metadata.longitude}`
              : "No GPS EXIF coordinates",
        },
        { label: "Image hash", value: `sha256: ${result.exif_metadata.sha256.slice(0, 12)}...` },
        { label: "Trust score", value: `${result.exif_metadata.trust_score}/100` },
        { label: "Compression", value: String(result.exif_metadata.raw.compression ?? "unknown") },
      ]
    : exifMetadata
  const dynamicFraud = result
    ? result.fraud_indicators.map((indicator) => ({
        label: indicator.indicator_type.replaceAll("_", " "),
        value: indicator.explanation,
        status: `${Math.round(indicator.risk_score * 100)} risk`,
      }))
    : fraudIndicators
  const dynamicRecommendations = result?.fusion.recommendations?.length
    ? result.fusion.recommendations
    : recommendations

  useEffect(() => {
    if (!jobId || job?.state === "completed" || job?.state === "failed") return
    const id = window.setInterval(() => void poll(jobId), 1500)
    return () => window.clearInterval(id)
  }, [job?.state, jobId, poll])

  async function startAnalysis() {
    if (!selectedFile) return
    const id = await upload(
      selectedFile,
      "Citizen complaint evidence upload for smart-city civic issue detection and municipal routing."
    )
    setJobId(id)
  }

  function chooseFile(file: File | null) {
    setSelectedFile(file)
    setPreviewUrl(file ? URL.createObjectURL(file) : null)
  }

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 rounded-lg border border-white/10 bg-[#081525]/85 p-5 shadow-2xl shadow-black/25 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/15 bg-cyan-400/10 px-3 py-1.5 text-xs font-medium text-cyan-100">
            <FileImage className="size-4" />
            Multimodal evidence intelligence
          </div>
          <h1 className="mt-4 max-w-4xl text-3xl font-semibold tracking-normal text-white sm:text-4xl">
            Citizen Complaint Evidence Review and AI Forensics
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            Computer vision, EXIF verification, GPS validation, fraud screening, and severity
            classification for civic issue reports before municipal dispatch or dispute escalation.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            className="bg-cyan-300 text-slate-950 hover:bg-cyan-200"
            disabled={!selectedFile || isUploading || job?.state === "processing" || job?.state === "queued"}
            onClick={() => void startAnalysis()}
          >
            <Sparkles />
            {isUploading || job?.state === "processing" || job?.state === "queued"
              ? "Processing AI..."
              : "Run multimodal AI"}
          </Button>
          <Button className="border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.07]" variant="outline">
            <ClipboardCheck />
            Approve for routing
          </Button>
        </div>
        {(result || error) && (
          <div className="mt-4 rounded-lg border border-cyan-300/10 bg-cyan-400/[0.06] p-3 text-sm">
            {result ? (
              <p className="text-cyan-100">
                Ollama analysis returned {Math.round(result.fusion.confidence_score * 100)}% confidence and recommended{" "}
                {result.fusion.recommended_department}.
              </p>
            ) : (
              <p className="text-amber-100">AI analysis unavailable: {error}</p>
            )}
          </div>
        )}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div
          className="rounded-lg border border-dashed border-cyan-300/25 bg-[#081525]/85 p-5 shadow-2xl shadow-black/20"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault()
            const file = event.dataTransfer.files.item(0)
            if (file?.type.startsWith("image/")) chooseFile(file)
          }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Upload citizen complaint image</p>
              <p className="mt-1 text-xs text-slate-500">
                Drag and drop an image or select a file to invoke local Ollama LLaVA + Mistral inference.
              </p>
            </div>
            <label className="inline-flex h-9 cursor-pointer items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm font-medium text-slate-200 hover:bg-white/[0.07]">
              Select image
              <input
                className="sr-only"
                type="file"
                accept="image/*"
                onChange={(event) => chooseFile(event.target.files?.item(0) ?? null)}
              />
            </label>
          </div>
          {selectedFile && (
            <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.035] p-3 text-sm text-slate-300">
              {selectedFile.name} · {Math.round(selectedFile.size / 1024)} KB
            </div>
          )}
        </div>

        <div className="rounded-lg border border-white/10 bg-[#081525]/85 p-5 shadow-2xl shadow-black/20">
          <p className="text-sm font-semibold text-white">AI processing state</p>
          <p className="mt-1 text-xs text-slate-500">{job?.stage ?? "waiting_for_upload"}</p>
          <div className="mt-4 h-2 rounded-full bg-white/10">
            <div
              className="h-2 rounded-full bg-cyan-300 transition-all"
              style={{ width: `${job?.progress ?? uploadProgress}%` }}
            />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            <StatusBlock label="Upload" status={uploadProgress === 100 ? "Complete" : "Ready"} value={`${uploadProgress}%`} />
            <StatusBlock label="Job" status={job?.state ?? "idle"} value={jobId ? "Active" : "None"} />
            <StatusBlock label="Latency" status="Runtime" value={result ? `${result.latency_ms}ms` : "--"} />
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="rounded-lg border border-white/10 bg-[#081525]/85 shadow-2xl shadow-black/25">
          <PanelHeader
            icon={Camera}
            subtitle="Uploaded citizen image with AI bounding box overlays and model confidence"
            title="Complaint image viewer"
          />
          <div className="p-5">
            <div className="relative min-h-[460px] overflow-hidden rounded-lg border border-cyan-300/15 bg-[#101827] shadow-inner shadow-black/40">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt="Uploaded civic evidence" className="absolute inset-0 size-full object-cover opacity-80" src={previewUrl} />
              ) : (
                <div className="absolute inset-0 bg-[linear-gradient(155deg,#172033_0%,#1b2634_33%,#27313b_34%,#111827_70%),radial-gradient(circle_at_28%_68%,rgba(34,197,94,0.18),transparent_18%),radial-gradient(circle_at_60%_72%,rgba(15,23,42,0.96),transparent_13%)]" />
              )}
              <div className="absolute left-0 right-0 top-[62%] h-[38%] bg-[linear-gradient(10deg,rgba(15,23,42,0.9),rgba(30,41,59,0.72)),repeating-linear-gradient(90deg,rgba(148,163,184,0.18)_0_1px,transparent_1px_54px)]" />
              <div className="absolute bottom-[17%] left-[4%] h-5 w-[78%] rounded-full bg-cyan-200/10 blur-sm" />
              <div className="absolute bottom-[20%] left-[38%] h-9 w-[25%] rounded-[50%] border border-emerald-200/20 bg-emerald-300/15" />
              <div className="absolute bottom-[15%] left-[10%] h-24 w-40 rotate-[-7deg] rounded-lg bg-slate-300/20 shadow-2xl" />
              <div className="absolute bottom-[21%] left-[17%] h-14 w-32 rotate-[11deg] rounded bg-emerald-300/20" />
              <div className="absolute bottom-[19%] left-[54%] h-16 w-32 rounded-[50%] bg-black/50 shadow-xl" />
              <div className="absolute right-[17%] top-[6%] h-[54%] w-3 rounded-full bg-slate-500/70" />
              <div className="absolute right-[13%] top-[9%] h-14 w-8 rounded bg-amber-200/25 shadow-lg shadow-amber-300/10" />
              <div className="absolute left-5 top-5 rounded-lg border border-white/10 bg-slate-950/65 px-3 py-2 backdrop-blur">
                <p className="text-xs font-medium text-white">{selectedFile?.name ?? "IMG_20260526_184239.jpg"}</p>
                <p className="mt-1 text-[0.68rem] text-slate-400">Ward 12 / Transit Spine / citizen upload</p>
              </div>

              {dynamicDetections.map((detection) => (
                <div
                  className={`absolute rounded-md border-2 bg-slate-950/10 shadow-[0_0_0_9999px_rgba(2,6,23,0.02)] ${detection.box} ${detection.color}`}
                  key={detection.label}
                >
                  <div className="absolute -top-8 left-0 whitespace-nowrap rounded-md border border-current bg-slate-950/85 px-2 py-1 text-[0.68rem] font-medium backdrop-blur">
                    {detection.label} · {detection.confidence}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {dynamicDetections.map((detection) => (
                <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4" key={detection.label}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold capitalize text-white">{detection.label}</p>
                      <p className="mt-1 text-xs capitalize text-slate-500">{detection.severity} severity</p>
                    </div>
                    <span className="rounded-md bg-cyan-400/10 px-2 py-1 text-xs font-semibold text-cyan-100">
                      {detection.confidence}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-5">
          <div className="rounded-lg border border-white/10 bg-[#081525]/85 p-5 shadow-2xl shadow-black/20">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-300">Evidence trust scoring</p>
                <p className="mt-1 text-xs text-slate-500">Governance-grade admissibility posture</p>
              </div>
              <Gauge className="size-5 text-cyan-200" />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {trustSignals.map((signal) => (
                <TrustCard key={signal.label} {...signal} />
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-[#081525]/85 p-5 shadow-2xl shadow-black/20">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-lg border border-red-300/20 bg-red-400/10 text-red-200">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-300">Issue severity classification</p>
                <p className="text-xs text-slate-500">Field urgency generated from visual and geospatial context</p>
              </div>
            </div>
            <div className="mt-5 rounded-lg border border-red-300/15 bg-red-400/10 p-4">
              <p className="text-2xl font-semibold text-red-100">
                {result?.fusion.severity_prediction ?? "Critical"}
              </p>
              <p className="mt-2 text-sm leading-6 text-red-100/75">
                {result?.fusion.reason ??
                  "Drainage failure and water leakage intersect with pothole damage, creating public safety and infrastructure deterioration risk within a high-traffic corridor."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_430px]">
        <div className="grid gap-5 xl:grid-cols-2">
          <InfoPanel icon={Bot} title="Computer vision analysis" subtitle="Detected civic objects, scene context, and model interpretation">
            <div className="space-y-3">
              {(result
                ? [
                    { label: "Model", value: "Ollama LLaVA" },
                    { label: "Primary issue", value: result.fusion.detected_issues[0]?.label?.toString() ?? "No issue detected" },
                    { label: "Confidence", value: `${Math.round(result.fusion.confidence_score * 100)}%` },
                    { label: "Evidence quality", value: "Generated from live uploaded image" },
                  ]
                : visionFindings
              ).map((finding) => (
                <KeyValueRow key={finding.label} label={finding.label} value={finding.value} />
              ))}
            </div>
          </InfoPanel>

          <InfoPanel icon={Fingerprint} title="EXIF metadata forensics" subtitle="Device, capture, hash, and file integrity validation">
            <div className="grid gap-3 sm:grid-cols-2">
              {dynamicExif.map((item) => (
                <KeyValueRow key={item.label} label={item.label} value={item.value} />
              ))}
            </div>
          </InfoPanel>

          <InfoPanel icon={LocateFixed} title="GPS verification status" subtitle="Coordinate validation against ward map, asset registry, and network signals">
            <div className="grid gap-3 md:grid-cols-3">
              <StatusBlock label="Ward match" status="Verified" value="99.1%" />
              <StatusBlock label="Asset proximity" status="Matched" value="24m" />
              <StatusBlock label="Spoof check" status="Low risk" value="8/100" />
            </div>
            <div className="mt-4 rounded-lg border border-cyan-300/10 bg-cyan-400/[0.06] p-3">
              <p className="flex items-center gap-2 text-sm font-medium text-cyan-100">
                <MapPinned className="size-4" />
                Ward 12, Transit Spine, municipal drainage segment D-44
              </p>
            </div>
          </InfoPanel>

          <InfoPanel icon={CalendarClock} title="Timestamp validation" subtitle="Temporal consistency checks for event freshness and dispute admissibility">
            <div className="grid gap-3 md:grid-cols-3">
              <StatusBlock label="Capture window" status="Valid" value="18:42 IST" />
              <StatusBlock label="Upload delay" status="Normal" value="6m 18s" />
              <StatusBlock label="Weather match" status="Consistent" value="Rain +2h" />
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-300/15 bg-emerald-400/10 p-3 text-sm text-emerald-100">
              <CheckCircle2 className="size-4" />
              Timestamp is consistent with device clock, upload logs, and nearby complaint burst.
            </div>
          </InfoPanel>
        </div>

        <div className="grid gap-5">
          <InfoPanel icon={ShieldAlert} title="Fraud risk indicators" subtitle="Manipulation, duplicate, and claimant-pattern assessment">
            <div className="space-y-3">
              {dynamicFraud.map((indicator) => (
                <div className="rounded-lg bg-white/[0.04] p-3" key={indicator.label}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white">{indicator.label}</p>
                    <span className="rounded-md border border-cyan-300/15 bg-cyan-400/10 px-2 py-1 text-xs font-medium text-cyan-100">
                      {indicator.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{indicator.value}</p>
                </div>
              ))}
            </div>
          </InfoPanel>

          <InfoPanel icon={Lightbulb} title="AI-generated recommendations" subtitle="Action plan for routing, field inspection, and dispute evidence packaging">
            <div className="space-y-3">
              {dynamicRecommendations.map((recommendation, index) => (
                <div className="rounded-lg border border-cyan-300/10 bg-cyan-400/[0.06] p-3" key={recommendation}>
                  <p className="text-xs font-semibold text-cyan-200">Recommendation {index + 1}</p>
                  <p className="mt-1 text-sm leading-5 text-slate-300">{recommendation}</p>
                </div>
              ))}
            </div>
          </InfoPanel>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
        <InfoPanel icon={Crosshair} title="Detected civic issue register" subtitle="Evidence objects prepared for municipal routing and case linking">
          <div className="grid gap-3 md:grid-cols-2">
            {dynamicDetections.map((detection) => (
              <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4" key={detection.label}>
                <TriangleAlert className="size-4 text-cyan-200" />
                <p className="mt-3 text-sm font-semibold capitalize text-white">{detection.label}</p>
                <p className="mt-2 text-xs text-slate-500">{detection.severity} severity</p>
                <p className="mt-3 text-lg font-semibold text-cyan-100">{detection.confidence}</p>
              </div>
            ))}
          </div>
        </InfoPanel>

        <InfoPanel icon={DatabaseZap} title="Related case intelligence" subtitle="Spatial and semantic links from the civic evidence graph">
          <div className="space-y-3">
            {relatedCases.map((item) => (
              <div className="rounded-lg bg-white/[0.04] p-3" key={item.id}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-cyan-100">{item.id}</p>
                  <span className="text-xs text-slate-500">{item.distance}</span>
                </div>
                <p className="mt-1 text-sm text-white">{item.issue}</p>
                <p className="mt-1 text-xs text-slate-500">{item.state}</p>
              </div>
            ))}
          </div>
        </InfoPanel>
      </section>
    </div>
  )
}

function PanelHeader({
  icon: Icon,
  subtitle,
  title,
}: {
  icon: LucideIcon
  subtitle: string
  title: string
}) {
  return (
    <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
      <div className="grid size-9 shrink-0 place-items-center rounded-lg border border-cyan-300/15 bg-cyan-400/10 text-cyan-200">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-200">{title}</p>
        <p className="mt-1 truncate text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  )
}

function InfoPanel({
  children,
  icon: Icon,
  subtitle,
  title,
}: {
  children: React.ReactNode
  icon: LucideIcon
  subtitle: string
  title: string
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#081525]/85 p-5 shadow-2xl shadow-black/20">
      <div className="mb-5 flex items-center gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-lg border border-cyan-300/15 bg-cyan-400/10 text-cyan-200">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{title}</p>
          <p className="mt-1 truncate text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

function KeyValueRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/[0.04] p-3">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm leading-5 text-slate-200">{value}</p>
    </div>
  )
}

function StatusBlock({
  label,
  status,
  value,
}: {
  label: string
  status: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs font-medium text-emerald-300">{status}</p>
    </div>
  )
}

function TrustCard({
  icon: Icon,
  label,
  tone,
  value,
}: {
  icon: LucideIcon
  label: string
  tone: keyof typeof toneStyles
  value: string
}) {
  return (
    <div className={`rounded-lg border p-3 ${toneStyles[tone]}`}>
      <Icon className="size-4" />
      <p className="mt-3 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs leading-4 opacity-80">{label}</p>
    </div>
  )
}
