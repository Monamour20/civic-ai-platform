"use client"

import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  Bot,
  BrainCircuit,
  ClipboardCheck,
  Clock3,
  FileWarning,
  Gavel,
  GitBranch,
  Lightbulb,
  MapPinned,
  RadioTower,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TimerReset,
  TrendingUp,
  Workflow,
  Wrench,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAnalyticsSummary } from "@/hooks/use-civic-api"

import {
  IssueDistributionChart,
  PipelineChart,
  ResolutionEfficiencyChart,
  SeverityAnalyticsChart,
} from "./governance-charts"
import { MetricCard } from "./metric-card"

const confidenceCards = [
  { label: "Image evidence classifier", value: "96.4%", detail: "garbage, pothole, leakage" },
  { label: "Audio/text dispute parser", value: "91.8%", detail: "tone, intent, urgency" },
  { label: "Geo-routing confidence", value: "94.1%", detail: "ward, asset, agency match" },
  { label: "Fraud anomaly model", value: "87.6%", detail: "duplicate and staged claims" },
]

const liveComplaints = [
  { issue: "Illegal garbage dumping", ward: "Ward 08 / East Yard", count: 286, severity: "High" },
  { issue: "Road potholes", ward: "Ward 12 / Transit Spine", count: 342, severity: "Critical" },
  { issue: "Water leakage", ward: "Ward 03 / North Grid", count: 198, severity: "High" },
  { issue: "Broken streetlights", ward: "Ward 17 / Market Ring", count: 164, severity: "Medium" },
  { issue: "Drainage issues", ward: "Ward 21 / Canal Belt", count: 229, severity: "Critical" },
]

const departments = [
  { name: "Sanitation Command", queue: 286, sla: "82%", load: "74%", status: "surge watch" },
  { name: "Roads & Public Works", queue: 342, sla: "68%", load: "91%", status: "field capacity tight" },
  { name: "Water Utility Cell", queue: 198, sla: "76%", load: "63%", status: "stable" },
  { name: "Electrical Maintenance", queue: 164, sla: "88%", load: "52%", status: "stable" },
  { name: "Drainage Response Unit", queue: 229, sla: "61%", load: "86%", status: "escalation active" },
]

const activityFeed = [
  "AI routed 42 pothole complaints to Roads & Public Works with 94% confidence.",
  "Duplicate dumping reports merged across Ward 08, reducing manual review by 17 cases.",
  "Drainage flooding cluster escalated to emergency inspection due to rainfall forecast.",
  "Citizen dispute CIV-2050 moved to mediator review after evidence conflict detection.",
  "Water leakage report batch prioritized near school and clinic infrastructure.",
]

const recommendations = [
  "Deploy two additional road inspection crews to Ward 12 before evening traffic peak.",
  "Trigger sanitation contractor audit for repeated illegal dumping at East Yard transfer lane.",
  "Increase human review sampling for low-light streetlight images below 82% confidence.",
  "Bundle drainage complaints by canal segment to reduce duplicate dispatches.",
]

const fraudSignals = [
  { label: "Duplicate evidence clusters", value: "38", risk: "Medium" },
  { label: "Location spoofing alerts", value: "11", risk: "High" },
  { label: "Repeated claimant patterns", value: "23", risk: "Medium" },
]

const routingStatuses = [
  { label: "Classifier service", value: "99.98%", state: "healthy" },
  { label: "GIS ward resolver", value: "42ms", state: "nominal" },
  { label: "Agency SLA router", value: "97.2%", state: "optimized" },
  { label: "Dispute escalation rules", value: "18", state: "active" },
]

