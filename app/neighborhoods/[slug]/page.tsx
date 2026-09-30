import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Bus, Coffee, Info, Sparkles, Trees } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DistrictMap } from "@/components/map/DistrictMap";
import { PropertyCard } from "@/components/property/PropertyCard";
import { NEIGHBORHOODS, REGION_LABEL, getCity } from "@/data/locations";
import { TYPE_LABEL } from "@/data/properties";
import { getNeighborhoodInfo } from "@/services/neighborhood";
import { allProperties } from "@/services/propertySearch";
import { formatSAR } from "@/lib/utils";
import type { PropertyType } from "@/types";

export const generateStaticParams = () => NEIGHBORHOODS.map((n) => ({ slug: n.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const info = getNeighborhoodInfo((await params).slug);
  if (!info) return { title: "Neighborhood not found" };
  const n = info.neighborhood;
  return { title: `${n.name}, ${getCity(n.city)?.name} — neighborhood guide`, description: n.summary };
}

export default async function NeighborhoodPage({ params }: { params: Promise<{ slug: string }> }) {
  const info = getNeighborhoodInfo((await params).slug);
  if (!info) notFound();
  const n = info.neighborhood;
  const city = getCity(n.city)!;
  const ls = allProperties().filter((p) => p.neighborhood === n.slug);
  const cityLs = allProperties().filter((p) => p.city === n.city);
  const mix = Object.entries(n.propertyMix) as [PropertyType, number][];

  return <div className="mx-auto max-w-[1360px] px-5 pb-28 pt-10 lg:px-8">
    <nav aria-label="Breadcrumb" className="text-[13px] text-ink-3"><Link href="/neighborhoods" className="hover:text-ink">Neighborhoods</Link> / {city.name}</nav>
    <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-display">{n.name} <span className="font-arabic text-[0.7em] font-semibold text-ink-3">{n.nameAr}</span></h1><p className="mt-2 text-ink-3">{REGION_LABEL[n.region]} {city.name}</p></div>
      <div className="flex gap-2"><Button asChild variant="secondary"><Link href={`/buy?q=${encodeURIComponent(n.name)}`}>Browse listings</Link></Button><Button asChild><Link href={`/agent?q=${encodeURIComponent(`Tell me about ${n.name}`)}`}><Sparkles size={16} className="text-gold-400" />Ask Raed</Link></Button></div>
    </div>

    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-6">
        <section className="surface p-6"><h2 className="text-title">Overview</h2><p className="mt-3 text-ink-2">{n.summary}</p></section>
        <section className="rounded-2xl bg-palm-950 p-6 text-white">
          <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[.12em] text-gold-400"><Sparkles size={13} />AI-generated summary</p>
          <p className="mt-3 leading-relaxed text-white/85">{info.aiSummary}</p>
        </section>
        <div className="grid gap-4 md:grid-cols-3">
          <section className="surface p-5"><h2 className="flex items-center gap-2 font-bold"><Coffee size={16} className="text-palm-700" />Nearby amenities</h2><ul className="mt-2 space-y-1 text-[13.5px] text-ink-2">{n.amenities.map((a) => <li key={a}>{a}</li>)}</ul></section>
          <section className="surface p-5"><h2 className="flex items-center gap-2 font-bold"><Trees size={16} className="text-palm-700" />Lifestyle</h2><ul className="mt-2 space-y-1 text-[13.5px] text-ink-2">{n.lifestyle.map((a) => <li key={a}>{a}</li>)}</ul></section>
          <section className="surface p-5"><h2 className="flex items-center gap-2 font-bold"><Bus size={16} className="text-palm-700" />Transport</h2><p className="mt-2 text-[13.5px] text-ink-2">{n.transport}</p></section>
        </div>
        <DistrictMap city={n.city} properties={cityLs.filter((p) => p.neighborhood === n.slug || ls.length === 0)} className="h-[380px]" />
      </div>
      <aside className="space-y-4">
        <section className="surface p-5">
          <div className="flex items-center justify-between"><h2 className="font-bold">Price ranges</h2><Badge tone="gold">Demo estimate</Badge></div>
          <dl className="mt-3 space-y-3 text-[14px]">
            <div className="flex justify-between"><dt className="text-ink-3">Apartments, per sqm</dt><dd className="num font-semibold">SAR {n.demoPricePerSqm[0].toLocaleString()}–{n.demoPricePerSqm[1].toLocaleString()}</dd></div>
            {info.demoAvgPricePerSqm && <div className="flex justify-between"><dt className="text-ink-3">Riyah listings avg / sqm</dt><dd className="num font-semibold">{formatSAR(Math.round(info.demoAvgPricePerSqm))}</dd></div>}
            {info.priceRange && <div className="flex justify-between"><dt className="text-ink-3">Listed sale range</dt><dd className="num font-semibold">{formatSAR(info.priceRange[0], { compact: true })}–{formatSAR(info.priceRange[1], { compact: true })}</dd></div>}
            <div className="flex justify-between"><dt className="text-ink-3">Gross yield assumption</dt><dd className="num font-semibold">{n.demoYield[0]}–{n.demoYield[2]}%</dd></div>
            <div className="flex justify-between"><dt className="text-ink-3">Listings</dt><dd className="num font-semibold">{info.forSale} sale · {info.forRent} rent</dd></div>
          </dl>
        </section>
        <section className="surface p-5">
          <h2 className="font-bold">Property types</h2>
          <ul className="mt-3 space-y-2">{mix.map(([t, v]) => <li key={t} className="grid grid-cols-[90px_1fr_36px] items-center gap-2 text-[13px]"><span>{TYPE_LABEL[t]}</span><span className="h-2 overflow-hidden rounded-full bg-ink/[.06]"><span className="block h-full rounded-full bg-palm-700" style={{ width: `${v}%` }} /></span><span className="num text-end text-ink-3">{v}%</span></li>)}</ul>
          <p className="mt-2 text-[11.5px] text-ink-4">Illustrative stock mix (demo).</p>
        </section>
        <p className="flex gap-2 text-[12px] text-ink-4"><Info size={13} className="mt-0.5 shrink-0" />Real-world statistics are not connected. All figures on this page are demo or estimated.</p>
      </aside>
    </div>

    {ls.length > 0 && <section className="mt-12"><h2 className="text-title">Listings in {n.name}</h2><div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{ls.slice(0, 8).map((p) => <PropertyCard key={p.id} property={p} />)}</div></section>}
  </div>;
}
