"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/AppShell";
import MapPicker from "@/components/MapPicker";
import { getStations } from "@/lib/api";
import { Station } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [destination, setDestination] = useState("");
  const [destLat, setDestLat] = useState(0);
  const [destLng, setDestLng] = useState(0);
  const [error, setError] = useState("");
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    const savedStation = window.localStorage.getItem("exit_right_station");
    if (savedStation) {
      try { setSelectedId(JSON.parse(savedStation).id ?? ""); } catch { /* ignore */ }
    }
    const savedDest = window.localStorage.getItem("exit_right_destination");
    if (savedDest) {
      try {
        const d = JSON.parse(savedDest);
        setDestination(d.name ?? "");
        setDestLat(d.lat ?? 0);
        setDestLng(d.lng ?? 0);
      } catch { /* ignore */ }
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
        JSON.stringify({ name: destination.trim(), lat: destLat, lng: destLng })
      );
    }
    router.push("/recommendation");
  }

  function handleMapConfirm(lat: number, lng: number, name: string) {
    setDestination(name);
    setDestLat(lat);
    setDestLng(lng);
    setShowMap(false);
  }

  return (
    <AppShell>
      <div className="space-y-5">
        {/* Heading */}
        <div className="pt-2">
          <h1 className="text-3xl font-extrabold leading-tight text-slate-900">
            Where to{" "}
            <em className="not-italic" style={{ color: "#f97316" }}>next?</em>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Chennai Metro &bull; Live commute intelligence
          </p>
        </div>

        {/* Trip planner card */}
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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
                <option value="">
                  {stations.length === 0 ? "Loading stations…" : "Select your boarding station…"}
                </option>
                {stations.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.line_code} Line
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">▼</span>
            </div>
          </div>

          {/* Destination input + map pin button */}
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              DESTINATION
            </p>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base">📍</span>
                <input
                  value={destination}
                  onChange={(e) => { setDestination(e.target.value); setDestLat(0); setDestLng(0); }}
                  placeholder="Enter destination…"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-4 text-sm font-semibold text-slate-800 outline-none focus:border-[#1a237e]"
                />
              </div>
              {/* Map pin button */}
              <button
                onClick={() => setShowMap(true)}
                title="Select on map"
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xl transition hover:bg-slate-100"
              >
                🗺️
              </button>
            </div>
          </div>

          {/* Quick destination shortcuts */}
          <div className="flex gap-2">
            <button
              onClick={() => { setDestination("Home"); setDestLat(0); setDestLng(0); }}
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
              onClick={() => { setDestination("Office"); setDestLat(0); setDestLng(0); }}
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
            className="w-full rounded-xl py-3 font-bold text-white transition hover:opacity-90 disabled:opacity-40"
            style={{ background: "#1a237e" }}
          >
            Get Recommendations →
          </button>
        </div>

        {/* Quick access */}
        <section>
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            QUICK ACCESS
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => { setDestination("Home"); setDestLat(0); setDestLng(0); }}
              className="ui-card flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">🏠</span>
                <span className="font-semibold text-slate-800">Home</span>
              </div>
              <span className="text-slate-400">›</span>
            </button>
            <button
              onClick={() => { setDestination("Office"); setDestLat(0); setDestLng(0); }}
              className="ui-card flex items-center justify-between p-4"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">💼</span>
                <span className="font-semibold text-slate-800">Office</span>
              </div>
              <span className="text-slate-400">›</span>
            </button>
          </div>
        </section>
      </div>

      {/* Full-screen map picker */}
      {showMap && (
        <MapPicker
          initialLat={13.0827}
          initialLng={80.2707}
          onConfirm={handleMapConfirm}
          onClose={() => setShowMap(false)}
        />
      )}
    </AppShell>
  );
}
