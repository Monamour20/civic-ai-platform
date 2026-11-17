import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type MetricCardProps = {
  label: string
  value: string
  delta: string
  tone: "cyan" | "blue" | "emerald" | "amber" | "red" | "violet"
  icon: LucideIcon
}

const toneStyles = {
  cyan: "border-cyan-300/20 bg-cyan-400/10 text-cyan-200",
  blue: "border-blue-300/20 bg-blue-400/10 text-blue-200",
  emerald: "border-emerald-300/20 bg-emerald-400/10 text-emerald-200",
  amber: "border-amber-300/20 bg-amber-400/10 text-amber-200",
  red: "border-red-300/20 bg-red-400/10 text-red-200",
  violet: "border-violet-300/20 bg-violet-400/10 text-violet-200",
}

export function MetricCard({ delta, icon: Icon, label, tone, value }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-[#0a1728]/88 p-4 shadow-xl shadow-black/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">{label}</p>
          <p className="mt-3 text-2xl font-semibold tracking-normal text-white">{value}</p>
        </div>
        <div className={cn("grid size-10 place-items-center rounded-lg border", toneStyles[tone])}>
          <Icon className="size-5" />
        </div>
      </div>
      <p className="mt-4 text-xs font-medium text-slate-400">
        <span className="text-cyan-200">{delta}</span> vs. previous civic cycle
      </p>
    </div>
  )
}
