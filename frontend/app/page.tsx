import { DashboardOverview } from "@/components/dashboard/dashboard-overview"
import { DashboardShell } from "@/components/layout/dashboard-shell"

export default function Home() {
  return (
    <DashboardShell>
      <DashboardOverview />
    </DashboardShell>
  );
}
