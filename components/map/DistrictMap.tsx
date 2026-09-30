"use client";
// Simulated district map (no map API required). Positions are stylised, not geographic.
// To use a real map, implement the same props with MapLibre/Mapbox/Google Maps.
import Link from "next/link";
import * as React from "react";
import { X } from "lucide-react";
import { neighborhoodsIn } from "@/data/locations";
import type { CitySlug, Property } from "@/types";
import { cn, formatSAR } from "@/lib/utils";
import { PropertyPhoto, coverOf } from "@/components/property/PropertyImage";
import { Specs, locationLine } from "@/components/property/PropertyCard";
import { MatchBadge, VerificationBadge } from "@/components/property/Badges";

const COAST: Partial<Record<CitySlug, "west" | "east">> = { jeddah: "west", dammam: "east", khobar: "east" };

function Backdrop({ city }: { city: CitySlug }) {
  const coast = COAST[city];
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
      <rect width="100" height="100" fill="#EEF0EA" />
      <g stroke="#E2E5DD" strokeWidth=".25">{Array.from({ length: 20 }, (_, i) => <g key={i}><line x1={i * 5} y1="0" x2={i * 5} y2="100" /><line x1="0" y1={i * 5} x2="100" y2={i * 5} /></g>)}</g>
      {coast === "west" && <path d="M0 0 H14 C18 20 10 40 16 60 S12 90 18 100 H0z" fill="#D5E3E6" />}
      {coast === "east" && <path d="M100 0 H82 C78 25 88 45 80 65 S86 90 78 100 H100z" fill="#D5E3E6" />}
      {city === "riyadh" && <>
        {/* Wadi Hanifa (stylised) */}
        <path d="M8 0 C 16 20, 10 38, 20 55 S 30 85, 34 100" stroke="#D1DDCF" strokeWidth="3.2" fill="none" />
        {/* Ring roads */}
        <ellipse cx="52" cy="48" rx="34" ry="36" fill="none" stroke="#fff" strokeWidth="1.4" />
        <ellipse cx="52" cy="48" rx="34" ry="36" fill="none" stroke="#DAD6CB" strokeWidth=".3" />
        <path d="M52 0 V100" stroke="#fff" strokeWidth="1.2" /><path d="M0 50 C30 48 70 46 100 44" stroke="#fff" strokeWidth="1.2" />
        <path d="M20 10 L80 90" stroke="#fff" strokeWidth=".8" />
      </>}
      {city !== "riyadh" && <><path d="M20 30 H90" stroke="#fff" strokeWidth="1.2" /><path d="M50 0 V100" stroke="#fff" strokeWidth="1.2" /><path d="M25 75 H95" stroke="#fff" strokeWidth=".8" /></>}
    </svg>
  );
}

