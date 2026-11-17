"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { LockKeyhole, RadioTower } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState("admin@civic.ai")
  const [password, setPassword] = useState("admin123")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      await login(email, password)
      router.replace("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#050b15] px-4 text-slate-100">
      <form
        className="w-full max-w-md rounded-lg border border-white/10 bg-[#081525]/95 p-6 shadow-2xl shadow-black/30"
        onSubmit={onSubmit}
      >
        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-lg border border-cyan-300/20 bg-cyan-400/10 text-cyan-200">
            <RadioTower className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white">CivicAI Operator Login</h1>
            <p className="mt-1 text-sm text-slate-500">Authenticate to access command dashboards.</p>
          </div>
        </div>

        <label className="mt-6 block text-sm font-medium text-slate-300">
          Email
          <input
            className="mt-2 h-10 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none transition focus:border-cyan-300/40"
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            value={email}
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-slate-300">
          Password
          <input
            className="mt-2 h-10 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none transition focus:border-cyan-300/40"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
        </label>

        {error && (
          <div className="mt-4 rounded-lg border border-red-300/20 bg-red-400/10 px-3 py-2 text-sm text-red-100">
            {error}
          </div>
        )}

        <Button className="mt-6 w-full bg-cyan-300 text-slate-950 hover:bg-cyan-200" disabled={isLoading}>
          <LockKeyhole />
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>

        <p className="mt-4 text-xs leading-5 text-slate-500">
          Demo bootstrap credentials are prefilled. Replace them with managed identity or SSO in production.
        </p>
      </form>
    </main>
  )
}
