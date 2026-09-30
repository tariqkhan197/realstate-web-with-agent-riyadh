import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CITIES, REGION_LABEL } from "@/data/locations";
import { allNeighborhoodInfo } from "@/services/neighborhood";

export const metadata: Metadata = { title: "Neighborhood Explorer", description: "Guides to Riyadh, Jeddah, Dammam, Khobar, Makkah and Madinah districts: lifestyle, amenities, transport and demo price ranges." };

export default function NeighborhoodsPage() {
  const all = allNeighborhoodInfo();
  return <div className="mx-auto max-w-[1360px] px-5 pb-28 pt-10 lg:px-8">
    <p className="text-[12px] font-bold uppercase tracking-[.14em] text-gold-700">Neighborhood explorer</p>
    <h1 className="mt-2 text-display">Know the district before the door</h1>
    <p className="mt-2 max-w-2xl text-ink-3">Lifestyle, amenities and transport notes with demo price bands. Figures marked demo are illustrative, not market data.</p>
    {CITIES.map((c) => {
      const hs = all.filter((i) => i.neighborhood.city === c.slug);
      if (!hs.length) return null;
      return <section key={c.slug} className="mt-12" aria-labelledby={`c-${c.slug}`}>
        <h2 id={`c-${c.slug}`} className="text-title">{c.name} <span className="font-arabic text-lg font-semibold text-ink-3">{c.nameAr}</span></h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hs.map(({ neighborhood: n, listings }) => (
            <Link key={n.slug} href={`/neighborhoods/${n.slug}`} className="surface group flex flex-col p-5 transition-shadow hover:shadow-lift">
              <div className="flex items-start justify-between gap-2"><div><p className="text-lg font-bold">{n.name}</p><p className="text-[13px] text-ink-3">{REGION_LABEL[n.region]} {c.name} · <span className="font-arabic">{n.nameAr}</span></p></div><ArrowUpRight size={18} className="text-ink-4 group-hover:text-palm-700" /></div>
              <p className="mt-3 line-clamp-2 text-[13.5px] text-ink-2">{n.summary}</p>
              <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                <Badge tone="palm">{listings} listings</Badge>
                <Badge tone="gold">SAR {n.demoPricePerSqm[0].toLocaleString()}–{n.demoPricePerSqm[1].toLocaleString()}/sqm · demo</Badge>
              </div>
            </Link>
          ))}
        </div>
      </section>;
    })}
  </div>;
}
