"use client"

import type { LucideIcon } from "lucide-react"
import {
  Activity,
  ArrowRight,
  Braces,
  BrainCircuit,
  CircuitBoard,
  Code2,
  Cpu,
  DatabaseZap,
  Eye,
  FileJson,
  Fingerprint,
  GitBranch,
  Gauge,
  Layers3,
  Network,
  RadioTower,
  Route,
  Server,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  TimerReset,
  Workflow,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Button } from "@/components/ui/button"
import { useTelemetryRuntime } from "@/hooks/use-civic-api"
import type { TelemetryMetric } from "@/lib/api/types"

const workflow = [
  { label: "Citizen Upload", icon: Sparkles, latency: "84ms", state: "ingesting", confidence: "source: verified" },
  { label: "FastAPI Gateway", icon: Server, latency: "41ms", state: "healthy", confidence: "p95 118ms" },
  { label: "Mistral 7B", icon: BrainCircuit, latency: "1.42s", state: "reasoning", confidence: "92.4%" },
  { label: "LLaVA Vision Analysis", icon: Eye, latency: "2.18s", state: "vision", confidence: "94.8%" },
  { label: "EXIF Validation", icon: Fingerprint, latency: "226ms", state: "forensic", confidence: "98.1%" },
  { label: "Evidence Fusion Engine", icon: DatabaseZap, latency: "612ms", state: "fusion", confidence: "91.7%" },
  { label: "Confidence Routing", icon: Route, latency: "177ms", state: "routing", confidence: "89.6%" },
  { label: "Municipal Assignment", icon: BuildingIcon, latency: "93ms", state: "assigned", confidence: "SLA mapped" },
]

const serviceMetrics = [
  { label: "FastAPI uptime", value: "99.982%", detail: "gateway pods: 6/6", icon: Server, tone: "emerald" },
  { label: "API p95 latency", value: "318ms", detail: "ingest + inference orchestration", icon: TimerReset, tone: "cyan" },
  { label: "Requests / min", value: "2,846", detail: "peak ward burst: 312 rpm", icon: Activity, tone: "blue" },
  { label: "Error budget burn", value: "2.1%", detail: "within civic SLA", icon: ShieldCheck, tone: "emerald" },
  { label: "Queue depth", value: "1,204", detail: "priority lane: 88 critical", icon: Layers3, tone: "amber" },
  { label: "GPU utilization", value: "76%", detail: "A10G pool, 4 workers", icon: Cpu, tone: "violet" },
] satisfies Array<{
  detail: string
  icon: LucideIcon
  label: string
  tone: keyof typeof toneClasses
  value: string
}>

const latencyData = [
  { t: "10:00", gateway: 44, mistral: 1240, llava: 2100, fusion: 530 },
  { t: "10:05", gateway: 39, mistral: 1320, llava: 2180, fusion: 590 },
  { t: "10:10", gateway: 52, mistral: 1460, llava: 2360, fusion: 620 },
  { t: "10:15", gateway: 47, mistral: 1380, llava: 2290, fusion: 640 },
  { t: "10:20", gateway: 61, mistral: 1580, llava: 2510, fusion: 710 },
  { t: "10:25", gateway: 43, mistral: 1420, llava: 2180, fusion: 612 },
]

const tokenData = [
  { model: "Mistral 7B", prompt: 18400, completion: 9200 },
  { model: "LLaVA", prompt: 7600, completion: 4200 },
  { model: "Fusion", prompt: 5200, completion: 3100 },
  { model: "Routing", prompt: 2900, completion: 1800 },
]

const queueData = [
  { lane: "Critical", queued: 88, processing: 31 },
  { lane: "High", queued: 342, processing: 96 },
  { lane: "Medium", queued: 551, processing: 124 },
  { lane: "Appeals", queued: 223, processing: 42 },
]

