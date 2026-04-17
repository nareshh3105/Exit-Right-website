"use client";

import { AppShell } from "@/components/AppShell";

export default function AlertsPage() {
  return (
    <AppShell>
      <div className="space-y-4">
        {/* Header */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            NOTIFICATIONS
          </p>
          <h1 className="text-2xl font-extrabold text-slate-900">Alerts</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Real-time service updates for your commute
          </p>
        </div>

        {/* Chennai Metro Blue Line status */}
        <div className="ui-card p-4">
          <div className="flex items-center gap-3">
            <span
              className="h-3 w-3 flex-shrink-0 rounded-full"
              style={{ background: "#3b82f6" }}
            />
            <div className="flex-1">
              <p className="font-bold text-slate-800">Blue Line</p>
              <p className="text-xs text-slate-500">Wimco Nagar Depot → Airport</p>
            </div>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">
              NORMAL
            </span>
          </div>
        </div>

        {/* Empty state for alerts */}
        <div className="flex flex-col items-center gap-4 py-14 text-center">
          <span className="text-5xl">🔔</span>
          <div>
            <p className="font-bold text-slate-800">No active alerts</p>
            <p className="mt-1 text-sm text-slate-500">
              You&apos;ll be notified here about delays, crowd alerts, and service updates.
            </p>
          </div>
        </div>

        {/* Coming soon card */}
        <div
          className="flex items-start gap-3 rounded-2xl p-4 text-white"
          style={{ background: "#1a237e" }}
        >
          <span className="mt-0.5 text-xl">🔔</span>
          <div>
            <p className="font-bold">Push notifications coming soon</p>
            <p className="mt-0.5 text-xs text-blue-300">
              Get real-time alerts for crowd surges, platform changes, and last-mile
              availability directly on your device.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
