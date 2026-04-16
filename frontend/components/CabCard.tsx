import { CabOption } from "@/lib/types";

export function CabCard({ option, onGo }: { option: CabOption; onGo: (item: CabOption) => void }) {
  return (
    <article className="rounded-2xl border border-brand-100 bg-white p-4 shadow-soft">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-bold text-brand-900">{option.provider}</h3>
        <div className="flex gap-2">
          {option.recommended ? (
            <span className="rounded-full bg-brand-700 px-2 py-1 text-xs font-semibold text-white">Recommended</span>
          ) : null}
          {option.cheapest ? (
            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800">Cheapest</span>
          ) : null}
        </div>
      </div>
      <p className="text-sm text-slate-700">Estimated price: INR {option.estimated_price_inr}</p>
      <p className="mb-4 text-sm text-slate-700">ETA: {option.eta_min} min</p>
      <button
        onClick={() => onGo(option)}
        className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-900"
      >
        Go To Provider
      </button>
    </article>
  );
}
