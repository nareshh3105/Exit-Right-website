"use client";

import { useDeferredValue, useEffect, useState } from "react";

import { searchPlaces } from "@/lib/api";
import { PlaceSuggestion } from "@/lib/types";

type Props = {
  onPlaceSelected: (value: { name: string; lat: number; lng: number }) => void;
};

export function DestinationAutocomplete({ onPlaceSelected }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    const trimmed = deferredQuery.trim();
    if (trimmed.length < 3) {
      setResults([]);
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const places = await searchPlaces(trimmed);
        if (active) {
          setResults(places);
        }
      } catch {
        if (active) {
          setResults([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [deferredQuery]);

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowResults(true);
        }}
        onFocus={() => setShowResults(true)}
        placeholder="Search destination (OpenStreetMap search)"
        className="w-full rounded-xl border border-brand-100 bg-white px-4 py-3 text-sm shadow-soft outline-none focus:border-brand-500"
      />
      {showResults && (loading || results.length > 0 || deferredQuery.trim().length >= 3) ? (
        <div className="absolute z-10 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-brand-100 bg-white p-2 shadow-soft">
          {loading ? <p className="px-3 py-2 text-sm text-slate-500">Searching places...</p> : null}
          {!loading && results.length === 0 ? (
            <p className="px-3 py-2 text-sm text-slate-500">No matches yet. You can still enter coordinates manually.</p>
          ) : null}
          {results.map((item) => (
            <button
              key={`${item.latitude}-${item.longitude}-${item.name}`}
              type="button"
              onClick={() => {
                setQuery(item.name);
                setShowResults(false);
                onPlaceSelected({
                  name: item.name,
                  lat: item.latitude,
                  lng: item.longitude,
                });
              }}
              className="block w-full rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-brand-50"
            >
              {item.name}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
