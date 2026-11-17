import {
  BadgeCheck,
  Bot,
  Building2,
  ClipboardList,
  Cpu,
  FileSearch,
  Gavel,
  LayoutDashboard,
  MapPinned,
  RadioTower,
  ShieldCheck,
  Siren,
  UsersRound,
} from "lucide-react"

export const primaryNavigation = [
  { name: "Command Center", href: "/", icon: LayoutDashboard },
  { name: "Issue Intake", href: "#", icon: Siren, current: false },
  { name: "City Map", href: "/gis", icon: MapPinned },
  { name: "AI Triage", href: "#", icon: Bot, current: false },
  { name: "Disputes", href: "#", icon: Gavel, current: false },
  { name: "Evidence Review", href: "/evidence", icon: FileSearch },
  { name: "Observability", href: "/observability", icon: Cpu },
]

export const governanceNavigation = [
  { name: "Policy Controls", href: "#", icon: ShieldCheck },
  { name: "Resolution SLAs", href: "#", icon: ClipboardList },
  { name: "Agencies", href: "#", icon: Building2 },
  { name: "Citizen Trust", href: "#", icon: BadgeCheck },
  { name: "Operators", href: "#", icon: UsersRound },
]

export const systemSignals = [
  { label: "Multimodal AI", value: "Online", icon: RadioTower },
  { label: "Governance Guardrails", value: "Enforced", icon: ShieldCheck },
]
