"use client";

import { AppShell } from "@/components/AppShell";

const TRANSIT_LINES = [
  {
    key: "yellow",
    color: "#eab308",
    label: "Yellow Line",
    eta: "2 mins",
    status: "ON TIME",
    statusColor: "#16a34a",
    statusBg: "#dcfce7",
  },
  {
    key: "blue",
    color: "#3b82f6",
    label: "Blue Line",
    eta: "5 mins",
    status: "SLOW FLOW",
    statusColor: "#f97316",
    statusBg: "#fff7ed",
  },
];

export default function AlertsPage() {
  return (
    <AppShell>
      <div className="space-y-4">
        {/* Weather alert banner */}
        <div
          className="flex items-start gap-3 rounded-2xl px-4 py-3 text-white"
          style={{ background: "#f97316" }}
        >
          <span className="mt-0.5 text-xl">🌡️</span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-orange-100">
              WEATHER ALERT
            </p>
            <p className="font-bold">Heatwave Alert: 38&deg;C</p>
            <p className="text-xs text-orange-100">STAY HYDRATED</p>
          </div>
        </div>

        {/* Current Hub */}
        <div className="ui-card p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            CURRENT HUB
          </p>
          <h2 className="text-2xl font-extrabold text-slate-900">Rajiv Chowk</h2>
          <span
            className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
            style={{ background: "#ef4444" }}
          >
            MORNING RUSH
          </span>

          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600">85% Station Capacity</span>
              <span className="font-bold text-red-500">HIGH</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: "85%", background: "#ef4444" }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Expect longer wait times. Use Gate 4 for faster exit.
            </p>
          </div>
        </div>

        {/* Quick Gate Exit */}
        <div
          className="flex items-center gap-3 rounded-2xl p-4 text-white"
          style={{ background: "#1a237e" }}
        >
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 text-2xl">
            QR
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-300">
              QUICK GATE EXIT ENTRY
            </p>
            <p className="font-bold">Scan to skip the queue</p>
            <p className="text-xs text-blue-300">Gate 4 &bull; Fast lane available</p>
          </div>
          <span className="text-xl">›</span>
        </div>

        {/* Transit Pulse */}
        <section>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              TRANSIT PULSE
            </p>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
              style={{ background: "#16a34a" }}
            >
              LIVE UPDATES
            </span>
          </div>
          <div className="space-y-2">
            {TRANSIT_LINES.map((line) => (
              <div key={line.key} className="ui-card flex items-center gap-3 p-3">
                <span
                  className="h-3 w-3 flex-shrink-0 rounded-full"
                  style={{ background: line.color }}
                />
                <div className="flex-1">
                  <p className="font-bold text-slate-800">{line.label}</p>
                  <p className="text-xs text-slate-500">Next: {line.eta}</p>
                </div>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{ background: line.statusBg, color: line.statusColor }}
                >
                  {line.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Last Mile Mobility */}
        <section>
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            LAST MILE MOBILITY
          </p>
          <div className="grid grid-cols-2 gap-3">
            {/* E-Rickshaw */}
            <div className="flex flex-col rounded-2xl p-4 text-white" style={{ background: "#16a34a" }}>
              <span className="text-2xl">⚡</span>
              <p className="mt-2 font-bold">E-Rickshaw</p>
              <p className="text-xs text-green-200">₹10/seat &bull; Shared</p>
              <button
                className="mt-3 w-full rounded-xl py-2 text-xs font-bold text-white"
                style={{ background: "rgba(255,255,255,0.2)" }}
              >
                Book Now
              </button>
            </div>

            {/* Auto Rickshaw */}
            <div className="ui-card flex flex-col p-4">
              <span className="text-2xl">🛺</span>
              <p className="mt-2 font-bold text-slate-800">Auto Rickshaw</p>
              <p className="text-xs text-slate-500">₹45 &bull; Private</p>
              <button
                className="mt-3 w-full rounded-xl py-2 text-xs font-bold text-white"
                style={{ background: "#1a237e" }}
              >
                Request Ride
              </button>
            </div>
          </div>
        </section>

        {/* Station Map placeholder */}
        <div
          className="flex h-40 items-center justify-center rounded-2xl"
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
            backgroundImage:
              "repeating-linear-gradient(0deg,transparent,transparent 20px,rgba(99,102,241,0.07) 20px,rgba(99,102,241,0.07) 21px),repeating-linear-gradient(90deg,transparent,transparent 20px,rgba(99,102,241,0.07) 20px,rgba(99,102,241,0.07) 21px)",
          }}
        >
          <p className="text-xs font-semibold text-slate-500">[ Station Map ]</p>
        </div>
      </div>
    </AppShell>
  );
}
