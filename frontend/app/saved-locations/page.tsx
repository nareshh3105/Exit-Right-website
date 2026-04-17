"use client";

import { FormEvent, useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { saveLocation } from "@/lib/api";

interface LocalPlace {
  name: string;
  lat: number;
  lng: number;
}

export default function SavedLocationsPage() {
  const [home, setHome] = useState<LocalPlace | null>(null);
  const [office, setOffice] = useState<LocalPlace | null>(null);
  const [label, setLabel] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const h = window.localStorage.getItem("exit_right_home");
    const o = window.localStorage.getItem("exit_right_office");
    if (h) { try { setHome(JSON.parse(h)); } catch { /* ignore */ } }
    if (o) { try { setOffice(JSON.parse(o)); } catch { /* ignore */ } }
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    try {
      await saveLocation({
        label,
        place_name: placeName,
        latitude: Number(latitude),
        longitude: Number(longitude),
      });
      // Also save to localStorage for quick access
      const saved = { name: placeName, lat: Number(latitude), lng: Number(longitude) };
      if (label.toLowerCase().includes("home")) {
        window.localStorage.setItem("exit_right_home", JSON.stringify(saved));
        setHome(saved);
      } else if (label.toLowerCase().includes("office") || label.toLowerCase().includes("work")) {
        window.localStorage.setItem("exit_right_office", JSON.stringify(saved));
        setOffice(saved);
      }
      setMessage("✓ Location saved");
      setLabel(""); setPlaceName(""); setLatitude(""); setLongitude("");
      setShowForm(false);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save location");
    }
  }

  const savedPlaces = [
    home ? { key: "home", icon: "🏠", iconBg: "#f97316", label: "Home", address: home.name, accentColor: "#f97316" } : null,
    office ? { key: "office", icon: "💼", iconBg: "#1a237e", label: "Office", address: office.name, accentColor: "#1a237e" } : null,
  ].filter(Boolean) as { key: string; icon: string; iconBg: string; label: string; address: string; accentColor: string }[];

  return (
    <AppShell>
      <div className="space-y-5">
        {/* Heading */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            YOUR DESTINATIONS
          </p>
          <h1 className="text-2xl font-extrabold text-slate-900">Saved Places</h1>
          <p className="mt-0.5 text-sm text-slate-500">Your frequent destinations at a glance</p>
        </div>

        {/* Add new place button */}
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3 font-bold text-white transition hover:opacity-90"
          style={{ background: "#f97316" }}
        >
          <span>+</span> Add New Place
        </button>

        {/* Add form */}
        {showForm && (
          <form className="ui-card space-y-3 p-4" onSubmit={onSubmit}>
            <input
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Label (e.g. Home, Office, Gym)"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#1a237e]"
            />
            <input
              required
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              placeholder="Place name or address"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#1a237e]"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                required
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="Latitude"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#1a237e]"
              />
              <input
                required
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="Longitude"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#1a237e]"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded-xl py-2.5 font-bold text-white"
                style={{ background: "#1a237e" }}
              >
                Save Location
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-600"
              >
                Cancel
              </button>
            </div>
            {message && (
              <p className={`text-sm ${message.startsWith("✓") ? "text-green-600" : "text-red-600"}`}>
                {message}
              </p>
            )}
          </form>
        )}

        {/* Saved places list */}
        <section>
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            SAVED PLACES
          </p>
          {savedPlaces.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <span className="text-4xl">📍</span>
              <p className="text-sm text-slate-500">
                No saved places yet. Tap &ldquo;Add New Place&rdquo; above.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {savedPlaces.map((place) => (
                <div
                  key={place.key}
                  className="flex items-center gap-3 overflow-hidden rounded-2xl bg-white p-3 shadow-sm"
                  style={{ borderLeft: `4px solid ${place.accentColor}` }}
                >
                  <span
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xl text-white"
                    style={{ background: place.iconBg }}
                  >
                    {place.icon}
                  </span>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800">{place.label}</p>
                    <p className="text-xs text-slate-500 truncate">{place.address}</p>
                  </div>
                  <span className="text-slate-300">›</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
