import {
  Bell,
  ChevronDown,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "../ui/button"
import { useAuth } from "@/contexts/auth-context"

type TopNavbarProps = {
  onMenuClick: () => void
}

export function TopNavbar({ onMenuClick }: TopNavbarProps) {
  const router = useRouter()
  const { logout, session } = useAuth()

  function signOut() {
    logout()
    router.replace("/login")
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white/10 bg-[#071524]/90 px-4 backdrop-blur-xl sm:px-6">
      <Button
        aria-label="Open navigation"
        className="text-slate-300 lg:hidden"
        size="icon"
        variant="ghost"
        onClick={onMenuClick}
      >
        <Menu />
      </Button>

      <div className="hidden min-w-0 flex-1 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-slate-400 shadow-inner shadow-black/20 md:flex">
        <Search className="size-4 text-cyan-200/70" />
        <span className="text-sm">Search case ID, ward, evidence, agency, SLA...</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <div className="hidden items-center gap-2 rounded-lg border border-emerald-300/15 bg-emerald-400/10 px-3 py-2 text-xs font-medium text-emerald-200 sm:flex">
          <ShieldCheck className="size-4" />
          Audit Ready
        </div>
        <Button
          aria-label="AI assist"
          className="border-cyan-300/20 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/15"
          size="icon"
          variant="outline"
        >
          <Sparkles />
        </Button>
        <Button
          aria-label="Notifications"
          className="border-white/10 bg-white/[0.04] text-slate-300 hover:bg-white/[0.07]"
          size="icon"
          variant="outline"
        >
          <Bell />
        </Button>
        <button
          className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-2 text-left transition hover:bg-white/[0.07]"
          onClick={signOut}
          title="Sign out"
        >
          <span className="grid size-6 place-items-center rounded-md bg-cyan-300 text-xs font-semibold text-slate-950">
            VC
          </span>
          <span className="hidden text-sm font-medium text-slate-200 sm:inline">
            {session?.role ?? "operator"}
          </span>
          <ChevronDown className="hidden size-4 text-slate-500 sm:inline" />
        </button>
      </div>
    </header>
  )
}
