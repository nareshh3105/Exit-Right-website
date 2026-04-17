"use client";

import { useState } from "react";

import { AppShell } from "@/components/AppShell";
import { compareCabs } from "@/lib/api";
import { CabComparisonResponse, CabOption } from "@/lib/types";

const MODE_CARDS = [
  {
    key: "erickshaw",
    icon: "⚡",
    iconBg: "#16a34a",
    label: "E-Rickshaw",
    badge: "Eco Friendly",
    badgeBg: "#dcfce7",
    badgeColor: "#16a34a",
    price: "₹10 Shared",
    time: "8m",
    comfort: "Low",
    highlighted: false,
    bookable: false,
  },
  {
    key: "auto",
    icon: "🛺",
    iconBg: "#1a237e",
    label: "Auto Rickshaw",
    badge: "Fastest Route",
    badgeBg: "#eef2ff",
    badgeColor: "#1a237e",
    price: "₹50 Private",
    time: "6m",
    comfort: "High",
    highlighted: true,
    bookable: true,
  },
  {
    key: "dtc",
    icon: "🚌",
    iconBg: "#ef4444",
    label: "DTC Bus",
    badge: "Route 502",
    badgeBg: "#fee2e2",
    badgeColor: "#ef4444",
    price: "₹5 AC Bus",
    time: "20m",
    comfort: "Moderate",
    highlighted: false,
    bookable: false,
  },
];

export default function CabComparisonPage() {
  const [distanceKm, setDistanceKm] = useState("5");
  const [result, setResult] = useState<CabComparisonResponse | null>(null);
  const [error, setError] = useState("");

  async function runComparison() {
    setError("");
    try {
      const stationRaw = window.localStorage.getItem("exit_right_station");
      const destinationRaw = window.localStorage.getItem("exit_right_destination");
      if (!stationRaw || !destinationRaw) {
        throw new Error("Select station and destination first");
      }
      const station = JSON.parse(stationRaw);
      const destination = JSON.parse(destinationRaw);
      const data = await compareCabs({
        pickup_lat: station.latitude,
        pickup_lng: station.longitude,
        drop_lat: destination.lat,
        drop_lng: destination.lng,
        distance_km: Number(distanceKm),
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not compare cabs");
    }
  }

  function openProvider(option: CabOption) {
    window.location.href = option.deep_link;
    window.setTimeout(() => {
      window.location.href = option.fallback_link;
    }, 1200);
  }

  return (
    <AppShell>
      <div className="space-y-4">
        {/* Orange alert banner */}
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-3 text-white"
          style={{ background: "#f97316" }}
        >
          <span className="text-lg">⚠️</span>
          <p className="text-sm font-semibold">
            Waterlogging at NH-8 adding 15 min delay
          </p>
        </div>

        {/* Dark map placeholder */}
        <div
          className="flex h-44 items-center justify-center rounded-2xl"
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            backgroundImage:
              "repeating-linear-gradient(0deg,transparent,transparent 20px,rgba(99,102,241,0.07) 20px,rgba(99,102,241,0.07) 21px),repeating-linear-gradient(90deg,transparent,transparent 20px,rgba(99,102,241,0.07) 20px,rgba(99,102,241,0.07) 21px)",
          }}
        >
          <p className="text-xs font-semibold text-slate-500">[ Route Map ]</p>
        </div>

        {/* Heading */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            ROUTE COMPARISON
          </p>
          <h1 className="text-2xl font-extrabold text-slate-900">Choose your mode</h1>
        </div>

        {/* Distance input + compare button */}
        <div className="flex gap-3">
          <input
            value={distanceKm}
            onChange={(e) => setDistanceKm(e.target.value)}
            className="ui-input w-36"
            placeholder="Distance (km)"
          />
          <button
            onClick={runComparison}
            className="flex-1 rounded-xl font-bold text-white transition"
            style={{ background: "#1a237e" }}
          >
            Compare
          </button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* Mode cards — always shown (default UI), replaced by API results if available */}
        <div className="space-y-3">
          {result
            ? result.options.map((option) => (
                <div
                  key={option.provider}
                  className="ui-card flex items-center gap-3 p-4"
                  style={option.recommended ? { border: "2px solid #1a237e" } : {}}
                >
                  <span className="text-2xl">🚗</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-800">{option.provider}</p>
                      {option.recommended && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                          Recommended
                        </span>
                      )}
                      {option.cheapest && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-800">
                          Cheapest
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      ₹{option.estimated_price_inr} &bull; {option.eta_min} min
                    </p>
                  </div>
                  <button
                    onClick={() => openProvider(option)}
                    className="rounded-xl px-3 py-2 text-xs font-bold text-white"
                    style={{ background: "#f97316" }}
                  >
                    BOOK NOW
                  </button>
                </div>
              ))
            : MODE_CARDS.map((m) => (
                <div
                  key={m.key}
                  className="rounded-2xl p-4"
                  style={
                    m.highlighted
                      ? { background: "#fff", border: "2px solid #1a237e" }
                      : { background: "#fff", border: "1px solid #e2e8f0" }
                  }
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xl text-white"
                      style={{ background: m.iconBg }}
                    >
                      {m.icon}
                    </span>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-slate-800">{m.label}</p>
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                          style={{ background: m.badgeBg, color: m.badgeColor }}
                        >
                          {m.badge}
                        </span>
                      </div>
                      <div className="mt-1 flex gap-3 text-xs text-slate-500">
                        <span>{m.price}</span>
                        <span>TIME: {m.time}</span>
                        <span>COMFORT: {m.comfort}</span>
                      </div>
                    </div>
                    {m.bookable && (
                      <button
                        className="rounded-xl px-3 py-2 text-xs font-bold text-white"
                        style={{ background: "#1a237e" }}
                      >
                        BOOK NOW
                      </button>
                    )}
                  </div>
                </div>
              ))}
        </div>
      </div>
    </AppShell>
  );
}
