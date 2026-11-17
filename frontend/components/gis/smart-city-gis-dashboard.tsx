"use client"

import { useMemo, useState } from "react"
import L from "leaflet"
import {
  Circle,
  CircleMarker,
  MapContainer,
  Marker,
  Polygon,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
} from "react-leaflet"
import {
  AlertTriangle,
  Bot,
  Building2,
  CheckCircle2,
  Filter,
  Flame,
  GitBranch,
  Layers3,
  MapPinned,
  RadioTower,
  Route,
  ShieldAlert,
  Siren,
  TimerReset,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useGisIssues } from "@/hooks/use-civic-api"
import type { GisIssue } from "@/lib/api/types"

type Severity = "Critical" | "High" | "Medium"
type Status = "New" | "AI Routed" | "Field Assigned" | "In Progress" | "Resolved" | "Escalated"

type Incident = {
  id: string
  category: string
  department: string
  status: Status
  severity: Severity
  confidence: number
  risk: number
  position: [number, number]
  district: string
  age: string
}

const center: [number, number] = [12.9719, 77.5946]

const incidents: Incident[] = [
  {
    id: "GIS-4401",
    category: "Illegal garbage dumping",
    department: "Sanitation Command",
    status: "AI Routed",
    severity: "High",
    confidence: 94,
    risk: 62,
    position: [12.9782, 77.5856],
    district: "North Market",
    age: "4m",
  },
  {
    id: "GIS-4402",
    category: "Road potholes",
    department: "Roads & Public Works",
    status: "Escalated",
    severity: "Critical",
    confidence: 91,
    risk: 84,
    position: [12.9664, 77.6041],
    district: "Transit Spine",
    age: "7m",
  },
  {
    id: "GIS-4403",
    category: "Water leakage",
    department: "Water Utility Cell",
    status: "Field Assigned",
    severity: "High",
    confidence: 88,
    risk: 57,
    position: [12.9824, 77.6028],
    district: "Utility Grid East",
    age: "11m",
  },
  {
    id: "GIS-4404",
    category: "Damaged streetlights",
    department: "Electrical Maintenance",
    status: "In Progress",
    severity: "Medium",
    confidence: 86,
    risk: 31,
    position: [12.9608, 77.5889],
    district: "Civic Center",
    age: "18m",
  },
  {
    id: "GIS-4405",
    category: "Drainage failures",
    department: "Drainage Response Unit",
    status: "Escalated",
    severity: "Critical",
    confidence: 93,
    risk: 89,
    position: [12.9721, 77.6136],
    district: "Canal Belt",
    age: "21m",
  },
  {
    id: "GIS-4406",
    category: "Illegal garbage dumping",
    department: "Sanitation Command",
    status: "New",
    severity: "Medium",
    confidence: 82,
    risk: 44,
    position: [12.9887, 77.5918],
    district: "North Market",
    age: "25m",
  },
  {
    id: "GIS-4407",
    category: "Road potholes",
    department: "Roads & Public Works",
    status: "AI Routed",
    severity: "High",
    confidence: 90,
    risk: 66,
    position: [12.9579, 77.612],
    district: "Transit Spine",
    age: "28m",
  },
]

const jurisdictions = [
  {
    name: "Sanitation North",
    department: "Sanitation Command",
    color: "#22d3ee",
    points: [
      [12.991, 77.578],
      [12.991, 77.6],
      [12.973, 77.601],
      [12.974, 77.579],
    ] as [number, number][],
  },
  {
    name: "Transit Works",
    department: "Roads & Public Works",
    color: "#f87171",
    points: [
      [12.973, 77.594],
      [12.967, 77.621],
      [12.953, 77.615],
      [12.958, 77.591],
    ] as [number, number][],
  },
  {
    name: "Canal Utility Belt",
    department: "Drainage Response Unit",
    color: "#a78bfa",
    points: [
      [12.982, 77.606],
      [12.976, 77.622],
      [12.962, 77.616],
      [12.968, 77.604],
    ] as [number, number][],
  },
]

const districtMetrics = [
  { district: "North Market", open: 218, sla: "78%", density: "High", crews: 6 },
  { district: "Transit Spine", open: 306, sla: "61%", density: "Critical", crews: 9 },
  { district: "Utility Grid East", open: 144, sla: "74%", density: "Elevated", crews: 5 },
  { district: "Canal Belt", open: 231, sla: "58%", density: "Critical", crews: 8 },
]

