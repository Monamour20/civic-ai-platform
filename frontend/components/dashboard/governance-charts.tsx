"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

const issueDistribution = [
  { name: "Illegal garbage dumping", value: 286, color: "#22d3ee" },
  { name: "Road potholes", value: 342, color: "#60a5fa" },
  { name: "Water leakage", value: 198, color: "#34d399" },
  { name: "Broken streetlights", value: 164, color: "#fbbf24" },
  { name: "Drainage issues", value: 229, color: "#a78bfa" },
]

const severityData = [
  { issue: "Garbage dumping", critical: 24, high: 68, medium: 119 },
  { issue: "Potholes", critical: 39, high: 104, medium: 146 },
  { issue: "Water leakage", critical: 31, high: 77, medium: 82 },
  { issue: "Streetlights", critical: 13, high: 49, medium: 96 },
  { issue: "Drainage", critical: 44, high: 89, medium: 74 },
]

const resolutionTrend = [
  { day: "Mon", intake: 184, resolved: 151, escalated: 18 },
  { day: "Tue", intake: 211, resolved: 174, escalated: 22 },
  { day: "Wed", intake: 236, resolved: 191, escalated: 29 },
  { day: "Thu", intake: 204, resolved: 188, escalated: 17 },
  { day: "Fri", intake: 267, resolved: 226, escalated: 31 },
  { day: "Sat", intake: 173, resolved: 158, escalated: 14 },
  { day: "Sun", intake: 149, resolved: 137, escalated: 11 },
]

const pipelineData = [
  { stage: "Ingested", count: 1284 },
  { stage: "AI classified", count: 1198 },
  { stage: "Routed", count: 1036 },
  { stage: "In field", count: 684 },
  { stage: "Resolved", count: 512 },
]

const tooltipStyle = {
  background: "#071524",
  border: "1px solid rgba(103, 232, 249, 0.18)",
  borderRadius: 8,
  color: "#e2e8f0",
}

export function IssueDistributionChart() {
  return (
    <ResponsiveContainer height={252} width="100%">
      <PieChart>
        <Pie
          cx="50%"
          cy="50%"
          data={issueDistribution}
          dataKey="value"
          innerRadius={58}
          nameKey="name"
          outerRadius={92}
          paddingAngle={3}
        >
          {issueDistribution.map((entry) => (
            <Cell fill={entry.color} key={entry.name} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend
          iconSize={8}
          layout="vertical"
          verticalAlign="middle"
          wrapperStyle={{ color: "#94a3b8", fontSize: 12, right: -12 }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function SeverityAnalyticsChart() {
  return (
    <ResponsiveContainer height={248} width="100%">
      <BarChart data={severityData} margin={{ bottom: 8, left: -24, right: 8, top: 8 }}>
        <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
        <XAxis
          dataKey="issue"
          interval={0}
          stroke="#64748b"
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          tickLine={false}
        />
        <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(34, 211, 238, 0.06)" }} />
        <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
        <Bar dataKey="critical" fill="#f87171" name="Critical" radius={[4, 4, 0, 0]} />
        <Bar dataKey="high" fill="#fbbf24" name="High" radius={[4, 4, 0, 0]} />
        <Bar dataKey="medium" fill="#22d3ee" name="Medium" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function ResolutionEfficiencyChart() {
  return (
    <ResponsiveContainer height={252} width="100%">
      <LineChart data={resolutionTrend} margin={{ left: -20, right: 12, top: 8 }}>
        <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
        <XAxis dataKey="day" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} />
        <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
        <Line dataKey="intake" name="Complaint intake" stroke="#60a5fa" strokeWidth={2.4} type="monotone" />
        <Line dataKey="resolved" name="Resolved" stroke="#34d399" strokeWidth={2.4} type="monotone" />
        <Line dataKey="escalated" name="Escalated" stroke="#fbbf24" strokeWidth={2.4} type="monotone" />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function PipelineChart() {
  return (
    <ResponsiveContainer height={220} width="100%">
      <AreaChart data={pipelineData} layout="vertical" margin={{ bottom: 0, left: 8, right: 18, top: 8 }}>
        <defs>
          <linearGradient id="pipelineFill" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.24} />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.72} />
          </linearGradient>
        </defs>
        <CartesianGrid horizontal={false} stroke="rgba(148, 163, 184, 0.12)" />
        <XAxis hide type="number" />
        <YAxis
          dataKey="stage"
          stroke="#64748b"
          tick={{ fill: "#94a3b8", fontSize: 12 }}
          tickLine={false}
          type="category"
          width={92}
        />
        <Tooltip contentStyle={tooltipStyle} />
        <Area dataKey="count" fill="url(#pipelineFill)" stroke="#22d3ee" strokeWidth={2} type="monotone" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
