"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { getStations } from "@/lib/api";
import { Station } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [destination, setDestination] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const savedStation = window.localStorage.getItem("exit_right_station");
    if (savedStation) {
      try { setSelectedId(JSON.parse(savedStation).id ?? ""); } catch { /* ignore */ }
    }
    const savedDest = window.localStorage.getItem("exit_right_destination");
    if (savedDest) {
      try { setDestination(JSON.parse(savedDest).name ?? ""); } catch { /* ignore */ }
    }
    getStations().then(setStations).catch(() => {});
  }, []);

  function handleGo() {
    if (!selectedId) { setError("Please select a boarding station"); return; }
    const station = stations.find((s) => s.id === selectedId);
    if (station) {
      window.localStorage.setItem("exit_right_station", JSON.stringify(station));
    }
    if (destination.trim()) {
      window.localStorage.setItem(
        "exit_right_destination",
        JSON.stringify({ name: destination.trim(), lat: 0, lng: 0 })
      );
    }
    router.push("/recommendation");
  }

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

        {/* Trip planner card */}
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-200 space-y-3">
          {/* Station dropdown */}
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              BOARDING STATION
            </p>
            <div className="relative">
              <select
                value={selectedId}
                onChange={(e) => { setSelectedId(e.target.value); setError(""); }}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-8 text-sm font-semibold text-slate-800 outline-none focus:border-[#1a237e]"
              >
                <option value="">Select station…</option>
                {stations.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.line_code} Line
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">▼</span>
            </div>
          </div>

          {/* Destination input */}
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              DESTINATION
            </p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base">📍</span>
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Enter destination…"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-[#1a237e]"
              />
            </div>
          </div>

          {/* Quick destination shortcuts */}
          <div className="flex gap-2">
            <button
              onClick={() => setDestination("Home")}
              className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition"
              style={
                destination === "Home"
                  ? { background: "#1a237e", color: "#fff", borderColor: "#1a237e" }
                  : { borderColor: "#e2e8f0", color: "#475569" }
              }
            >
              🏠 Home
            </button>
            <button
              onClick={() => setDestination("Office")}
              className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition"
              style={
                destination === "Office"
                  ? { background: "#1a237e", color: "#fff", borderColor: "#1a237e" }
                  : { borderColor: "#e2e8f0", color: "#475569" }
              }
            >
              💼 Office
            </button>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button
            onClick={handleGo}
            disabled={!selectedId}
            className="w-full rounded-xl py-3 font-bold text-white transition disabled:opacity-40"
            style={{ background: "#1a237e" }}
          >
            Get Recommendations →
          </button>
        </div>

        {/* Nearby station card */}
        <div className="ui-card overflow-hidden" style={{ borderLeft: "4px solid #1a237e" }}>
          <div className="p-4">
            <p
              className="text-[10px] font-black uppercase tracking-widest"
              style={{ color: "#1a237e" }}
            >
              NEARBY STATION
            </p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">
              Chennai Central
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Blue Line · Interchange available
            </p>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
