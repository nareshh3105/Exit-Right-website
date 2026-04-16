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
      <h1 className="mb-2 text-4xl font-extrabold tracking-tight text-[#000666]">Where to?</h1>
      <p className="mb-6 text-sm text-slate-600">Pick a step to continue your trip flow.</p>
      <section className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="ui-card p-5 transition hover:-translate-y-0.5">
            <h2 className="mb-2 text-lg font-bold text-[#1b1c1c]">{card.title}</h2>
            <p className="text-sm text-slate-600">{card.text}</p>
          </Link>
        ))}
      </section>
    </AppShell>
  );
}
