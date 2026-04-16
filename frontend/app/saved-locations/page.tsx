"use client";

import { FormEvent, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { saveLocation } from "@/lib/api";

export default function SavedLocationsPage() {
  const [label, setLabel] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [message, setMessage] = useState("");

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
      setMessage("Location saved");
      setLabel("");
      setPlaceName("");
      setLatitude("");
      setLongitude("");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save location");
    }
  }

  return (
    <AppShell>
      <section className="max-w-2xl rounded-2xl bg-white p-6 shadow-soft">
        <h1 className="mb-4 text-2xl font-bold text-brand-900">Saved Locations</h1>
        <form className="space-y-3" onSubmit={onSubmit}>
          <input
            required
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Label (Home, Office)"
            className="w-full rounded-xl border border-brand-100 px-4 py-3"
          />
          <input
            required
            value={placeName}
            onChange={(e) => setPlaceName(e.target.value)}
            placeholder="Place name"
            className="w-full rounded-xl border border-brand-100 px-4 py-3"
          />
          <div className="grid gap-3 md:grid-cols-2">
            <input
              required
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="Latitude"
              className="rounded-xl border border-brand-100 px-4 py-3"
            />
            <input
              required
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="Longitude"
              className="rounded-xl border border-brand-100 px-4 py-3"
            />
          </div>
          <button className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white">Save Location</button>
          {message ? <p className="text-sm text-slate-700">{message}</p> : null}
        </form>
      </section>
    </AppShell>
  );
}
