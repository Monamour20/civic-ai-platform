"use client"

import dynamic from "next/dynamic"

const SmartCityGisDashboard = dynamic(
  () =>
    import("./smart-city-gis-dashboard").then(
      (module) => module.SmartCityGisDashboard
    ),
  {
    loading: () => (
      <div className="grid min-h-[620px] place-items-center rounded-lg border border-white/10 bg-[#081525]/85 text-sm text-slate-400">
        Loading smart-city GIS command map...
      </div>
    ),
    ssr: false,
  }
)

export function GisPageClient() {
  return <SmartCityGisDashboard />
}
