import { DashboardShell } from "@/components/layout/dashboard-shell"
import { ObservabilityDashboard } from "@/components/observability/observability-dashboard"

export default function ObservabilityPage() {
  return (
    <DashboardShell>
      <ObservabilityDashboard />
    </DashboardShell>
  )
}
