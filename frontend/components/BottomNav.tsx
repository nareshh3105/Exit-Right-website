"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/saved-locations", label: "Saved", icon: "🔖" },
  { href: "/recommendation-history", label: "Alerts", icon: "🔔" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2"
      style={{ background: "#1a237e", height: 64 }}
    >
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-0.5 px-4 py-1 transition"
          >
            <span className="text-xl leading-none">{item.icon}</span>
            <span
              className="text-[10px] font-semibold tracking-wide"
              style={{ color: active ? "#ffffff" : "#7986cb" }}
            >
              {item.label}
            </span>
            {active && (
              <span className="mt-0.5 h-0.5 w-4 rounded-full bg-orange-400" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
