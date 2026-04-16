import { TransportOption } from "@/lib/types";

const modeLabels: Record<TransportOption["mode"], string> = {
  walking: "Walking",
  shared_auto: "Shared Auto",
  bus: "Bus",
  cab: "Cab",
};

export function TransportCard({ option, winner }: { option: TransportOption; winner?: boolean }) {
  return (
    <article className={`rounded-2xl border p-4 shadow-soft ${winner ? "border-brand-700 bg-brand-50" : "border-brand-100 bg-white"}`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-bold text-brand-900">{modeLabels[option.mode]}</h3>
        {winner ? <span className="rounded-full bg-brand-700 px-3 py-1 text-xs font-bold text-white">Best Match</span> : null}
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm text-slate-700">
        <p>Time: {option.estimated_travel_time_min} min</p>
        <p>Cost: INR {option.estimated_cost_inr}</p>
        <p>Distance: {option.distance_km} km</p>
        <p>Crowd: {option.crowd_indicator}</p>
        <p>Weather: {option.weather_indicator}</p>
        <p>Confidence: {Math.round(option.confidence_score * 100)}%</p>
      </div>
    </article>
  );
}