export function DashboardOverview() {
  const { data: analytics, error, isLoading } = useAnalyticsSummary()
  const departmentMetrics =
    analytics?.department_load.map((department) => ({
      name: department.department,
      queue: department.queue,
      sla: `${Math.round(department.sla_adherence * 100)}%`,
      load: `${Math.min(96, Math.round(department.queue / 4))}%`,
      status: department.sla_adherence < 0.7 ? "escalation watch" : "stable",
    })) ?? departments

  return (
    <div className="space-y-5">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="rounded-lg border border-white/10 bg-[#081525]/85 p-5 shadow-2xl shadow-black/25">
          <div className="flex flex-col gap-5 2xl:flex-row 2xl:items-end 2xl:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-cyan-300/15 bg-cyan-400/10 px-3 py-1.5 text-xs font-medium text-cyan-100">
                <RadioTower className="size-4" />
                Executive governance dashboard
              </div>
              <h1 className="mt-4 max-w-4xl text-3xl font-semibold tracking-normal text-white sm:text-4xl">
                Civic Issue Intelligence and Multimodal Dispute Operations
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
                Citywide operational command for AI-assisted complaint intake, fraud screening,
                municipal routing, SLA enforcement, escalation governance, and citizen dispute resolution.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button className="bg-cyan-300 text-slate-950 hover:bg-cyan-200">
                <Sparkles />
                Generate briefing
              </Button>
              <Button
                className="border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.07]"
                variant="outline"
              >
                <ShieldCheck />
                Audit controls
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              delta="+18.3%"
              icon={Activity}
              label="Live civic complaints"
              tone="cyan"
              value={analytics ? analytics.live_complaints.toLocaleString() : isLoading ? "..." : "1,219"}
            />
            <MetricCard
              delta="-11.4%"
              icon={TimerReset}
              label="Mean resolution time"
              tone="blue"
              value={analytics ? `${analytics.mean_resolution_hours}h` : isLoading ? "..." : "16.8h"}
            />
            <MetricCard
              delta="+7.9%"
              icon={BrainCircuit}
              label="AI confidence index"
              tone="emerald"
              value={analytics ? `${Math.round(analytics.ai_route_accuracy * 1000) / 10}%` : isLoading ? "..." : "93.7%"}
            />
            <MetricCard
              delta="+5.2%"
              icon={ShieldAlert}
              label="Fraud risk alerts"
              tone="amber"
              value={analytics ? analytics.fraud_alerts.toString() : isLoading ? "..." : "72"}
            />
          </div>
          {error && (
            <p className="mt-4 rounded-lg border border-amber-300/15 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">
              Backend analytics unavailable: {error}
            </p>
          )}
        </div>

        <div className="rounded-lg border border-cyan-300/15 bg-[#081525]/85 p-5 shadow-2xl shadow-black/25">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-300">Smart routing engine</p>
              <h2 className="mt-1 text-xl font-semibold text-white">Operational status</h2>
            </div>
            <div className="grid size-10 place-items-center rounded-lg border border-cyan-300/20 bg-cyan-400/10 text-cyan-200">
              <GitBranch className="size-5" />
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            {routingStatuses.map((item) => (
              <div className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-3" key={item.label}>
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="mt-1 text-xs capitalize text-emerald-300">{item.state}</p>
                </div>
                <span className="text-sm font-semibold text-cyan-100">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-4">
        {confidenceCards.map((card) => (
          <div className="rounded-lg border border-white/10 bg-[#081525]/85 p-4 shadow-xl shadow-black/20" key={card.label}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-300">{card.label}</p>
              <Bot className="size-4 text-cyan-200" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-white">{card.value}</p>
            <p className="mt-2 text-xs text-slate-500">{card.detail}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_430px]">
        <div className="rounded-lg border border-white/10 bg-[#081525]/85 shadow-2xl shadow-black/20">
          <PanelHeader
            action="Open queue"
            icon={ClipboardCheck}
            subtitle="Live complaint metrics by issue category, ward, and operational severity"
            title="Civic complaint command queue"
          />
          <div className="divide-y divide-white/10">
            {liveComplaints.map((item) => (
              <div
                className="grid gap-3 px-5 py-4 lg:grid-cols-[minmax(220px,1fr)_190px_90px_110px]"
                key={item.issue}
              >
                <div>
                  <p className="text-sm font-medium text-white">{item.issue}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPinned className="size-3.5" />
                    {item.ward}
                  </p>
                </div>
                <div className="text-sm text-slate-400">Multimodal reports: image, text, geo</div>
                <div className="text-sm font-semibold text-cyan-100">{item.count}</div>
                <SeverityBadge severity={item.severity} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-[#081525]/85 p-5 shadow-2xl shadow-black/20">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-lg border border-amber-300/20 bg-amber-400/10 text-amber-200">
              <ShieldAlert className="size-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300">Fraud risk indicators</p>
              <p className="text-xs text-slate-500">Anomalies requiring governance review</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {fraudSignals.map((signal) => (
              <div className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-3" key={signal.label}>
                <div>
                  <p className="text-sm font-medium text-white">{signal.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{signal.risk} risk band</p>
                </div>
                <span className="text-lg font-semibold text-amber-200">{signal.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <ChartPanel title="Civic issue distribution" subtitle="Complaint mix across validated smart-city categories">
          <IssueDistributionChart />
        </ChartPanel>
        <ChartPanel title="Issue severity analytics" subtitle="Critical, high, and medium impact classification by issue type">
          <SeverityAnalyticsChart />
        </ChartPanel>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <ChartPanel title="Resolution efficiency analytics" subtitle="Seven-day intake, resolution, and escalation trend">
          <ResolutionEfficiencyChart />
        </ChartPanel>
        <ChartPanel title="Complaint resolution pipeline" subtitle="Throughput from ingestion to municipal closure">
          <PipelineChart />
        </ChartPanel>
      </section>

      <section className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_430px]">
        <div className="rounded-lg border border-white/10 bg-[#081525]/85 shadow-2xl shadow-black/20">
          <PanelHeader
            action="Department view"
            icon={Wrench}
            subtitle="Municipal department monitoring with queue load and SLA posture"
            title="Agency operational monitoring"
          />
          <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
            {departmentMetrics.map((department) => (
              <div className="rounded-lg border border-white/10 bg-white/[0.035] p-4" key={department.name}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{department.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{department.status}</p>
                  </div>
                  <span className="rounded-md bg-cyan-400/10 px-2 py-1 text-xs font-medium text-cyan-100">
                    {department.queue}
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  <ProgressRow label="SLA adherence" value={department.sla} />
                  <ProgressRow label="Field load" value={department.load} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-5">
          <div className="rounded-lg border border-white/10 bg-[#081525]/85 p-5 shadow-2xl shadow-black/20">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-lg border border-cyan-300/20 bg-cyan-400/10 text-cyan-200">
                <Lightbulb className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-300">AI-generated recommendations</p>
                <p className="text-xs text-slate-500">Action proposals ranked by operational impact</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {recommendations.map((item, index) => (
                <div className="rounded-lg border border-cyan-300/10 bg-cyan-400/[0.06] p-3" key={item}>
                  <p className="text-xs font-semibold text-cyan-200">Recommendation {index + 1}</p>
                  <p className="mt-1 text-sm leading-5 text-slate-300">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-[#081525]/85 p-5 shadow-2xl shadow-black/20">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-lg border border-blue-300/20 bg-blue-400/10 text-blue-200">
                <Workflow className="size-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-300">Escalation metrics</p>
                <p className="text-xs text-slate-500">Dispute and SLA exception controls</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <MiniStat icon={Gavel} label="Disputes" value="61" />
              <MiniStat icon={FileWarning} label="SLA breach" value="29" />
              <MiniStat icon={TrendingUp} label="Priority lifts" value="44" />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-white/10 bg-[#081525]/85 shadow-2xl shadow-black/20">
        <PanelHeader
          action="Export"
          icon={Clock3}
          subtitle="Operational activity feed from AI routing, department actions, and dispute governance"
          title="Live governance activity"
        />
        <div className="grid gap-3 p-5 lg:grid-cols-5">
          {activityFeed.map((item, index) => (
            <div className="rounded-lg bg-white/[0.04] p-4" key={item}>
              <div className="flex items-center gap-2 text-xs font-medium text-cyan-200">
                <BadgeCheck className="size-4" />
                T+{index * 7 + 4}m
              </div>
              <p className="mt-3 text-sm leading-5 text-slate-300">{item}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function PanelHeader({
  action,
  icon: Icon,
  subtitle,
  title,
}: {
  action: string
  icon: typeof Activity
  subtitle: string
  title: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid size-9 shrink-0 place-items-center rounded-lg border border-cyan-300/15 bg-cyan-400/10 text-cyan-200">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-200">{title}</p>
          <p className="mt-1 truncate text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      <Button className="hidden text-cyan-100 hover:bg-cyan-400/10 sm:inline-flex" size="sm" variant="ghost">
        {action}
        <ArrowUpRight />
      </Button>
    </div>
  )
}

function ChartPanel({
  children,
  subtitle,
  title,
}: {
  children: React.ReactNode
  subtitle: string
  title: string
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#081525]/85 p-5 shadow-2xl shadow-black/20">
      <div className="mb-4">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      </div>
      {children}
    </div>
  )
}

function SeverityBadge({ severity }: { severity: string }) {
  const className =
    severity === "Critical"
      ? "border-red-300/20 bg-red-400/10 text-red-200"
      : severity === "High"
        ? "border-amber-300/20 bg-amber-400/10 text-amber-200"
        : "border-cyan-300/20 bg-cyan-400/10 text-cyan-200"

  return (
    <span className={`w-fit rounded-md border px-2 py-1 text-xs font-medium ${className}`}>
      {severity}
    </span>
  )
}

function ProgressRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="text-slate-500">{label}</span>
        <span className="font-medium text-slate-200">{value}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-white/10">
        <div className="h-2 rounded-full bg-cyan-300" style={{ width: value }} />
      </div>
    </div>
  )
}

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg bg-white/[0.04] p-3">
      <Icon className="size-4 text-cyan-200" />
      <p className="mt-3 text-xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  )
}
