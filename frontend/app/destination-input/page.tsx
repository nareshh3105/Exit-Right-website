"use client";

import { useState } from "react";

import { AppShell } from "@/components/AppShell";
import { DestinationAutocomplete } from "@/components/DestinationAutocomplete";

export default function DestinationInputPage() {
  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [status, setStatus] = useState("");

  function saveDestination() {
    const parsedLat = Number(lat);
    const parsedLng = Number(lng);
    if (!name || Number.isNaN(parsedLat) || Number.isNaN(parsedLng)) {
      setStatus("Enter destination name and valid coordinates");
      return;
    }
    window.localStorage.setItem(
      "exit_right_destination",
      JSON.stringify({ name, lat: parsedLat, lng: parsedLng }),
    );
    setStatus("Destination saved for recommendation");
  }

  return (
    <AppShell>
      <section className="max-w-2xl space-y-4 rounded-3xl bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-bold text-brand-900">Enter Destination</h1>
        <DestinationAutocomplete
          onPlaceSelected={(place) => {
            setName(place.name);
            setLat(String(place.lat));
            setLng(String(place.lng));
            setStatus("Destination selected from map search");
          }}
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Destination name"
          className="w-full rounded-xl border border-brand-100 px-4 py-3 outline-none focus:border-brand-500"
        />
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="Latitude"
            className="rounded-xl border border-brand-100 px-4 py-3 outline-none focus:border-brand-500"
          />
          <input
            value={lng}
            onChange={(e) => setLng(e.target.value)}
            placeholder="Longitude"
            className="rounded-xl border border-brand-100 px-4 py-3 outline-none focus:border-brand-500"
          />
        </div>
        <button onClick={saveDestination} className="rounded-xl bg-brand-700 px-4 py-2 font-semibold text-white">
          Save Destination
        </button>
        {status ? <p className="text-sm text-slate-700">{status}</p> : null}
      </section>
    </AppShell>
  );
}