const resourceData = [
  { name: "GPU", value: 76, color: "#22d3ee" },
  { name: "VRAM", value: 68, color: "#60a5fa" },
  { name: "CPU", value: 54, color: "#34d399" },
  { name: "RAM", value: 71, color: "#fbbf24" },
  { name: "Disk IO", value: 39, color: "#a78bfa" },
]

const requests = [
  { id: "req_8fd2", route: "POST /api/v1/complaints/upload", status: "202", latency: "286ms", model: "gateway", risk: "low" },
  { id: "req_8fd3", route: "POST /api/v1/inference/vision", status: "200", latency: "2.31s", model: "LLaVA", risk: "medium" },
  { id: "req_8fd4", route: "POST /api/v1/evidence/fuse", status: "200", latency: "644ms", model: "fusion", risk: "low" },
  { id: "req_8fd5", route: "POST /api/v1/routing/assign", status: "200", latency: "181ms", model: "router", risk: "high" },
]

const traceSteps = [
  { step: "Normalize complaint text", detail: "Detected civic issue: drainage failure with water leakage and road damage.", ms: "142ms" },
  { step: "Mistral reasoning", detail: "Classified urgency as Critical because infrastructure deterioration intersects public safety.", ms: "1.42s" },
  { step: "LLaVA visual grounding", detail: "Confirmed pothole, standing water, dumping debris, and damaged streetlight context.", ms: "2.18s" },
  { step: "EXIF forensic validation", detail: "GPS and timestamp consistent with ward asset registry and upload log.", ms: "226ms" },
  { step: "Fusion decision", detail: "Evidence confidence 91.7%; route to Drainage Response Unit and Roads & Public Works.", ms: "612ms" },
]

const apiEndpoints = [
  { method: "POST", path: "/api/v1/complaints/upload", desc: "Citizen media and complaint intake" },
  { method: "POST", path: "/api/v1/inference/reason", desc: "Mistral 7B civic reasoning pass" },
  { method: "POST", path: "/api/v1/inference/vision", desc: "LLaVA visual issue detection" },
  { method: "POST", path: "/api/v1/evidence/validate-exif", desc: "Forensic metadata verification" },
  { method: "POST", path: "/api/v1/evidence/fuse", desc: "Confidence-weighted evidence fusion" },
  { method: "POST", path: "/api/v1/routing/assign", desc: "Municipal department assignment" },
]

const jsonResponse = `{
  "case_id": "CIV-4405",
  "status": "assigned",
  "severity": "critical",
  "confidence_routing": {
    "department": "Drainage Response Unit",
    "score": 0.917,
    "secondary_department": "Roads & Public Works"
  },
  "models": {
    "mistral_7b": { "confidence": 0.924, "latency_ms": 1420 },
    "llava": { "confidence": 0.948, "latency_ms": 2180 },
    "exif_validator": { "confidence": 0.981, "latency_ms": 226 }
  },
  "fraud_risk": "low",
  "sla": "critical_4h_response"
}`

const tooltipStyle = {
  background: "#071524",
  border: "1px solid rgba(103, 232, 249, 0.18)",
  borderRadius: 8,
  color: "#e2e8f0",
}

const toneClasses = {
  amber: "border-amber-300/20 bg-amber-400/10 text-amber-200",
  blue: "border-blue-300/20 bg-blue-400/10 text-blue-200",
  cyan: "border-cyan-300/20 bg-cyan-400/10 text-cyan-200",
  emerald: "border-emerald-300/20 bg-emerald-400/10 text-emerald-200",
  red: "border-red-300/20 bg-red-400/10 text-red-200",
  violet: "border-violet-300/20 bg-violet-400/10 text-violet-200",
}

function metricValue(metrics: TelemetryMetric[] | null, metricName: string) {
  return metrics?.find((metric) => metric.metric_name === metricName)?.metric_value
}

