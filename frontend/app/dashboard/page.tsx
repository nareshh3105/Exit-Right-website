import Link from "next/link";

import { AppShell } from "@/components/AppShell";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-5">
        {/* Heading */}
        <div className="pt-2">
          <h1 className="text-3xl font-extrabold leading-tight text-slate-900">
            Where to{" "}
            <em className="not-italic" style={{ color: "#f97316" }}>
              next?
            </em>
          </h1>
          <p className="mt-1 text-sm" style={{ color: "#64748b" }}>
            Chennai Metro &bull; Live commute intelligence
          </p>
        </div>

        {/* Search bar */}
        <Link
          href="/station-selector"
          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
        >
          <span className="text-slate-400">🔍</span>
          <span className="text-sm text-slate-400">Tap to select station &amp; destination&hellip;</span>
        </Link>

        {/* Nearby station card */}
        <div
          className="ui-card overflow-hidden"
          style={{ borderLeft: "4px solid #16a34a" }}
        >
          <div className="p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-green-600">
              NEARBY STATION
            </p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">Kashmere Gate</p>
            <p className="mt-0.5 text-xs text-slate-500">
              Interchange for Red, Yellow &amp; Violet Lines
            </p>
          </div>
        </div>

        {/* Quick access 2-col grid */}
        <section>
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            QUICK ACCESS
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/station-selector" className="ui-card flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏠</span>
                <span className="font-semibold text-slate-800">Home</span>
              </div>
              <span className="text-slate-400">›</span>
            </Link>
            <Link href="/station-selector" className="ui-card flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">💼</span>
                <span className="font-semibold text-slate-800">Office</span>
              </div>
              <span className="text-slate-400">›</span>
            </Link>
          </div>
        </section>

        {/* Recommendation CTA card */}
        <div className="rounded-2xl p-5 text-white" style={{ background: "#1a237e" }}>
          <p className="text-sm font-medium text-blue-200">Not sure where to head next?</p>
          <p className="mt-1 text-xs text-blue-300">
            Get a smart suggestion based on your commute patterns
          </p>
          <Link
            href="/recommendation"
            className="mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white"
            style={{ background: "#f97316" }}
          >
            Quick Recommendation (₹) ⚡
          </Link>
        </div>

        {/* Green route banner */}
        <div
          className="flex items-center gap-3 rounded-2xl px-4 py-3 text-white"
          style={{ background: "#16a34a" }}
        >
          <span className="text-xl">🌿</span>
          <div>
            <p className="text-sm font-semibold">Greenest route via E-Rickshaw</p>
            <p className="text-xs text-green-200">Save 2kg CO₂ on this trip</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
