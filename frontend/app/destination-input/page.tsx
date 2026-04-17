"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/AppShell";

interface Destination {
  name: string;
  lat: number;
  lng: number;
}

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
    if (Number.isNaN(lat) || lat < 8 || lat > 14) { setError("Enter a valid latitude for Chennai (8–14°N)"); return; }
    if (Number.isNaN(lng) || lng < 77 || lng > 82) { setError("Enter a valid longitude for Chennai (77–82°E)"); return; }
    saveAndSelect({ name: query.trim(), lat, lng });
    setShowMap(false);
  }

  function handleNext() {
    if (!selected) { setError("Please select a destination first"); return; }
    router.push("/recommendation");
  }

  return (
    <AppShell>
      <section className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden rounded-3xl border border-[#e6e3e2] bg-[#fcf9f8] p-6 shadow-soft">
          <h1 className="mb-5 text-5xl font-extrabold tracking-tight text-[#000666]">Where to?</h1>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔎</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter destination name"
              className="ui-input pl-11 text-base font-medium"
            />
          </div>
        </div>

        {/* Quick options */}
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={handleUseLocation}
            disabled={locating}
            className="flex items-center gap-3 rounded-2xl border border-[#003909]/20 bg-[#d8f1e5] px-5 py-4 font-semibold text-[#003909] transition hover:bg-[#c0e8d0] disabled:opacity-60"
          >
            <span className="text-xl">📍</span>
            {locating ? "Getting location…" : "Use My Current Location"}
          </button>
          <button
            onClick={() => setShowMap((v) => !v)}
            className="flex items-center gap-3 rounded-2xl border border-[#000666]/20 bg-[#eeeeff] px-5 py-4 font-semibold text-[#000666] transition hover:bg-[#ddddf8]"
          >
            <span className="text-xl">🗺️</span>
            Select on Map
          </button>
        </div>

        {/* Map coordinate picker */}
        {showMap && (
          <div className="rounded-3xl border border-[#e6e3e2] bg-white p-6 shadow-soft space-y-4">
            <h2 className="font-bold text-[#1b1c1c]">Enter coordinates (Chennai area)</h2>
            <p className="text-xs text-slate-500">
              Open <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="underline text-[#000666]">Google Maps</a>,
              right-click your destination → copy the coordinates, then paste below.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={mapLat}
                onChange={(e) => setMapLat(e.target.value)}
                placeholder="Latitude (e.g. 13.0827)"
                className="ui-input text-sm"
              />
              <input
                value={mapLng}
                onChange={(e) => setMapLng(e.target.value)}
                placeholder="Longitude (e.g. 80.2707)"
                className="ui-input text-sm"
              />
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Location name (e.g. Anna Nagar)"
              className="ui-input text-sm w-full"
            />
            <div className="flex gap-3">
              <button
                onClick={handleMapConfirm}
                className="rounded-xl bg-[#003909] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#005514]"
              >
                Confirm Location
              </button>
              <button
                onClick={() => setShowMap(false)}
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Selected destination */}
        {selected && (
          <div className="flex items-center gap-3 rounded-2xl border border-[#003909]/20 bg-[#d8f1e5] px-5 py-4">
            <span className="text-xl">📌</span>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest text-[#003909]">Selected Destination</p>
              <p className="font-bold text-[#1b1c1c]">{selected.name}</p>
              <p className="text-xs text-slate-500">{selected.lat.toFixed(4)}, {selected.lng.toFixed(4)}</p>
            </div>
            <button onClick={() => setSelected(null)} className="text-xs text-slate-500 hover:text-red-500">✕</button>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/station-selector")}
            className="flex items-center gap-2 rounded-2xl border border-slate-200 px-6 py-3 font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            ← Back
          </button>
          <button
            onClick={handleNext}
            disabled={!selected}
            className="flex items-center gap-2 rounded-2xl bg-[#003909] px-8 py-3 font-bold text-white transition hover:bg-[#005514] disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </section>
    </AppShell>
  );
}
