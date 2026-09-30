"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { criteriaToQuery } from "@/lib/ai/describe";
import * as React from "react";
import { BookmarkPlus, LayoutGrid, Map as MapIcon, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import { CITIES, neighborhoodsIn } from "@/data/locations";
import { TYPE_LABEL } from "@/data/properties";
import { PropertyCard, PropertyCardSkeleton } from "@/components/property/PropertyCard";
import { DistrictMap } from "@/components/map/DistrictMap";
import { Button } from "@/components/ui/button";
import { Chip, EmptyState, Tabs } from "@/components/ui/misc";
import { useApp } from "@/lib/store";
import { parseCriteria } from "@/lib/ai/intent";
import { filterProperties, searchProperties, sortProperties } from "@/services/propertySearch";
import { hasMatchCriteria, scoreProperty } from "@/services/matching";
import { cn } from "@/lib/utils";
import type { CitySlug, Feature, Purpose, SearchCriteria, PropertyType } from "@/types";

const TYPES: PropertyType[] = ["apartment", "villa", "townhouse", "floor", "duplex", "penthouse", "land"];
const AMENITIES: { f: Feature; label: string }[] = [
  { f: "parking", label: "Parking" }, { f: "maid-room", label: "Maid room" }, { f: "garden", label: "Garden" },
  { f: "pool", label: "Pool" }, { f: "elevator", label: "Elevator" },
];

function Filters({ c, set, onClose }: { c: SearchCriteria; set: (p: Partial<SearchCriteria>) => void; onClose?: () => void }) {
  const hoods = c.city ? neighborhoodsIn(c.city) : [];
  const toggleFeature = (f: Feature) => set({ features: c.features?.includes(f) ? c.features.filter((x) => x !== f) : [...(c.features ?? []), f] });
  const num = (v: string) => (v ? Number(v.replace(/[^\d]/g, "")) : undefined);
  return (
    <div className="space-y-6">
      {onClose && <div className="flex items-center justify-between"><h2 className="text-lg font-bold">Filters</h2><button type="button" onClick={onClose} aria-label="Close filters" className="grid h-9 w-9 place-items-center rounded-lg hover:bg-ink/5"><X size={18} /></button></div>}
      <Tabs value={c.purpose ?? "sale"} onChange={(v) => set({ purpose: v as Purpose })} items={[{ value: "sale", label: "Buy" }, { value: "rent", label: "Rent" }]} className="w-full [&>button]:flex-1" />
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label" htmlFor="f-city">City</label>
          <select id="f-city" className="field" value={c.city ?? ""} onChange={(e) => set({ city: (e.target.value || undefined) as CitySlug, neighborhoods: undefined })}>
            <option value="">All cities</option>{CITIES.map((x) => <option key={x.slug} value={x.slug}>{x.name}</option>)}
          </select></div>
        <div><label className="label" htmlFor="f-hood">Neighbourhood</label>
          <select id="f-hood" className="field" disabled={!hoods.length} value={c.neighborhoods?.[0] ?? ""} onChange={(e) => set({ neighborhoods: e.target.value ? [e.target.value] : undefined })}>
            <option value="">Any</option>{hoods.map((n) => <option key={n.slug} value={n.slug}>{n.name}</option>)}
          </select></div>
      </div>
      <fieldset><legend className="label">Property type</legend>
        <div className="flex flex-wrap gap-2">{TYPES.map((t) => <Chip key={t} active={c.types?.includes(t)} onClick={() => set({ types: c.types?.includes(t) ? c.types.filter((x) => x !== t) : [...(c.types ?? []), t] })}>{TYPE_LABEL[t]}</Chip>)}</div>
      </fieldset>
      <fieldset><legend className="label">Price (SAR{c.purpose === "rent" ? " / year" : ""})</legend>
        <div className="grid grid-cols-2 gap-3">
          <input className="field num" inputMode="numeric" aria-label="Minimum price" placeholder="Min" value={c.minPrice?.toLocaleString("en-US") ?? ""} onChange={(e) => set({ minPrice: num(e.target.value) })} />
          <input className="field num" inputMode="numeric" aria-label="Maximum price" placeholder="Max" value={c.maxPrice?.toLocaleString("en-US") ?? ""} onChange={(e) => set({ maxPrice: num(e.target.value) })} />
        </div></fieldset>
      <fieldset><legend className="label">Bedrooms</legend>
        <div className="flex flex-wrap gap-2">{[undefined, 1, 2, 3, 4, 5].map((b) => <Chip key={String(b)} active={c.minBeds === b} onClick={() => set({ minBeds: b })}>{b ? `${b}+` : "Any"}</Chip>)}</div></fieldset>
      <fieldset><legend className="label">Bathrooms</legend>
        <div className="flex flex-wrap gap-2">{[undefined, 1, 2, 3, 4].map((b) => <Chip key={String(b)} active={c.minBaths === b} onClick={() => set({ minBaths: b })}>{b ? `${b}+` : "Any"}</Chip>)}</div></fieldset>
      <fieldset><legend className="label">Area (sqm)</legend>
        <div className="grid grid-cols-2 gap-3">
          <input className="field num" inputMode="numeric" aria-label="Minimum area" placeholder="Min" value={c.minArea ?? ""} onChange={(e) => set({ minArea: num(e.target.value) })} />
          <input className="field num" inputMode="numeric" aria-label="Maximum area" placeholder="Max" value={c.maxArea ?? ""} onChange={(e) => set({ maxArea: num(e.target.value) })} />
        </div></fieldset>
      <fieldset><legend className="label">Status</legend>
        <div className="flex flex-wrap gap-2">
          <Chip active={c.furnishing === "furnished"} onClick={() => set({ furnishing: c.furnishing === "furnished" ? undefined : "furnished" })}>Furnished</Chip>
          <Chip active={c.completion === "ready"} onClick={() => set({ completion: c.completion === "ready" ? undefined : "ready" })}>Ready</Chip>
          <Chip active={c.completion === "off-plan"} onClick={() => set({ completion: c.completion === "off-plan" ? undefined : "off-plan" })}>Off-plan</Chip>
          <Chip active={c.newOnly} onClick={() => set({ newOnly: !c.newOnly || undefined })}>New</Chip>
          <Chip active={c.verifiedOnly} onClick={() => set({ verifiedOnly: !c.verifiedOnly || undefined })}>Licence shown</Chip>
        </div></fieldset>
      <fieldset><legend className="label">Amenities</legend>
        <div className="flex flex-wrap gap-2">{AMENITIES.map((a) => <Chip key={a.f} active={c.features?.includes(a.f)} onClick={() => toggleFeature(a.f)}>{a.label}</Chip>)}</div></fieldset>
    </div>
  );
}

export function SearchExperience({ purpose }: { purpose: Purpose }) {
  const params = useSearchParams();
  const router = useRouter();
  const { saveSearch } = useApp();
  const [c, setC] = React.useState<SearchCriteria>(() => {
    let saved: Partial<SearchCriteria> = {};
    try { const raw = params.get("c"); if (raw) saved = JSON.parse(raw); } catch { /* ignore malformed saved search */ }
    return { sort: "relevance", ...saved, purpose, city: (params.get("city") as CitySlug) || saved.city || undefined };
  });
  const [q, setQ] = React.useState(params.get("q") ?? "");
  const [view, setView] = React.useState<"list" | "map">(params.get("view") === "map" ? "map" : "list");
  const [drawer, setDrawer] = React.useState(false);
  const [ready, setReady] = React.useState(false);
  const [pending, start] = React.useTransition();
  React.useEffect(() => { setReady(true); }, []);

  const set = (p: Partial<SearchCriteria>) => start(() => setC((x) => ({ ...x, ...p })));
  const applyQuery = (text: string) => {
    const { c: parsed, found } = parseCriteria(text);
    if (found) { set({ ...parsed, purpose: parsed.purpose ?? c.purpose }); setQ(""); }
    else set({ query: text || undefined });
  };
  React.useEffect(() => { const q0 = params.get("q"); if (q0) applyQuery(q0); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const results = React.useMemo(() => {
    const scope = searchProperties({ purpose: c.purpose, city: c.city, region: c.region, neighborhoods: c.neighborhoods, types: c.types, query: c.query });
    return sortProperties(filterProperties(scope, c), c.sort);
  }, [c]);
  const matchOn = hasMatchCriteria(c);
  const matches = React.useMemo(() => Object.fromEntries(matchOn ? results.map((p) => [p.id, scoreProperty(p, c)]) : []), [results, c, matchOn]);
  const activeCount = [c.city, c.neighborhoods?.length, c.types?.length, c.minPrice, c.maxPrice, c.minBeds, c.minBaths, c.minArea, c.maxArea, c.furnishing, c.completion, c.newOnly, c.verifiedOnly, c.features?.length].filter(Boolean).length;
  const mapCity: CitySlug = c.city ?? "riyadh";

  return (
    <div className="mx-auto max-w-[1360px] px-5 pb-10 pt-8 lg:px-8">
      <h1 className="text-display">{purpose === "rent" ? "Properties for rent" : "Properties for sale"}</h1>
      <form onSubmit={(e) => { e.preventDefault(); applyQuery(q.trim()); }} className="mt-5 flex items-center gap-2 rounded-2xl border border-line-strong bg-white p-2 ps-4 shadow-card focus-within:border-palm-600 focus-within:ring-4 focus-within:ring-palm-100">
        <Search size={18} className="shrink-0 text-ink-4" />
        <label htmlFor="s-q" className="sr-only">Search</label>
        <input id="s-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by city, neighbourhood, property type or ask AI…" className="h-12 min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-ink-4" />
        <Button type="submit" variant="secondary" className="hidden sm:inline-flex">Search</Button>
        <Button type="button" onClick={() => router.push(`/agent?q=${encodeURIComponent(q || "Help me find a property")}`)}><Sparkles size={16} className="text-gold-400" /><span className="hidden sm:inline">Ask AI</span></Button>
      </form>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" className="lg:hidden" onClick={() => setDrawer(true)}><SlidersHorizontal size={15} />Filters{activeCount ? ` (${activeCount})` : ""}</Button>
        <p className="num text-sm text-ink-3" aria-live="polite"><b className="text-ink">{results.length}</b> propert{results.length === 1 ? "y" : "ies"}{matchOn && " · ranked by AI match"}</p>
        <div className="ms-auto flex items-center gap-2">
          <label htmlFor="sort" className="sr-only">Sort</label>
          <select id="sort" className="field h-9 w-auto py-0 text-[13px]" value={c.sort} onChange={(e) => set({ sort: e.target.value as SearchCriteria["sort"] })}>
            <option value="relevance">Recommended</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="newest">Newest</option><option value="area-desc">Largest</option>
          </select>
          <Button variant="ghost" size="sm" onClick={() => saveSearch({ label: criteriaToQuery(c), criteria: c })}><BookmarkPlus size={15} /><span className="hidden sm:inline">Save search</span></Button>
          <Tabs size="sm" value={view} onChange={setView} items={[{ value: "list", label: <span className="flex items-center gap-1.5"><LayoutGrid size={14} />List</span> }, { value: "map", label: <span className="flex items-center gap-1.5"><MapIcon size={14} />Map</span> }]} />
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[300px_1fr]">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-line bg-white p-5 scrollbar-none">
            <Filters c={c} set={set} />
            {activeCount > 0 && <Button variant="link" className="mt-5" onClick={() => setC({ purpose: c.purpose, sort: c.sort })}>Clear all filters</Button>}
          </div>
        </aside>

        <section aria-label="Results" className={cn("transition-opacity", pending && "opacity-60")}>
          {!ready ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <PropertyCardSkeleton key={i} />)}</div>
          ) : !results.length ? (
            <EmptyState icon={<Search size={22} />} title="No properties match these filters" body="Remove a filter or widen your price range. Or describe what you want and the agent will suggest close alternatives."
              action={<div className="flex gap-2"><Button variant="secondary" onClick={() => setC({ purpose: c.purpose, sort: c.sort })}>Clear filters</Button><Button onClick={() => router.push("/agent")}><Sparkles size={15} />Ask AI Agent</Button></div>} />
          ) : view === "map" ? (
            <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
              <DistrictMap city={mapCity} properties={results.filter((p) => p.city === mapCity)} matches={Object.fromEntries(Object.entries(matches).map(([k, v]) => [k, v.percent]))} className="h-[560px] lg:h-[680px]" />
              <div className="grid max-h-[680px] gap-4 overflow-y-auto pe-1 sm:grid-cols-2 xl:grid-cols-1">
                {results.filter((p) => p.city === mapCity).slice(0, 12).map((p) => <PropertyCard key={p.id} property={p} match={matches[p.id]} />)}
              </div>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {(matchOn ? [...results].sort((a, b) => (matches[b.id]?.percent ?? 0) - (matches[a.id]?.percent ?? 0)) : results).map((p, i) => <PropertyCard key={p.id} property={p} match={matches[p.id]} priority={i < 3} />)}
            </div>
          )}
        </section>
      </div>

      {drawer && (
        <div className="fixed inset-0 z-[70] bg-ink/40 lg:hidden" onClick={() => setDrawer(false)}>
          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-24 animate-fade-in" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Filters">
            <Filters c={c} set={set} onClose={() => setDrawer(false)} />
            <div className="fixed inset-x-0 bottom-0 flex gap-2 border-t border-line bg-white p-4">
              <Button variant="secondary" className="flex-1" onClick={() => setC({ purpose: c.purpose, sort: c.sort })}>Clear</Button>
              <Button className="flex-1" onClick={() => setDrawer(false)}>Show {results.length} results</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
