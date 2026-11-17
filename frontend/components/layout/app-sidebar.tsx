"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { X } from "lucide-react"

import {
  governanceNavigation,
  primaryNavigation,
  systemSignals,
} from "@/data/navigation"
import { cn } from "@/lib/utils"

import { Button } from "../ui/button"

type AppSidebarProps = {
  open?: boolean
  onClose?: () => void
}

export function AppSidebar({ open = false, onClose }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[292px] flex-col border-r border-cyan-400/10 bg-[#06111f] shadow-2xl shadow-cyan-950/30 transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 lg:shadow-none",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-lg border border-cyan-300/30 bg-cyan-400/10 text-sm font-semibold text-cyan-200 shadow-lg shadow-cyan-950/50">
              CI
            </div>
            <div>
              <p className="text-sm font-semibold text-white">CivicAI</p>
              <p className="text-xs text-cyan-200/60">Resolution Engine</p>
            </div>
          </div>
          <Button
            aria-label="Close navigation"
            className="text-slate-300 lg:hidden"
            size="icon-sm"
            variant="ghost"
            onClick={onClose}
          >
            <X />
          </Button>
        </div>

        <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-5">
          <SidebarSection label="Operations">
            {primaryNavigation.map((item) => {
              const current = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)

              return (
              <Link
                className={cn(
                  "group flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition",
                  current
                    ? "border border-cyan-300/20 bg-cyan-400/10 text-cyan-100 shadow-sm shadow-cyan-950/40"
                    : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-100"
                )}
                href={item.href}
                key={item.name}
                onClick={onClose}
              >
                <item.icon
                  className={cn(
                    "size-4",
                    current
                      ? "text-cyan-200"
                      : "text-slate-500 group-hover:text-cyan-200"
                  )}
                />
                {item.name}
              </Link>
              )
            })}
          </SidebarSection>

          <SidebarSection label="Governance">
            {governanceNavigation.map((item) => (
              <a
                className="group flex h-10 items-center gap-3 rounded-lg px-3 text-sm text-slate-400 transition hover:bg-white/[0.04] hover:text-slate-100"
                href={item.href}
                key={item.name}
              >
                <item.icon className="size-4 text-slate-500 group-hover:text-cyan-200" />
                {item.name}
              </a>
            ))}
          </SidebarSection>
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-lg border border-cyan-300/10 bg-white/[0.03] p-3">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-cyan-200/60">
              System posture
            </p>
            <div className="mt-3 space-y-3">
              {systemSignals.map((signal) => (
                <div className="flex items-center justify-between gap-3" key={signal.label}>
                  <div className="flex min-w-0 items-center gap-2">
                    <signal.icon className="size-4 text-cyan-200" />
                    <span className="truncate text-xs text-slate-300">{signal.label}</span>
                  </div>
                  <span className="text-xs font-medium text-emerald-300">{signal.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

function SidebarSection({
  children,
  label,
}: {
  children: React.ReactNode
  label: string
}) {
  return (
    <div>
      <p className="mb-2 px-3 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
      <div className="space-y-1">{children}</div>
    </div>
  )
}
