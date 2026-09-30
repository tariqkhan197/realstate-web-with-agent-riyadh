"use client";
import * as React from "react";
import Link from "next/link";
import { Baby, Crown, Home, KeyRound, Loader2, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { PropertyCard } from "@/components/property/PropertyCard";
import { CITIES, neighborhoodsIn } from "@/data/locations";
import { TYPE_LABEL } from "@/data/properties";
import { createShortlist, type Shortlist } from "@/services/shortlist";
import { cn, formatSAR, sleep } from "@/lib/utils";
import type { BuyerGoal, CitySlug, PropertyType } from "@/types";

const PURPOSES: { v: BuyerGoal; l: string; icon: React.ElementType; d: string }[] = [
  { v: "first-home", l: "First Home", icon: KeyRound, d: "Value and manageable payments" },
  { v: "family-home", l: "Family Home", icon: Baby, d: "Bedrooms, maid room, space" },
  { v: "investment", l: "Investment", icon: TrendingUp, d: "Yield and price per sqm" },
  { v: "rental", l: "Rental", icon: Home, d: "Homes to rent now" },
  { v: "luxury", l: "Luxury", icon: Crown, d: "Premium districts and finishes" },
];

export function MatchWizard() {
  const [budget, setBudget] = React.useState(800000);
  const [city, setCity] = React.useState<CitySlug>("riyadh");
  const [hood, setHood] = React.useState("");
  const [beds, setBeds] = React.useState(4);
  const [type, setType] = React.useState<PropertyType | "">("apartment");
  const [goal, setGoal] = React.useState<BuyerGoal>("family-home");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<Shortlist | null>(null);
  const resRef = React.useRef<HTMLDivElement>(null);
  const rent = goal === "rental";

  const run = async () => {
    setLoading(true); setResult(null);
    await sleep(650);
    const sl = createShortlist({ purpose: rent ? "rent" : "sale", city, neighborhoods: hood ? [hood] : undefined, maxPrice: budget, minBeds: beds || undefined, types: type ? [type] : undefined, goal }, 12);
    setResult(sl); setLoading(false);
    setTimeout(() => resRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  return (
    <div>
      <form className="surface grid gap-6 p-6 lg:grid-cols-[1fr_1fr]" onSubmit={(e) => { e.preventDefault(); void run(); }}>
        <fieldset className="lg:col-span-2">
          <legend className="label">Purpose</legend>
          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {PURPOSES.map((p) => { const Icon = p.icon; return (
              <button key={p.v} type="button" aria-pressed={goal === p.v} onClick={() => { setGoal(p.v); if (p.v === "rental" && budget > 400000) setBudget(90000); if (p.v !== "rental" && budget < 200000) setBudget(800000); }}
                className={cn("rounded-2xl border p-4 text-start transition", goal === p.v ? "border-palm-900 bg-palm-900 text-white" : "border-line bg-white hover:border-line-strong")}>
                <Icon size={18} className={goal === p.v ? "text-gold-400" : "text-palm-700"} />
                <p className="mt-2 font-bold">{p.l}</p><p className={cn("text-[12.5px]", goal === p.v ? "text-white/70" : "text-ink-3")}>{p.d}</p>
              </button>); })}
          </div>
        </fieldset>
        <div>
          <label htmlFor="mw-budget" className="label">{rent ? "Yearly rent budget" : "Budget"} <span className="num ms-1 text-ink">{formatSAR(budget)}</span></label>
          <input id="mw-budget" type="range" className="range w-full" min={rent ? 20000 : 200000} max={rent ? 400000 : 8000000} step={rent ? 5000 : 10000} value={budget} onChange={(e) => setBudget(Number(e.target.value))} />
        </div>
        <div>
          <span className="label">Bedrooms (minimum)</span>
          <div className="flex gap-1.5">{[0, 1, 2, 3, 4, 5, 6].map((b) => <button key={b} type="button" aria-pressed={beds === b} onClick={() => setBeds(b)} className={cn("num h-10 flex-1 rounded-xl border text-sm font-semibold", beds === b ? "border-palm-900 bg-palm-900 text-white" : "border-line bg-white")}>{b === 0 ? "Any" : `${b}+`}</button>)}</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label htmlFor="mw-city" className="label">City</label><select id="mw-city" className="field" value={city} onChange={(e) => { setCity(e.target.value as CitySlug); setHood(""); }}>{CITIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></div>
          <div><label htmlFor="mw-hood" className="label">Neighborhood</label><select id="mw-hood" className="field" value={hood} onChange={(e) => setHood(e.target.value)}><option value="">Any</option>{neighborhoodsIn(city).map((n) => <option key={n.slug} value={n.slug}>{n.name}</option>)}</select></div>
        </div>
        <div className="grid grid-cols-[1fr_auto] items-end gap-3">
          <div><label htmlFor="mw-type" className="label">Property type</label><select id="mw-type" className="field" value={type} onChange={(e) => setType(e.target.value as PropertyType | "")}><option value="">Any</option>{(Object.keys(TYPE_LABEL) as PropertyType[]).map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}</select></div>
          <Button type="submit" size="lg" disabled={loading}>{loading ? <Loader2 size={17} className="animate-spin" /> : <Sparkles size={17} className="text-gold-400" />}Generate shortlist</Button>
        </div>
      </form>

      <div ref={resRef} className="scroll-mt-24 pt-10" aria-live="polite">
        {loading && <p className="flex items-center gap-2 text-ink-2"><Loader2 size={16} className="animate-spin text-palm-700" />Scoring listings on budget, location, bedrooms, type, purpose and amenities…</p>}
        {result && (result.results.length ? <>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div><h2 className="text-display">Your Property Shortlist</h2><p className="num mt-2 text-ink-3"><b className="text-ink">{result.found} matches</b> · {result.strong} strong · from {result.scoped} listings searched</p></div>
            <Button asChild variant="secondary"><Link href={`/agent?q=${encodeURIComponent(`${beds ? `${beds}-bedroom ` : ""}${type ? TYPE_LABEL[type].toLowerCase() : "property"} in ${hood ? neighborhoodsIn(city).find((n) => n.slug === hood)?.name : CITIES.find((c) => c.slug === city)?.name} under ${formatSAR(budget, { compact: true })}`)}`}>Refine with Raed →</Link></Button>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {result.results.map((r) => (
              <div key={r.property.id} className="flex flex-col">
                <PropertyCard property={r.property} match={r} className="flex-1" />
                <details className="mt-2 rounded-xl border border-line bg-white px-4 py-3 text-[13px]">
                  <summary className="cursor-pointer font-semibold text-palm-800">Why it matched ({r.percent}%)</summary>
                  <ul className="mt-2 space-y-2">{r.factors.map((f) => <li key={f.key}><div className="flex justify-between"><span className="font-semibold">{f.label} <span className="font-normal text-ink-4">· weight {f.weight}</span></span><span className="num font-bold">{Math.round(f.score * 100)}%</span></div><p className="text-ink-3">{f.note}</p></li>)}</ul>
                </details>
              </div>
            ))}
          </div>
          <p className="mt-6 text-[12.5px] text-ink-4">Match % is the weighted average of the factor scores shown under each property. Demo listings.</p>
        </> : <EmptyState icon={<Sparkles size={22} />} title="No matches for that combination" body="Try a higher budget, fewer bedrooms or 'Any' neighborhood." />)}
      </div>
    </div>
  );
}
