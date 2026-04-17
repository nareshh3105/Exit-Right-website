"use client";

import { useState } from "react";

import { AppShell } from "@/components/AppShell";

const MODES = [
  { key: "auto",      label: "Auto",        icon: "🛺" },
  { key: "erickshaw", label: "E-Rickshaw",   icon: "⚡" },
  { key: "bus",       label: "Metro Bus",    icon: "🚌" },
];

export default function SettingsPage() {
  const [selectedMode, setSelectedMode] = useState("auto");
  const [walkingKm, setWalkingKm] = useState(1.5);
  const [monsoonAlert, setMonsoonAlert] = useState(true);
  const [metroAlert, setMetroAlert] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Heading */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            PREFERENCES
          </p>
          <h1 className="text-2xl font-extrabold text-slate-900">Customize your urban navigational spine.</h1>
        </div>

        {/* Preferred Modes */}
        <section className="ui-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-bold text-slate-800">Preferred Modes</p>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
              style={{ background: "#16a34a" }}
            >
              ACTIVE SELECTION
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {MODES.map((m) => {
              const active = selectedMode === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => setSelectedMode(m.key)}
                  className="flex flex-col items-center gap-1 rounded-xl py-3 text-sm font-semibold transition"
                  style={
                    active
                      ? { background: "#1a237e", color: "#fff" }
                      : { background: "#f1f5f9", color: "#64748b" }
                  }
                >
                  <span className="text-xl">{m.icon}</span>
                  <span className="text-xs">{m.label}</span>
                  {m.key === "bus" && (
                    <span className="text-[9px]">{active ? "✓" : ""}</span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Walking Tolerance */}
        <section className="ui-card p-4">
          <p className="mb-1 font-bold text-slate-800">Walking Tolerance</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Max distance you are willing to walk
          </p>
          <p className="my-3 text-4xl font-extrabold" style={{ color: "#1a237e" }}>
            {walkingKm.toFixed(1)} km
          </p>
          <input
            type="range"
            min={0.5}
            max={5}
            step={0.5}
            value={walkingKm}
            onChange={(e) => setWalkingKm(Number(e.target.value))}
            className="w-full accent-blue-800"
          />
          <div className="mt-1 flex justify-between text-[10px] text-slate-400">
            <span>0.5 km</span>
            <span>5 km</span>
          </div>
        </section>

        {/* Smart Alerts */}
        <section className="ui-card divide-y divide-slate-100 overflow-hidden p-0">
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="font-semibold text-slate-800">Monsoon Flooding Alerts</p>
              <p className="text-xs text-slate-500">Real-time waterlogging warnings</p>
            </div>
            <button
              onClick={() => setMonsoonAlert((v) => !v)}
              className="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors"
              style={{ background: monsoonAlert ? "#f97316" : "#cbd5e1" }}
            >
              <span
                className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                style={{ transform: monsoonAlert ? "translateX(1.4rem)" : "translateX(0.2rem)" }}
              />
            </button>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="font-semibold text-slate-800">Metro Delay Alerts</p>
              <p className="text-xs text-slate-500">Live service disruptions</p>
            </div>
            <button
              onClick={() => setMetroAlert((v) => !v)}
              className="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors"
              style={{ background: metroAlert ? "#3b82f6" : "#cbd5e1" }}
            >
              <span
                className="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform"
                style={{ transform: metroAlert ? "translateX(1.4rem)" : "translateX(0.2rem)" }}
              />
            </button>
          </div>
        </section>

        {/* App Theme */}
        <section className="ui-card p-4">
          <p className="mb-3 font-bold text-slate-800">App Theme</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setTheme("light")}
              className="rounded-xl py-3 font-semibold transition"
              style={
                theme === "light"
                  ? { background: "#1a237e", color: "#fff", border: "2px solid #1a237e" }
                  : { background: "#f1f5f9", color: "#64748b", border: "2px solid transparent" }
              }
            >
              Light
            </button>
            <button
              onClick={() => setTheme("dark")}
              className="rounded-xl py-3 font-semibold transition"
              style={
                theme === "dark"
                  ? { background: "#0f172a", color: "#fff", border: "2px solid #0f172a" }
                  : { background: "#f1f5f9", color: "#64748b", border: "2px solid transparent" }
              }
            >
              Dark
            </button>
          </div>
        </section>

        {/* Save button */}
        <button
          onClick={handleSave}
          className="w-full rounded-2xl py-4 font-extrabold text-white transition"
          style={{ background: "#1a237e" }}
        >
          {saved ? "Saved ✓" : "Save Changes (₹)"}
        </button>
      </div>
    </AppShell>
  );
}
