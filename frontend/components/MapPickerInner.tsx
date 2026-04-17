"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

interface Props {
  initialLat?: number;
  initialLng?: number;
  onConfirm: (lat: number, lng: number, name: string) => void;
  onClose: () => void;
}

export default function MapPickerInner({
  initialLat = 13.0827,
  initialLng = 80.2707,
  onConfirm,
  onClose,
}: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<unknown>(null);
  const markerRef = useRef<unknown>(null);
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState("");
  const [loadingAddr, setLoadingAddr] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    import("leaflet").then((L) => {
      // Fix default icon paths for bundled environments
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!).setView([initialLat, initialLng], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
        const { lat, lng } = e.latlng;
        setPin({ lat, lng });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (markerRef.current) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (markerRef.current as any).setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng]).addTo(map);
        }

        // Reverse geocode with Nominatim (free, no key needed)
        setLoadingAddr(true);
        fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
          { headers: { "Accept-Language": "en" } }
        )
          .then((r) => r.json())
          .then((data) => {
            const parts = (data.display_name as string)?.split(",") ?? [];
            setAddress(parts.slice(0, 3).join(", ").trim());
          })
          .catch(() => {
            setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
          })
          .finally(() => setLoadingAddr(false));
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mapInstance.current = map as any;
    });

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (mapInstance.current) { (mapInstance.current as any).remove(); mapInstance.current = null; }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleConfirm() {
    if (!pin) return;
    onConfirm(
      pin.lat,
      pin.lng,
      address || `${pin.lat.toFixed(5)}, ${pin.lng.toFixed(5)}`
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ background: "#1a237e" }}
      >
        <button
          onClick={onClose}
          className="rounded-xl px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/10"
        >
          ✕ Cancel
        </button>
        <p className="font-bold text-white">Drop a Pin</p>
        <button
          onClick={handleConfirm}
          disabled={!pin}
          className="rounded-xl px-4 py-1.5 text-sm font-bold text-white disabled:opacity-40"
          style={{ background: "#f97316" }}
        >
          Confirm
        </button>
      </div>

      <p className="bg-slate-50 px-4 py-2 text-xs text-slate-500">
        Tap anywhere on the map to set your destination
      </p>

      {/* Map fills remaining space */}
      <div ref={mapRef} className="flex-1" />

      {/* Selected location info */}
      {pin && (
        <div className="border-t border-slate-100 bg-white px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            SELECTED LOCATION
          </p>
          <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
            {loadingAddr ? "Getting address…" : address}
          </p>
          <p className="text-xs text-slate-400">
            {pin.lat.toFixed(5)}, {pin.lng.toFixed(5)}
          </p>
        </div>
      )}
    </div>
  );
}
