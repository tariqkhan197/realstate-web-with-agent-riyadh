"use client";
import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DistrictMap, SaudiMap } from "@/components/map/DistrictMap";
import { locationLine } from "@/components/property/PropertyCard";
import { PropertyPhoto, coverOf } from "@/components/property/PropertyImage";
import { Tabs } from "@/components/ui/misc";
import { CITIES, neighborhoodsIn } from "@/data/locations";
import { allProperties } from "@/services/propertySearch";
import { cn, formatSAR } from "@/lib/utils";
import type { CitySlug, Purpose } from "@/types";

export function MapExplorer() {
  const params = useSearchParams();
  const [city, setCity] = React.useState<CitySlug>((params.get("city") as CitySlug) || "riyadh");
  const [purpose, setPurpose] = React.useState<Purpose | "all">("all");
  const [hood, setHood] = React.useState("");
  const [sel, setSel] = React.useState<string>();
  const all = allProperties();
  const counts = Object.fromEntries(CITIES.map((c) => [c.slug, all.filter((p) => p.city === c.slug).length]));
  const list = all.filter((p) => p.city === city && (purpose === "all" || p.purpose === purpose) && (!hood || p.neighborhood === hood));
  const listRef = React.useRef<HTMLUListElement>(null);
  React.useEffect(() => { if (sel) listRef.current?.querySelector(`[data-id="${sel}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" }); }, [sel]);

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <div className="space-y-4">
        <SaudiMap counts={counts} active={city} onPick={(c) => { setCity(c); setHood(""); setSel(undefined); }} />
        <Tabs value={purpose} onChange={setPurpose} items={[{ value: "all", label: "All" }, { value: "sale", label: "Buy" }, { value: "rent", label: "Rent" }]} className="w-full [&>button]:flex-1" />
        <div>
          <p className="label">Neighborhoods</p>
          <div className="flex flex-wrap gap-1.5">
            <button type="button" onClick={() => setHood("")} aria-pressed={!hood} className={cn("h-8 rounded-full border px-3 text-[12.5px] font-semibold", !hood ? "border-palm-900 bg-palm-900 text-white" : "border-line bg-white")}>All</button>
            {neighborhoodsIn(city).map((n) => <button key={n.slug} type="button" onClick={() => setHood(n.slug)} aria-pressed={hood === n.slug} className={cn("h-8 rounded-full border px-3 text-[12.5px] font-semibold", hood === n.slug ? "border-palm-900 bg-palm-900 text-white" : "border-line bg-white")}>{n.name}</button>)}
          </div>
        </div>
        <ul ref={listRef} className="max-h-[420px] space-y-1.5 overflow-y-auto pe-1" aria-label="Listings on map">
          {list.map((p) => (
            <li key={p.id} data-id={p.id}><button type="button" onClick={() => setSel(p.id)} className={cn("flex w-full items-center gap-3 rounded-xl border p-2 text-start", sel === p.id ? "border-palm-600 bg-palm-50" : "border-line bg-white hover:border-line-strong")}>
              <PropertyPhoto image={coverOf(p)} className="h-12 w-16 shrink-0 rounded-lg" sizes="64px" />
              <span className="min-w-0 flex-1"><span className="num block font-bold">{formatSAR(p.price, { compact: true })}{p.purpose === "rent" && <span className="text-[11px] font-medium text-ink-3"> /yr</span>}</span><span className="block truncate text-[12.5px] text-ink-3">{locationLine(p).hood} · {p.bedrooms} bd · {p.area} sqm</span></span>
            </button></li>
          ))}
          {!list.length && <li className="rounded-xl border border-dashed border-line-strong p-4 text-center text-[13px] text-ink-3">No listings for this filter.</li>}
        </ul>
      </div>
      <div className="lg:sticky lg:top-24 lg:self-start">
        <DistrictMap city={city} properties={list} selectedId={sel} onSelect={setSel} className="h-[520px] lg:h-[calc(100vh-9rem)]" />
        <p className="mt-2 text-[12px] text-ink-4">Simulated district map (no map API configured). Marker positions are approximate and for demonstration. <Link href="/neighborhoods" className="font-semibold text-palm-700">Neighborhood guides →</Link></p>
      </div>
    </div>
  );
}
