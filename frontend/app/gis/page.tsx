import { DashboardShell } from "@/components/layout/dashboard-shell"
import { GisPageClient } from "@/components/gis/gis-page-client"

export default function GisPage() {
  return (
    <DashboardShell>
      <GisPageClient />
    </DashboardShell>
  )
}