const filters = ["All", "Critical", "High", "Medium"] as const

const severityColor = {
  Critical: "#f87171",
  High: "#fbbf24",
  Medium: "#22d3ee",
}

const statusTone: Record<Status, string> = {
  New: "text-slate-300",
  "AI Routed": "text-cyan-200",
  "Field Assigned": "text-blue-200",
  "In Progress": "text-amber-200",
  Resolved: "text-emerald-200",
  Escalated: "text-red-200",
}

function normalizeSeverity(severity: string): Severity {
  const normalized = severity.toLowerCase()
  if (normalized === "critical") return "Critical"
  if (normalized === "high") return "High"
  return "Medium"
}

function normalizeStatus(status: string): Status {
  const normalized = status.toLowerCase()
  if (normalized.includes("escalated")) return "Escalated"
  if (normalized.includes("field")) return "Field Assigned"
  if (normalized.includes("progress")) return "In Progress"
  if (normalized.includes("resolved")) return "Resolved"
  if (normalized.includes("routed")) return "AI Routed"
  return "New"
}

function incidentFromApi(issue: GisIssue): Incident {
  return {
    id: issue.complaint_public_id,
    age: "live",
    category: issue.issue_category,
    confidence: Math.round(issue.ai_confidence * 100),
    department: issue.department,
    district: issue.ward,
    position: [issue.latitude, issue.longitude],
    risk: Math.round(issue.escalation_risk * 100),
    severity: normalizeSeverity(issue.severity),
    status: normalizeStatus(issue.status),
  }
}

function markerIcon(incident: Incident) {
  const color = severityColor[incident.severity]

  return L.divIcon({
    className: "",
    html: `<div style="width:30px;height:30px;border-radius:10px;background:${color};box-shadow:0 0 0 5px rgba(15,23,42,.78),0 0 22px ${color};border:1px solid rgba(255,255,255,.55);display:grid;place-items:center;color:#020617;font-weight:800;font-size:11px;">${incident.confidence}</div>`,
    iconAnchor: [15, 15],
    popupAnchor: [0, -14],
  })
}

