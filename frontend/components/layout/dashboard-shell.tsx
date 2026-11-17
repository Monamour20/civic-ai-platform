"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

import { useAuth } from "@/contexts/auth-context"

import { AppSidebar } from "./app-sidebar"
import { TopNavbar } from "./top-navbar"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isAuthenticated, isLoading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== "/login") {
      router.replace("/login")
    }
  }, [isAuthenticated, isLoading, pathname, router])

  if (isLoading || (!isAuthenticated && pathname !== "/login")) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#050b15] text-sm text-slate-400">
        Establishing secure CivicAI session...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050b15] text-slate-100">
      <div className="flex min-h-screen">
        <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="min-w-0 flex-1">
          <TopNavbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_30%_0%,rgba(34,211,238,0.14),transparent_34%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.12),transparent_30%)]" />
            <div className="relative px-4 py-6 sm:px-6 lg:px-8">{children}</div>
          </main>
        </div>
      </div>
    </div>
  )
}
