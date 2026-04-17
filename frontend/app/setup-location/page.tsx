"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/AppShell";

export default function SetupLocationPage() {
  const router = useRouter();
  const [homeAddress, setHomeAddress] = useState("");
  const [officeAddress, setOfficeAddress] = useState("");
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

  function handleUseGPS() {
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported by your browser");
      return;
    }
    setLocating(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        window.localStorage.setItem(
          "exit_right_home",
          JSON.stringify({
            name: homeAddress.trim() || "My Home",
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          })
        );
        setLocating(false);
        setHomeAddress(homeAddress.trim() || "My Current Location");
      },
      () => {
        setLocationError("Unable to get location. Please allow access or enter manually.");
        setLocating(false);
      }
    );
  }

  function handleSave() {
    if (homeAddress.trim()) {
      window.localStorage.setItem(
        "exit_right_home",
        JSON.stringify({ name: homeAddress.trim(), lat: 0, lng: 0 })
      );
    }
    if (officeAddress.trim()) {
      window.localStorage.setItem(
        "exit_right_office",
        JSON.stringify({ name: officeAddress.trim(), lat: 0, lng: 0 })
      );
    }
    router.push("/dashboard");
  }

  function handleSkip() {
    router.push("/dashboard");
  }

  return (
    <AppShell>
      <div className="space-y-6 pt-4">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
            style={{ background: "#eef2ff" }}
          >
            📍
          </div>
          <div>
            <h1 className="text-2xl font-extrabold" style={{ color: "#1a237e" }}>
              Set Your Locations
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Save home &amp; office for one-tap commute planning
            </p>
          </div>
        </div>

        {/* Home address */}
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            HOME ADDRESS
          </p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">🏠</span>
            <input
              value={homeAddress}
              onChange={(e) => setHomeAddress(e.target.value)}
              placeholder="e.g. Dwarka Sector 10, Delhi"
              className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3.5 text-sm outline-none focus:border-[#1a237e]"
              autoComplete="street-address"
            />
          </div>

          {/* GPS button */}
          <button
            onClick={handleUseGPS}
            disabled={locating}
            className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:opacity-60"
            style={{ borderColor: "#1a237e", color: "#1a237e" }}
          >
            <span>📡</span>
            {locating ? "Detecting…" : "Use my current location"}
          </button>
          {locationError && <p className="text-xs text-red-500">{locationError}</p>}
        </div>

        {/* Office address */}
        <div className="space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            OFFICE / WORKPLACE
          </p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl">💼</span>
            <input
              value={officeAddress}
              onChange={(e) => setOfficeAddress(e.target.value)}
              placeholder="e.g. Cyber City, Gurgaon"
              className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3.5 text-sm outline-none focus:border-[#1a237e]"
              autoComplete="off"
            />
          </div>
        </div>

        {/* Info card */}
        <div
          className="flex items-start gap-3 rounded-2xl p-4 text-white"
          style={{ background: "#1a237e" }}
        >
          <span className="mt-0.5 text-xl">💡</span>
          <p className="text-xs text-blue-200 leading-relaxed">
            Your locations are saved only on your device and never shared. You can update
            them anytime from Settings.
          </p>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          className="w-full rounded-xl py-4 font-bold text-white transition hover:opacity-90"
          style={{ background: "#1a237e" }}
        >
          Save &amp; Continue →
        </button>

        {/* Skip */}
        <button
          onClick={handleSkip}
          className="w-full text-center text-sm text-slate-400 transition hover:text-slate-600"
        >
          Skip for now
        </button>
      </div>
    </AppShell>
  );
}
