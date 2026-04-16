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
      <section className="ui-card max-w-2xl p-6">
        <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-[#000666]">Saved Locations</h1>
        <form className="space-y-3" onSubmit={onSubmit}>
          <input
            required
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Label (Home, Office)"
            className="ui-input"
          />
          <input
            required
            value={placeName}
            onChange={(e) => setPlaceName(e.target.value)}
            placeholder="Place name"
            className="ui-input"
          />
          <div className="grid gap-3 md:grid-cols-2">
            <input
              required
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="Latitude"
              className="ui-input"
            />
            <input
              required
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="Longitude"
              className="ui-input"
            />
          </div>
          <button className="ui-button-primary">Save Location</button>
          {message ? <p className="text-sm text-slate-600">{message}</p> : null}
        </form>
      </section>
    </AppShell>
  );
}
