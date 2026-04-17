"use client";

import { FormEvent, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { saveLocation } from "@/lib/api";

const SAVED_PLACES = [
  {
    id: 1,
    icon: "🏠",
    iconBg: "#f97316",
    label: "Home",
    badge: "ACTIVE ROUTE",
    badgeBg: "#dcfce7",
    badgeColor: "#16a34a",
    address: "Dwarka Sector 10, New Delhi",
    accentColor: "#f97316",
  },
  {
    id: 2,
    icon: "💼",
    iconBg: "#1a237e",
    label: "Work",
    badge: "42 MINS AWAY",
    badgeBg: "#fee2e2",
    badgeColor: "#ef4444",
    address: "Cyber City, Gurgaon",
    accentColor: "#1a237e",
  },
  {
    id: 3,
    icon: "☕",
    iconBg: "#92400e",
    label: "Coffee Shop",
    badge: null,
    badgeBg: "",
    badgeColor: "",
    address: "Connaught Place, Central Delhi",
    accentColor: "#92400e",
  },
];

const RECENTLY_VISITED = [
  { day: "YESTERDAY", name: "Hauz Khas Village", sub: "South Delhi" },
  { day: "MONDAY", name: "Rajiv Chowk", sub: "Central Delhi" },
  { day: "SUNDAY", name: "Lajpat Nagar Market", sub: "South Delhi" },
];

export default function SavedLocationsPage() {
  const [label, setLabel] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    try {
      const payload = {
        label,
        place_name: placeName,
        latitude: Number(latitude),
        longitude: Number(longitude),
      };
      await saveLocation(payload);
      setMessage("Location saved successfully");
      setLabel("");
      setPlaceName("");
      setLatitude("");
      setLongitude("");
      setShowForm(false);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save location");
    }
  }

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

        {/* Map placeholder */}
        <div
          className="relative flex h-36 items-center justify-center overflow-hidden rounded-2xl"
          style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #312e81 100%)" }}
        >
          <p className="text-xs font-semibold text-slate-400">[ Map View ]</p>
          <button
            className="absolute bottom-3 right-3 rounded-xl px-3 py-1.5 text-xs font-bold text-white"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            SOUTH DELHI VIEW
          </button>
        </div>

        {/* Add new place button */}
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3 font-bold text-white"
          style={{ background: "#f97316" }}
        >
          <span>+</span> Add New Place
        </button>

        {/* Add form */}
        {showForm && (
          <form className="ui-card space-y-3 p-4" onSubmit={onSubmit}>
            <input required value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label (Home, Office)" className="ui-input" />
            <input required value={placeName} onChange={(e) => setPlaceName(e.target.value)} placeholder="Place name" className="ui-input" />
            <div className="grid grid-cols-2 gap-3">
              <input required value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="Latitude" className="ui-input" />
              <input required value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="Longitude" className="ui-input" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 rounded-xl py-2.5 font-bold text-white" style={{ background: "#1a237e" }}>
                Save Location
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-600">
                Cancel
              </button>
            </div>
            {message && <p className="text-sm text-slate-600">{message}</p>}
          </form>
        )}

        {/* Saved places list */}
        <section>
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            SAVED PLACES
          </p>
          <div className="space-y-2">
            {SAVED_PLACES.map((place) => (
              <div
                key={place.id}
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
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-800">{place.label}</p>
                    {place.badge && (
                      <span
                        className="rounded-full px-2 py-0.5 text-[9px] font-bold"
                        style={{ background: place.badgeBg, color: place.badgeColor }}
                      >
                        {place.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{place.address}</p>
                </div>
                <span className="text-slate-300">›</span>
              </div>
            ))}
          </div>
        </section>

        {/* Recently Visited */}
        <section>
          <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
            RECENTLY VISITED
          </p>
          <div className="space-y-2">
            {RECENTLY_VISITED.map((item) => (
              <div key={item.day} className="ui-card flex items-center gap-3 p-3">
                <span className="text-slate-400">🕐</span>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.sub}</p>
                </div>
                <span
                  className="text-[10px] font-bold uppercase tracking-wide"
                  style={{ color: "#64748b" }}
                >
                  {item.day}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
