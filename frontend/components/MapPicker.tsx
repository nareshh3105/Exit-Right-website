"use client";

import dynamic from "next/dynamic";

// Leaflet requires browser APIs — never render on the server
const MapPicker = dynamic(() => import("./MapPickerInner"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60">
      <div className="rounded-2xl bg-white px-8 py-6 text-sm font-semibold text-slate-700">
        Loading map…
      </div>
    </div>
  ),
});

export default MapPicker;