export function ObservabilityDashboard() {
  const { data: telemetry, error: telemetryError, isLoading: telemetryLoading } = useTelemetryRuntime()
  const p95Latency = metricValue(telemetry, "p95_latency_ms")
  const gpuUtilization = metricValue(telemetry, "gpu_utilization")
  const queueDepth = metricValue(telemetry, "queue_depth")
  const routeAccuracy = metricValue(telemetry, "routing_accuracy")
  const liveServiceMetrics = serviceMetrics.map((metric) => {
    if (metric.label === "API p95 latency" && p95Latency !== undefined) {
      return { ...metric, value: `${p95Latency}ms`, detail: "live from /telemetry/runtime" }
    }
    if (metric.label === "GPU utilization" && gpuUtilization !== undefined) {
      return { ...metric, value: `${gpuUtilization}%`, detail: "live Mistral/LLaVA resource pool" }
    }
    if (metric.label === "Queue depth" && queueDepth !== undefined) {
      return { ...metric, value: queueDepth.toLocaleString(), detail: "live high-priority inference queue" }
    }
    if (metric.label === "Error budget burn" && routeAccuracy !== undefined) {
      return { ...metric, value: `${Math.round((100 - routeAccuracy) * 10) / 10}%`, detail: `${routeAccuracy}% routing accuracy` }
    }
    return telemetryLoading ? { ...metric, value: "..." } : metric
  })

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 rounded-lg border border-white/10 bg-[#081525]/85 p-5 shadow-2xl shadow-black/25 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/15 bg-cyan-400/10 px-3 py-1.5 text-xs font-medium text-cyan-100">
            <RadioTower className="size-4" />
            AI pipeline observability
          </div>
          <h1 className="mt-4 max-w-4xl text-3xl font-semibold tracking-normal text-white sm:text-4xl">
            Civic AI Runtime, Model, and API Monitoring
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            Production-grade SOC/NOC view for FastAPI orchestration, Mistral 7B reasoning,
            LLaVA vision analysis, EXIF forensics, evidence fusion, routing, queues, and GPU resources.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className="bg-cyan-300 text-slate-950 hover:bg-cyan-200">
            <TerminalSquare />
            Open runbook
          </Button>
          <Button className="border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.07]" variant="outline">
            <Code2 />
            API explorer
          </Button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {liveServiceMetrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>
      {telemetryError && (
        <p className="rounded-lg border border-amber-300/15 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">
          Backend telemetry unavailable: {telemetryError}
        </p>
      )}

      <section className="rounded-lg border border-white/10 bg-[#081525]/85 p-5 shadow-2xl shadow-black/25">
        <PanelTitle icon={Workflow} subtitle="Citizen upload to municipal department assignment" title="AI workflow visualization" />
        <div className="mt-5 grid gap-3 xl:grid-cols-8">
          {workflow.map((node, index) => (
            <div className="relative" key={node.label}>
              <div className="h-full rounded-lg border border-cyan-300/15 bg-white/[0.035] p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="grid size-9 place-items-center rounded-lg border border-cyan-300/20 bg-cyan-400/10 text-cyan-200">
                    <node.icon className="size-4" />
                  </div>
                  <span className="text-xs font-semibold text-cyan-100">{node.latency}</span>
                </div>
                <p className="mt-3 text-sm font-semibold text-white">{node.label}</p>
                <p className="mt-1 text-xs capitalize text-slate-500">{node.state}</p>
                <p className="mt-3 text-xs text-slate-400">{node.confidence}</p>
              </div>
              {index < workflow.length - 1 && (
                <ArrowRight className="absolute -right-3 top-1/2 z-10 hidden size-5 -translate-y-1/2 text-cyan-200 xl:block" />
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
        <ChartPanel icon={TimerReset} title="API latency metrics" subtitle="FastAPI gateway and model-stage latency in milliseconds">
          <ResponsiveContainer height={260} width="100%">
            <LineChart data={latencyData} margin={{ left: -20, right: 10, top: 10 }}>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
              <XAxis dataKey="t" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} />
              <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line dataKey="gateway" name="FastAPI" stroke="#22d3ee" strokeWidth={2.2} type="monotone" />
              <Line dataKey="mistral" name="Mistral 7B" stroke="#60a5fa" strokeWidth={2.2} type="monotone" />
              <Line dataKey="llava" name="LLaVA" stroke="#a78bfa" strokeWidth={2.2} type="monotone" />
              <Line dataKey="fusion" name="Fusion" stroke="#34d399" strokeWidth={2.2} type="monotone" />
            </LineChart>
          </ResponsiveContainer>
        </ChartPanel>

        <div className="rounded-lg border border-white/10 bg-[#081525]/85 p-5 shadow-2xl shadow-black/20">
          <PanelTitle icon={Gauge} subtitle="Simulated GPU, memory, CPU, and IO saturation" title="GPU/resource metrics" />
          <div className="mt-5 space-y-4">
            {resourceData.map((resource) => (
              <div key={resource.name}>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">{resource.name}</span>
                  <span className="font-medium text-slate-200">{resource.value}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      backgroundColor: resource.color,
                      width: `${resource.name === "GPU" && gpuUtilization !== undefined ? gpuUtilization : resource.value}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <ChartPanel icon={Braces} title="Token usage analytics" subtitle="Prompt and completion token volume by model stage">
          <ResponsiveContainer height={260} width="100%">
            <BarChart data={tokenData} margin={{ bottom: 8, left: -18, right: 8, top: 8 }}>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
              <XAxis dataKey="model" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} />
              <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(34, 211, 238, 0.06)" }} />
              <Bar dataKey="prompt" fill="#22d3ee" name="Prompt tokens" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completion" fill="#60a5fa" name="Completion tokens" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>

        <ChartPanel icon={Layers3} title="Queue monitoring" subtitle="Priority lanes, processing workers, and backlog pressure">
          <ResponsiveContainer height={260} width="100%">
            <AreaChart data={queueData} margin={{ left: -18, right: 12, top: 8 }}>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
              <XAxis dataKey="lane" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} />
              <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area dataKey="queued" fill="#22d3ee" fillOpacity={0.26} name="Queued" stroke="#22d3ee" strokeWidth={2} type="monotone" />
              <Area dataKey="processing" fill="#34d399" fillOpacity={0.22} name="Processing" stroke="#34d399" strokeWidth={2} type="monotone" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartPanel>
      </section>

      <section className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_430px]">
        <div className="rounded-lg border border-white/10 bg-[#081525]/85 shadow-2xl shadow-black/20">
          <PanelHeader icon={Network} subtitle="Recent FastAPI requests and inference orchestration calls" title="Request monitoring panels" />
          <div className="divide-y divide-white/10">
            {requests.map((request) => (
              <div className="grid gap-3 px-5 py-4 md:grid-cols-[110px_minmax(0,1fr)_80px_90px_90px]" key={request.id}>
                <span className="text-sm font-semibold text-cyan-100">{request.id}</span>
                <span className="truncate text-sm text-slate-300">{request.route}</span>
                <span className="text-sm text-emerald-200">{request.status}</span>
                <span className="text-sm text-slate-400">{request.latency}</span>
                <span className="text-sm capitalize text-amber-200">{request.risk}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-[#081525]/85 p-5 shadow-2xl shadow-black/20">
          <PanelTitle icon={GitBranch} subtitle="Confidence-weighted model decision path" title="Routing visualization" />
          <div className="mt-5 space-y-3">
            <RouteRow label="Drainage Response Unit" score="91.7%" width="92%" tone="cyan" />
            <RouteRow label="Roads & Public Works" score="84.3%" width="84%" tone="blue" />
            <RouteRow label="Sanitation Command" score="63.8%" width="64%" tone="amber" />
            <RouteRow label="Electrical Maintenance" score="48.9%" width="49%" tone="violet" />
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_430px]">
        <div className="rounded-lg border border-white/10 bg-[#081525]/85 shadow-2xl shadow-black/20">
          <PanelHeader icon={BrainCircuit} subtitle="Stepwise AI reasoning trace for one civic complaint execution" title="AI reasoning trace viewer" />
          <div className="p-5">
            <div className="space-y-3">
              {traceSteps.map((trace, index) => (
                <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4" key={trace.step}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-white">
                      {index + 1}. {trace.step}
                    </p>
                    <span className="text-xs font-medium text-cyan-100">{trace.ms}</span>
                  </div>
                  <p className="mt-2 text-sm leading-5 text-slate-400">{trace.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-[#081525]/85 shadow-2xl shadow-black/20">
          <PanelHeader icon={FileJson} subtitle="Model output and routing contract response" title="JSON response inspector" />
          <pre className="m-5 max-h-[430px] overflow-auto rounded-lg border border-cyan-300/10 bg-slate-950/70 p-4 text-xs leading-5 text-cyan-50">
            {jsonResponse}
          </pre>
        </div>
      </section>

      <section className="rounded-lg border border-white/10 bg-[#081525]/85 shadow-2xl shadow-black/20">
        <PanelHeader icon={TerminalSquare} subtitle="Swagger/OpenAPI-inspired service explorer for civic AI endpoints" title="API explorer" />
        <div className="grid gap-3 p-5 lg:grid-cols-3">
          {apiEndpoints.map((endpoint) => (
            <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4" key={endpoint.path}>
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-emerald-300/20 bg-emerald-400/10 px-2 py-1 text-xs font-semibold text-emerald-200">
                  {endpoint.method}
                </span>
                <span className="truncate font-mono text-xs text-cyan-100">{endpoint.path}</span>
              </div>
              <p className="mt-3 text-sm leading-5 text-slate-400">{endpoint.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function BuildingIcon(props: React.ComponentProps<"svg">) {
  return <CircuitBoard {...props} />
}

function MetricCard({
  detail,
  icon: Icon,
  label,
  tone,
  value,
}: {
  detail: string
  icon: LucideIcon
  label: string
  tone: keyof typeof toneClasses
  value: string
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#081525]/85 p-4 shadow-xl shadow-black/20">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
        </div>
        <div className={`grid size-9 place-items-center rounded-lg border ${toneClasses[tone]}`}>
          <Icon className="size-4" />
        </div>
      </div>
      <p className="mt-3 text-xs leading-4 text-slate-500">{detail}</p>
    </div>
  )
}

function PanelTitle({ icon: Icon, subtitle, title }: { icon: LucideIcon; subtitle: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-10 place-items-center rounded-lg border border-cyan-300/15 bg-cyan-400/10 text-cyan-200">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">{title}</p>
        <p className="mt-1 truncate text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  )
}

function PanelHeader({ icon: Icon, subtitle, title }: { icon: LucideIcon; subtitle: string; title: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
      <div className="grid size-9 place-items-center rounded-lg border border-cyan-300/15 bg-cyan-400/10 text-cyan-200">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-slate-200">{title}</p>
        <p className="mt-1 truncate text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  )
}

function ChartPanel({
  children,
  icon,
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
      <div className="mb-4">
        <PanelTitle icon={icon} subtitle={subtitle} title={title} />
      </div>
      {children}
    </div>
  )
}

function RouteRow({
  label,
  score,
  tone,
  width,
}: {
  label: string
  score: string
  tone: "amber" | "blue" | "cyan" | "violet"
  width: string
}) {
  const colors = {
    amber: "bg-amber-300",
    blue: "bg-blue-300",
    cyan: "bg-cyan-300",
    violet: "bg-violet-300",
  }

  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-slate-400">{label}</span>
        <span className="font-medium text-slate-200">{score}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-white/10">
        <div className={`h-2 rounded-full ${colors[tone]}`} style={{ width }} />
      </div>
    </div>
  )
}
