"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";

const COLS = [
  { title: "Explore", links: [["Buy", "/buy"], ["Rent", "/rent"], ["Projects", "/projects"], ["Map", "/map"], ["Neighbourhoods", "/neighborhoods"]] },
  { title: "Tools", links: [["AI Agent", "/agent"], ["Property matching", "/match"], ["Investment analysis", "/investment"], ["Compare", "/compare"]] },
  { title: "Business", links: [["For agents", "/for-agents"], ["Agent dashboard", "/dashboard"], ["Admin", "/admin"]] },
];

export function Footer() {
  const path = usePathname();
  if (/^\/(agent|dashboard|admin)/.test(path)) return null;
  return (
    <footer className="mt-24 border-t border-line bg-white pb-24 lg:pb-0">
      <div className="mx-auto grid max-w-[1360px] gap-10 px-5 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)] lg:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-3">Your AI real estate agent for Saudi Arabia. Search, compare and finance property with an agent that does the legwork.</p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <h3 className="text-sm font-bold">{c.title}</h3>
            <ul className="mt-3 space-y-2">{c.links.map(([l, h]) => <li key={h}><Link href={h} className="text-sm text-ink-3 hover:text-ink">{l}</Link></li>)}</ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <p className="mx-auto max-w-[1360px] px-5 py-5 text-xs leading-relaxed text-ink-3 lg:px-8">
          Riyah is a product demo. Listings, brokers, prices, yields and licence numbers (except where supplied for the primary demo listing) are demo data and are not verified. Nothing on this site is financial advice.
        </p>
      </div>
    </footer>
  );
}
