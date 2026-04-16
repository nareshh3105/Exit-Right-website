import Link from "next/link";

import { AppShell } from "@/components/AppShell";

const cards = [
  { href: "/station-selector", title: "1. Select Station", text: "Choose Guindy, Alandur, Vadapalani, Egmore, or CMBT." },
  { href: "/destination-input", title: "2. Enter Destination", text: "Use Google Places autocomplete or manual coordinates." },
  { href: "/recommendation", title: "3. View Recommendation", text: "Get best exit gate + ranked transport modes." },
  { href: "/cab-comparison", title: "4. Compare Cabs", text: "See Uber, Ola, Rapido, and Namma Yatri prices." },
];

export default function DashboardPage() {
  return (
    <AppShell>
      <h1 className="mb-6 text-3xl font-extrabold text-brand-900">Commuter Dashboard</h1>
      <section className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="rounded-2xl border border-brand-100 bg-white p-5 shadow-soft transition hover:-translate-y-1">
            <h2 className="mb-2 text-lg font-bold text-brand-900">{card.title}</h2>
            <p className="text-sm text-slate-700">{card.text}</p>
          </Link>
        ))}
      </section>
    </AppShell>
  );
}