export function SmartCityGisDashboard() {
  const [severityFilter, setSeverityFilter] = useState<(typeof filters)[number]>("All")
  const { data: apiIssues, error, isLoading } = useGisIssues()
  const sourceIncidents = apiIssues?.length ? apiIssues.map(incidentFromApi) : incidents

  const visibleIncidents = useMemo(
    () =>
      sourceIncidents.filter(
        (incident) => severityFilter === "All" || incident.severity === severityFilter
      ),
    [severityFilter, sourceIncidents]
  )

  const densityCenter = useMemo(() => {
    const critical = visibleIncidents.filter((incident) => incident.severity === "Critical")
    return critical.length ? critical : visibleIncidents
  }, [visibleIncidents])

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 rounded-lg border border-white/10 bg-[#081525]/85 p-5 shadow-2xl shadow-black/25 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/15 bg-cyan-400/10 px-3 py-1.5 text-xs font-medium text-cyan-100">
            <MapPinned className="size-4" />
            Smart-city GIS command
          </div>
          <h1 className="mt-4 max-w-4xl text-3xl font-semibold tracking-normal text-white sm:text-4xl">
            Real-Time Civic Complaint GIS Monitoring
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            Leaflet-powered operational map for complaint heatmaps, AI routing overlays,
            severity clusters, municipal jurisdictions, and department response monitoring.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className="bg-cyan-300 text-slate-950 hover:bg-cyan-200">
            <Route />
            Optimize routing
          </Button>
          <Button className="border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.07]" variant="outline">
            <Layers3 />
            Layer controls
          </Button>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="overflow-hidden rounded-lg border border-white/10 bg-[#081525]/85 shadow-2xl shadow-black/25">
          <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Live municipal incident map</p>
              <p className="mt-1 text-xs text-slate-500">
                {isLoading
                  ? "Loading backend GIS issue feed..."
                  : error
                    ? `Backend GIS feed unavailable: ${error}`
                    : "Complaint density, severity overlays, AI confidence markers, and response jurisdictions"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <Filter className="size-3.5" />
                Severity
              </span>
              {filters.map((filter) => (
                <button
                  className={`h-8 rounded-lg border px-3 text-xs font-medium transition ${
                    severityFilter === filter
                      ? "border-cyan-300/30 bg-cyan-400/15 text-cyan-100"
                      : "border-white/10 bg-white/[0.04] text-slate-400 hover:text-white"
                  }`}
                  key={filter}
                  onClick={() => setSeverityFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[660px]">
            <MapContainer center={center} className="h-full w-full civic-leaflet" maxZoom={16} minZoom={12} zoom={14}>
              <TileLayer
                attribution="&copy; OpenStreetMap contributors &copy; CARTO"
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />

              {jurisdictions.map((zone) => (
                <Polygon
                  eventHandlers={{}}
                  key={zone.name}
                  pathOptions={{
                    color: zone.color,
                    fillColor: zone.color,
                    fillOpacity: 0.08,
                    opacity: 0.55,
                    weight: 2,
                  }}
                  positions={zone.points}
                >
                  <Tooltip sticky>
                    <div className="text-xs">
                      <strong>{zone.name}</strong>
                      <br />
                      {zone.department}
                    </div>
                  </Tooltip>
                </Polygon>
              ))}

              {densityCenter.map((incident) => (
                <Circle
                  center={incident.position}
                  key={`${incident.id}-heat`}
                  pathOptions={{
                    color: severityColor[incident.severity],
                    fillColor: severityColor[incident.severity],
                    fillOpacity: incident.severity === "Critical" ? 0.22 : 0.14,
                    opacity: 0.2,
                    weight: 1,
                  }}
                  radius={incident.severity === "Critical" ? 430 : 310}
                />
              ))}

              {visibleIncidents.map((incident) => (
                <CircleMarker
                  center={incident.position}
                  key={`${incident.id}-confidence`}
                  pathOptions={{
                    color: "#67e8f9",
                    fillColor: "#22d3ee",
                    fillOpacity: Math.max(0.15, incident.confidence / 450),
                    opacity: 0.45,
                    weight: 1,
                  }}
                  radius={8 + incident.confidence / 12}
                />
              ))}

              {visibleIncidents.map((incident) => (
                <Polyline
                  key={`${incident.id}-route`}
                  pathOptions={{
                    color: incident.risk > 75 ? "#f87171" : "#22d3ee",
                    dashArray: "6 8",
                    opacity: 0.55,
                    weight: 2,
                  }}
                  positions={[incident.position, center]}
                />
              ))}

              {visibleIncidents.map((incident) => (
                <Marker icon={markerIcon(incident)} key={incident.id} position={incident.position}>
                  <Popup>
                    <div className="min-w-[220px] text-slate-900">
                      <p className="text-sm font-bold">{incident.id}</p>
                      <p className="mt-1 text-xs">{incident.category}</p>
                      <div className="mt-3 grid gap-1 text-xs">
                        <span>Department: {incident.department}</span>
                        <span>Status: {incident.status}</span>
                        <span>Severity: {incident.severity}</span>
                        <span>AI confidence: {incident.confidence}%</span>
                        <span>Escalation risk: {incident.risk}%</span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        <div className="grid gap-5">
          <MetricPanel />
          <div className="rounded-lg border border-white/10 bg-[#081525]/85 p-5 shadow-2xl shadow-black/20">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-lg border border-cyan-300/20 bg-cyan-400/10 text-cyan-200">
                <Flame className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-300">Complaint density analytics</p>
                <p className="text-xs text-slate-500">Heatmap intensity and geographic concentration</p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              <ProgressRow label="Transit Spine critical density" tone="red" value="91%" />
              <ProgressRow label="Canal Belt drainage saturation" tone="violet" value="84%" />
              <ProgressRow label="North Market dumping cluster" tone="cyan" value="72%" />
              <ProgressRow label="Utility Grid leakage pressure" tone="emerald" value="58%" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_430px]">
        <div className="rounded-lg border border-white/10 bg-[#081525]/85 shadow-2xl shadow-black/20">
          <PanelHeader
            icon={Building2}
            subtitle="District-level queue, SLA, crew, and density posture"
            title="District operational metrics"
          />
          <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-4">
            {districtMetrics.map((district) => (
              <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4" key={district.district}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{district.district}</p>
                    <p className="mt-1 text-xs text-slate-500">{district.density} density</p>
                  </div>
                  <span className="rounded-md bg-cyan-400/10 px-2 py-1 text-xs font-medium text-cyan-100">
                    {district.open}
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  <ProgressRow label="SLA adherence" tone="cyan" value={district.sla} />
                  <div className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2 text-xs">
                    <span className="text-slate-500">Active crews</span>
                    <span className="font-semibold text-slate-200">{district.crews}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-[#081525]/85 p-5 shadow-2xl shadow-black/20">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-lg border border-blue-300/20 bg-blue-400/10 text-blue-200">
              <GitBranch className="size-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300">Smart routing overlays</p>
              <p className="text-xs text-slate-500">AI route assignments and escalation paths</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            <RoutingItem label="Critical pothole cluster" route="Transit Spine -> Roads & Public Works" score="91%" />
            <RoutingItem label="Drainage failure surge" route="Canal Belt -> Drainage Response Unit" score="93%" />
            <RoutingItem label="Dumping hotspot" route="North Market -> Sanitation Command" score="94%" />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-white/10 bg-[#081525]/85 shadow-2xl shadow-black/20">
        <PanelHeader
          icon={RadioTower}
          subtitle="Live geographic incident feed with severity, routing, confidence, and escalation risk"
          title="Live incident feed"
        />
        <div className="grid gap-3 p-5 lg:grid-cols-7">
          {sourceIncidents.map((incident) => (
            <div className="rounded-lg bg-white/[0.04] p-4" key={incident.id}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-cyan-100">{incident.id}</span>
                <span className="text-xs text-slate-500">{incident.age}</span>
              </div>
              <p className="mt-3 text-sm font-medium text-white">{incident.category}</p>
              <p className="mt-1 text-xs text-slate-500">{incident.department}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className={`rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-xs ${statusTone[incident.status]}`}>
                  {incident.status}
                </span>
                <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-slate-300">
                  {incident.confidence}% AI
                </span>
                <span className="rounded-md border border-red-300/15 bg-red-400/10 px-2 py-1 text-xs text-red-100">
                  {incident.risk}% risk
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function MetricPanel() {
  const metrics = [
    { label: "Live mapped complaints", value: "1,486", icon: Siren, tone: "cyan" },
    { label: "Critical GIS clusters", value: "12", icon: AlertTriangle, tone: "red" },
    { label: "AI route confidence", value: "92.8%", icon: Bot, tone: "emerald" },
    { label: "Crews in field", value: "44", icon: CheckCircle2, tone: "blue" },
    { label: "Escalation risk zones", value: "7", icon: ShieldAlert, tone: "amber" },
    { label: "Median dispatch ETA", value: "22m", icon: TimerReset, tone: "violet" },
  ]

  return (
    <div className="rounded-lg border border-white/10 bg-[#081525]/85 p-5 shadow-2xl shadow-black/20">
      <div className="grid gap-3 sm:grid-cols-2">
        {metrics.map((metric) => (
          <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3" key={metric.label}>
            <metric.icon className={`size-4 ${iconTone(metric.tone)}`} />
            <p className="mt-3 text-xl font-semibold text-white">{metric.value}</p>
            <p className="mt-1 text-xs text-slate-500">{metric.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function PanelHeader({
  icon: Icon,
  subtitle,
  title,
}: {
  icon: typeof RadioTower
  subtitle: string
  title: string
}) {
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

function ProgressRow({
  label,
  tone,
  value,
}: {
  label: string
  tone: string
  value: string
}) {
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="text-slate-500">{label}</span>
        <span className="font-medium text-slate-200">{value}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-white/10">
        <div className={`h-2 rounded-full ${barTone(tone)}`} style={{ width: value }} />
      </div>
    </div>
  )
}

function RoutingItem({ label, route, score }: { label: string; route: string; score: string }) {
  return (
    <div className="rounded-lg bg-white/[0.04] p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-white">{label}</p>
        <span className="text-sm font-semibold text-cyan-100">{score}</span>
      </div>
      <p className="mt-1 text-xs text-slate-500">{route}</p>
    </div>
  )
}

function iconTone(tone: string) {
  return {
    amber: "text-amber-200",
    blue: "text-blue-200",
    cyan: "text-cyan-200",
    emerald: "text-emerald-200",
    red: "text-red-200",
    violet: "text-violet-200",
  }[tone]
}

function barTone(tone: string) {
  return {
    amber: "bg-amber-300",
    cyan: "bg-cyan-300",
    emerald: "bg-emerald-300",
    red: "bg-red-300",
    violet: "bg-violet-300",
  }[tone]
}
