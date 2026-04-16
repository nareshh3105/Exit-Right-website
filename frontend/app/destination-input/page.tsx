"use client";

import Link from "next/link";
import { useState } from "react";

import { AppShell } from "@/components/AppShell";
import { DestinationAutocomplete } from "@/components/DestinationAutocomplete";

export default function DestinationInputPage() {
  const [turnInLocation, setTurnInLocation] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [status, setStatus] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [inputMode, setInputMode] = useState<"manual" | "map">("manual");

  function saveDestination() {
    const parsedLat = Number(lat);
    const parsedLng = Number(lng);
    if (!turnInLocation || Number.isNaN(parsedLat) || Number.isNaN(parsedLng)) {
      setStatus("Enter turn-in location and valid coordinates");
      setIsSaved(false);
      return;
    }
    window.localStorage.setItem(
      "exit_right_destination",
      JSON.stringify({
        name: turnInLocation,
        turn_in_location: turnInLocation,
        lat: parsedLat,
        lng: parsedLng,
      }),
    );
    setStatus("Destination saved for recommendation");
    setIsSaved(true);
  }

  return (
    <AppShell>
      <section className="max-w-2xl space-y-4 rounded-3xl bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-bold text-brand-900">Enter Destination</h1>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setInputMode("manual")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              inputMode === "manual"
                ? "bg-brand-700 text-white"
                : "bg-brand-100 text-brand-900 hover:bg-brand-200"
            }`}
          >
            Enter Manually
          </button>
          <button
            type="button"
            onClick={() => setInputMode("map")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              inputMode === "map" ? "bg-brand-700 text-white" : "bg-brand-100 text-brand-900 hover:bg-brand-200"
            }`}
          >
            Select on Map
          </button>
        </div>
        {inputMode === "map" ? (
          <DestinationAutocomplete
            onPlaceSelected={(place) => {
              setTurnInLocation(place.name);
              setLat(String(place.lat));
              setLng(String(place.lng));
              setStatus("Destination selected from map search");
              setIsSaved(false);
            }}
          />
        ) : null}
        <input
          value={turnInLocation}
          onChange={(e) => {
            setTurnInLocation(e.target.value);
            setIsSaved(false);
          }}
          placeholder="Location to turn in"
          className="w-full rounded-xl border border-brand-100 px-4 py-3 outline-none focus:border-brand-500"
        />
        <div className="grid gap-3 md:grid-cols-2">
          <input
            value={lat}
            onChange={(e) => {
              setLat(e.target.value);
              setIsSaved(false);
            }}
            placeholder="Latitude"
            className="rounded-xl border border-brand-100 px-4 py-3 outline-none focus:border-brand-500"
          />
          <input
            value={lng}
            onChange={(e) => {
              setLng(e.target.value);
              setIsSaved(false);
            }}
            placeholder="Longitude"
            className="rounded-xl border border-brand-100 px-4 py-3 outline-none focus:border-brand-500"
          />
        </div>
        <button onClick={saveDestination} className="rounded-xl bg-brand-700 px-4 py-2 font-semibold text-white">
          Save Destination
        </button>
        {status ? <p className="text-sm text-slate-700">{status}</p> : null}
        {isSaved ? (
          <Link href="/recommendation" className="inline-flex rounded-xl bg-brand-900 px-4 py-2 font-semibold text-white">
            Next
          </Link>
        ) : null}
      </section>
    </AppShell>
  );
}