export function DistrictMap({ city, properties, matches, selectedId, onSelect, className }: {
  city: CitySlug; properties: Property[]; matches?: Record<string, number>; selectedId?: string; onSelect?: (id: string | undefined) => void; className?: string;
}) {
  const [internal, setInternal] = React.useState<string>();
  const sel = selectedId ?? internal;
  const select = (id?: string) => { setInternal(id); onSelect?.(id); };
  const hoods = neighborhoodsIn(city);
  const selected = properties.find((p) => p.id === sel);

  return (
    <div className={cn("relative isolate overflow-hidden rounded-2xl border border-line bg-[#EEF0EA]", className)} role="region" aria-label="Property map">
      <Backdrop city={city} />
      {hoods.map((n) => (
        <div key={n.slug} className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-center" style={{ left: `${n.center.x}%`, top: `${n.center.y}%` }}>
          <div className="mx-auto h-24 w-24 rounded-full bg-palm-600/[.06] ring-1 ring-palm-600/10" />
          <p className="-mt-[3.4rem] whitespace-nowrap text-[11px] font-bold uppercase tracking-[.08em] text-ink-3/80">{n.name}</p>
        </div>
      ))}
      {properties.map((p) => {
        const active = p.id === sel;
        return (
          <button key={p.id} type="button" onClick={() => select(active ? undefined : p.id)} aria-label={`${p.title}, ${formatSAR(p.price)}`} aria-pressed={active}
            className={cn("absolute z-10 flex -translate-x-1/2 -translate-y-full items-center gap-1 rounded-full py-0.5 pe-2.5 ps-0.5 text-[11.5px] font-bold shadow-card transition-transform num",
              active ? "z-20 scale-110 bg-palm-900 text-white" : p.isPrimaryDemo ? "bg-gold-600 text-white hover:scale-105" : "bg-white text-ink hover:scale-105")}
            style={{ left: `${p.pos.x}%`, top: `${p.pos.y}%` }}>
            <PropertyPhoto image={coverOf(p)} className="h-6 w-6 rounded-full" sizes="24px" />
            {formatSAR(p.price, { compact: true }).replace("SAR ", "")}
          </button>
        );
      })}
      <p className="absolute bottom-2 start-3 text-[10.5px] font-medium text-ink-4">Stylised map · positions approximate · demo</p>
      {selected && (
        <div className="absolute inset-x-3 bottom-3 z-30 mx-auto max-w-sm overflow-hidden rounded-2xl border border-line bg-white shadow-lift animate-fade-in">
          <div className="flex gap-3 p-3">
            <PropertyPhoto image={coverOf(selected)} className="h-24 w-28 shrink-0 rounded-xl" sizes="112px" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="num text-[16px] font-bold">{formatSAR(selected.price)}{selected.purpose === "rent" && <span className="text-xs text-ink-3"> / yr</span>}</p>
                <button type="button" onClick={() => select(undefined)} aria-label="Close preview" className="-me-1 -mt-1 grid h-7 w-7 place-items-center rounded-lg text-ink-3 hover:bg-ink/5"><X size={15} /></button>
              </div>
              <p className="truncate text-[12.5px] text-ink-3">{locationLine(selected).hood} · {locationLine(selected).area}</p>
              <Specs p={selected} className="mt-1.5 gap-x-3 text-[12px]" />
              <div className="mt-2 flex items-center gap-1.5">
                {matches?.[selected.id] ? <MatchBadge percent={matches[selected.id]} /> : <VerificationBadge property={selected} tone="palm" />}
                <Link href={`/property/${selected.slug}`} className="ms-auto text-[12.5px] font-bold text-palm-700 hover:underline">View</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Stylised Saudi Arabia overview with city pins. */
export function SaudiMap({ counts, active, onPick }: { counts: Record<string, number>; active?: string; onPick: (slug: CitySlug) => void }) {
  const cities: { slug: CitySlug; name: string; x: number; y: number }[] = [
    { slug: "riyadh", name: "Riyadh", x: 58, y: 50 }, { slug: "jeddah", name: "Jeddah", x: 22, y: 63 }, { slug: "makkah", name: "Makkah", x: 27, y: 66 },
    { slug: "madinah", name: "Madinah", x: 24, y: 43 }, { slug: "dammam", name: "Dammam", x: 78, y: 36 }, { slug: "khobar", name: "Khobar", x: 80, y: 40 },
  ];
  return (
    <div className="relative aspect-[5/4] w-full overflow-hidden rounded-2xl border border-line bg-[#E6EDEE]">
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
        <path d="M18 8 L33 5 L46 13 L60 20 L71 27 L78 31 L81 37 L84 44 L90 50 L95 57 L92 68 L78 76 L62 83 L50 90 L43 95 L37 89 L31 79 L25 69 L20 60 L15 50 L11 39 L8 29 L11 19 Z" fill="#F4F4EF" stroke="#D3D5CF" strokeWidth=".5" />
      </svg>
      {cities.map((c) => (
        <button key={c.slug} type="button" onClick={() => onPick(c.slug)} aria-pressed={active === c.slug}
          className={cn("absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-bold shadow-card", active === c.slug ? "bg-palm-900 text-white" : "bg-white text-ink hover:bg-palm-50")}
          style={{ left: `${c.x}%`, top: `${c.y}%` }}>
          <span className={cn("h-1.5 w-1.5 rounded-full", active === c.slug ? "bg-gold-400" : "bg-palm-600")} />{c.name}<span className="num font-semibold opacity-60">{counts[c.slug] ?? 0}</span>
        </button>
      ))}
      <p className="absolute bottom-2 start-3 text-[10.5px] font-medium text-ink-4">Stylised map · not to scale</p>
    </div>
  );
}
