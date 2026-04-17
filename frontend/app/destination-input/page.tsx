"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/AppShell";

interface Destination {
  name: string;
  lat: number;
  lng: number;
}

const recentJourneys = [
  { name: "Cyber City", subtitle: "Gurgaon · 32 min", id: 1 },
  { name: "Connaught Place", subtitle: "Central Delhi · 18 min", id: 2 },
  { name: "Lajpat Nagar", subtitle: "South Delhi · 22 min", id: 3 },
];

export default function DestinationInputPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Destination | null>(null);
  const [locating, setLocating] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapLat, setMapLat] = useState("");
  const [mapLng, setMapLng] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("exit_right_destination");
    if (saved) {
      try { setSelected(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  function saveAndSelect(dest: Destination) {
    setSelected(dest);
    setError("");
    window.localStorage.setItem("exit_right_destination", JSON.stringify(dest));
  }

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        saveAndSelect({
          name: "My Current Location",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocating(false);
      },
      () => {
        setError("Unable to get your location. Please allow location access.");
        setLocating(false);
      }
    );
  }

  function handleMapConfirm() {
    const lat = Number(mapLat);
    const lng = Number(mapLng);
    if (!query.trim()) { setError("Enter a name for this location"); return; }
    if (Number.isNaN(lat) || lat < 8 || lat > 37) { setError("Enter a valid latitude"); return; }
    if (Number.isNaN(lng) || lng < 68 || lng > 97) { setError("Enter a valid longitude"); return; }
    saveAndSelect({ name: query.trim(), lat, lng });
    setShowMap(false);
  }

  function handleNext() {
    if (!selected) { setError("Please select a destination first"); return; }
    router.push("/recommendation");
  }

  return (
    <AppShell>
      <div className="space-y-5">
        {/* Heading */}
        <h1 className="text-3xl font-extrabold text-slate-900">Where to?</h1>

        {/* Search bar */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter destination or station"
            className="ui-input pl-11"
          />
        </div>

        {/* Pro Tip card */}
        <div
          className="flex items-center gap-3 rounded-2xl p-4 text-white"
          style={{ background: "#1a237e" }}
        >
          <span className="text-2xl">💡</span>
          <p className="flex-1 text-xs text-blue-200">
            Sync your IRCTC or calendar for route planning
          </p>
          <span className="text-white">›</span>
        </div>

        {/* Saved Places */}
        <section>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              SAVED PLACES
            </p>
            <button className="text-[10px] font-bold uppercase tracking-widest text-orange-500">
              MANAGE
            </button>
          </div>
          <div className="space-y-2">
            {/* Home */}
            <button
              onClick={() => saveAndSelect({ name: "Dwarka Sector 10", lat: 28.5921, lng: 77.0460 })}
              className="ui-card flex w-full items-center gap-3 p-3 text-left"
              style={selected?.name === "Dwarka Sector 10" ? { border: "2px solid #1a237e" } : {}}
            >
              <span
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-white"
                style={{ background: "#f97316" }}
              >
                🏠
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-800">Home</p>
                  <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white" style={{ background: "#f97316" }}>
                    FAV
                  </span>
                </div>
                <p className="text-xs text-slate-500">Dwarka Sector 10</p>
              </div>
              <span className="text-slate-300">›</span>
            </button>

            {/* Office */}
            <button
              onClick={() => saveAndSelect({ name: "Cyber City, Gurgaon", lat: 28.4950, lng: 77.0880 })}
              className="ui-card flex w-full items-center gap-3 p-3 text-left"
              style={selected?.name === "Cyber City, Gurgaon" ? { border: "2px solid #1a237e" } : {}}
            >
              <span
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-white"
                style={{ background: "#1a237e" }}
              >
                💼
              </span>
              <div className="flex-1">
                <p className="font-semibold text-slate-800">Office</p>
                <p className="text-xs text-slate-500">Cyber City</p>
              </div>
              <span className="text-slate-300">›</span>
            </button>
          </div>
        </section>

        {/* Recent Journeys */}
        <section>
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            RECENT JOURNEYS
          </p>
          <div className="space-y-2">
            {recentJourneys.map((j) => (
              <button
                key={j.id}
                onClick={() => setQuery(j.name)}
                className="ui-card flex w-full items-center gap-3 p-3 text-left"
              >
                <span className="text-slate-400">🕐</span>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{j.name}</p>
                  <p className="text-xs text-slate-500">{j.subtitle}</p>
                </div>
                <span className="text-slate-400">↗</span>
              </button>
            ))}
          </div>
        </section>

        {/* Location / Map options */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleUseLocation}
            disabled={locating}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition disabled:opacity-60"
          >
            <span>📍</span>
            {locating ? "Getting\u2026" : "Use Location"}
          </button>
          <button
            onClick={() => setShowMap((v) => !v)}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700"
          >
            <span>🗺️</span>
            Map Picker
          </button>
        </div>

        {/* Map coordinate picker */}
        {showMap && (
          <div className="ui-card space-y-3 p-4">
            <h2 className="font-bold text-slate-800">Enter coordinates</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <input value={mapLat} onChange={(e) => setMapLat(e.target.value)} placeholder="Latitude" className="ui-input text-sm" />
              <input value={mapLng} onChange={(e) => setMapLng(e.target.value)} placeholder="Longitude" className="ui-input text-sm" />
            </div>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Location name" className="ui-input text-sm" />
            <div className="flex gap-2">
              <button onClick={handleMapConfirm} className="rounded-xl px-4 py-2 text-sm font-bold text-white" style={{ background: "#1a237e" }}>
                Confirm
              </button>
              <button onClick={() => setShowMap(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Selected destination */}
        {selected && (
          <div className="flex items-center gap-3 rounded-xl border-l-4 bg-blue-50 px-4 py-3" style={{ borderColor: "#1a237e" }}>
            <span>📌</span>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#1a237e" }}>Selected</p>
              <p className="font-bold text-slate-900">{selected.name}</p>
            </div>
            <button onClick={() => setSelected(null)} className="text-xs text-slate-400 hover:text-red-500">✕</button>
          </div>
        )}

        {/* Go Green card */}
        <div
          className="flex items-center justify-between rounded-2xl p-4 text-white"
          style={{ background: "#14532d" }}
        >
          <div>
            <p className="font-bold">Go Green today? 🌿</p>
            <p className="text-xs text-green-300">Reduce your carbon footprint</p>
          </div>
          <button className="rounded-xl px-3 py-2 text-xs font-bold text-white" style={{ background: "#16a34a" }}>
            Find Electric Routes
          </button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/station-selector")}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-6 py-3 font-semibold text-slate-600 hover:bg-slate-50"
          >
            &larr; Back
          </button>
          <button
            onClick={handleNext}
            disabled={!selected}
            className="flex items-center gap-2 rounded-xl px-8 py-3 font-bold text-white transition disabled:opacity-40"
            style={{ background: "#1a237e" }}
          >
            Next &rarr;
          </button>
        </div>
      </div>
    </AppShell>
  );
}
