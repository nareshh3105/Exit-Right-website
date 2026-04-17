"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import { getStations } from "@/lib/api";
import { Station } from "@/lib/types";

const LINE_COLORS: Record<string, string> = {
  Yellow: "#eab308",
  Blue: "#3b82f6",
  Magenta: "#ec4899",
  Red: "#ef4444",
  Violet: "#7c3aed",
  Green: "#16a34a",
};

export default function StationSelectorPage() {
  const router = useRouter();
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [destination, setDestination] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedStation = window.localStorage.getItem("exit_right_station");
    if (savedStation) {
      try { setSelectedId(JSON.parse(savedStation).id ?? ""); } catch { /* ignore */ }
    }
    const savedDest = window.localStorage.getItem("exit_right_destination");
    if (savedDest) {
      try { setDestination(JSON.parse(savedDest).name ?? ""); } catch { /* ignore */ }
    }
    getStations()
      .then((data) => { setStations(data); setLoading(false); })
      .catch(() => { setError("Unable to load stations"); setLoading(false); });
  }, []);

  function handleNext() {
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

  const selectedStation = stations.find((s) => s.id === selectedId);
  const lineColor = selectedStation ? (LINE_COLORS[selectedStation.line_code] ?? "#64748b") : null;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Heading */}
        <div className="pt-1">
          <h1 className="text-3xl font-extrabold text-slate-900">Plan Your Trip</h1>
          <p className="mt-1 text-sm text-slate-500">
            Select your station and destination
          </p>
        </div>

        {/* Boarding Station Dropdown */}
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            BOARDING STATION
          </p>
          <div className="relative">
            <select
              value={selectedId}
              onChange={(e) => { setSelectedId(e.target.value); setError(""); }}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3.5 pr-10 text-sm font-semibold text-slate-800 shadow-sm outline-none focus:border-[#1a237e]"
            >
              <option value="">
                {loading ? "Loading stations…" : "Select your boarding station…"}
              </option>
              {stations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.line_code} Line
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
              ▼
            </span>
          </div>

          {/* Selected station badge */}
          {selectedStation && lineColor && (
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2"
              style={{ background: lineColor + "18", border: `1.5px solid ${lineColor}` }}
            >
              <span
                className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                style={{ background: lineColor }}
              />
              <span className="text-xs font-bold" style={{ color: lineColor }}>
                {selectedStation.line_code} LINE
              </span>
              <span className="ml-1 text-xs font-semibold text-slate-700">
                {selectedStation.name}
              </span>
            </div>
          )}
        </div>

        {/* Destination */}
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            WHERE TO?
          </p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">📍</span>
            <input
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Enter destination…"
              className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3.5 text-sm font-semibold text-slate-800 shadow-sm outline-none focus:border-[#1a237e]"
            />
          </div>
        </div>

        {/* Quick destination shortcuts */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setDestination("Home")}
            className="ui-card flex items-center gap-2 p-3 text-left transition"
            style={destination === "Home" ? { border: "2px solid #1a237e" } : {}}
          >
            <span className="text-lg">🏠</span>
            <span className="text-sm font-semibold text-slate-800">Home</span>
          </button>
          <button
            onClick={() => setDestination("Office")}
            className="ui-card flex items-center gap-2 p-3 text-left transition"
            style={destination === "Office" ? { border: "2px solid #1a237e" } : {}}
          >
            <span className="text-lg">💼</span>
            <span className="text-sm font-semibold text-slate-800">Office</span>
          </button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* CTA */}
        <button
          onClick={handleNext}
          disabled={!selectedId}
          className="w-full rounded-xl py-4 font-bold text-white transition disabled:opacity-40"
          style={{ background: "#1a237e" }}
        >
          Get Recommendations →
        </button>
      </div>
    </AppShell>
  );
}
