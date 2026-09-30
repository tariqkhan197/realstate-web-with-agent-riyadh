"use client";
import * as React from "react";
import Link from "next/link";
import { Columns3, MessageSquareText, Plus, Scale, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import { VerificationBadge } from "@/components/property/Badges";
import { locationLine } from "@/components/property/PropertyCard";
import { PropertyPhoto, coverOf } from "@/components/property/PropertyImage";
import { useApp } from "@/lib/store";
import { compareProperties } from "@/services/compare";
import { allProperties, findSimilarProperties, getProperties } from "@/services/propertySearch";
import { PRIMARY_PROPERTY } from "@/data/properties";
import { INVESTMENT_DISCLAIMER } from "@/services/investment";
import { cn, formatSAR } from "@/lib/utils";
import type { BuyerGoal, SearchCriteria } from "@/types";

const GOALS: { v: BuyerGoal; l: string }[] = [{ v: "family-home", l: "Family Home" }, { v: "first-home", l: "First Home" }, { v: "investment", l: "Investment" }, { v: "rental", l: "Rental" }, { v: "luxury", l: "Luxury" }];

export function CompareView() {
  const { compare, toggleCompare, setCompare, hydrated, saved, recent } = useApp();
  const [goal, setGoal] = React.useState<BuyerGoal>("family-home");
  const [budget, setBudget] = React.useState<number>(0);
  const [adding, setAdding] = React.useState(false);
  const ps = getProperties(compare);

  React.useEffect(() => { if (ps.length && !budget) setBudget(Math.round(Math.max(...ps.map((p) => p.price)) / 10000) * 10000); }, [ps, budget]);

  if (!hydrated) return <div className="grid gap-4 sm:grid-cols-3"><Skeleton className="h-64" /><Skeleton className="h-64" /><Skeleton className="h-64" /></div>;

  if (ps.length < 2) {
    return <EmptyState icon={<Columns3 size={22} />} title={ps.length ? "Add one more property" : "Nothing to compare yet"}
      body="Select 2–4 properties with the Compare button on any listing, or load a sample comparison built around the Dhahrat Laban demo listing."
      action={<div className="flex flex-wrap justify-center gap-2"><Button onClick={() => setCompare([...(ps.length ? ps.map((p) => p.id) : [PRIMARY_PROPERTY.id]), ...findSimilarProperties(ps[0] ?? PRIMARY_PROPERTY, 2).map((p) => p.id)])}>Load sample comparison</Button><Button asChild variant="secondary"><Link href="/buy">Browse properties</Link></Button></div>} />;
  }

  const criteria: SearchCriteria = { maxPrice: budget || undefined, goal, minBeds: Math.min(...ps.map((p) => p.bedrooms)) || undefined, types: [ps[0].type] };
  const cmp = compareProperties(ps.map((p) => p.id), criteria);
  const groups = Array.from(new Set(cmp.rows.map((r) => r.group)));
  const candidates = Array.from(new Set([...saved, ...recent])).filter((id) => !compare.includes(id));
  const pool = (candidates.length ? getProperties(candidates) : allProperties().filter((p) => !compare.includes(p.id) && p.city === ps[0].city && p.purpose === ps[0].purpose)).slice(0, 8);

  return (
    <div>
      <div className="surface mb-6 flex flex-wrap items-end gap-4 p-4">
        <div><label htmlFor="c-budget" className="label">Score match factors against budget</label><input id="c-budget" type="number" className="field num w-44" value={budget} step={10000} onChange={(e) => setBudget(Number(e.target.value) || 0)} /></div>
        <div><span className="label">Purpose</span><div className="flex flex-wrap gap-1.5">{GOALS.map((g) => <button key={g.v} type="button" aria-pressed={goal === g.v} onClick={() => setGoal(g.v)} className={cn("h-9 rounded-full border px-3 text-[13px] font-semibold", goal === g.v ? "border-palm-900 bg-palm-900 text-white" : "border-line bg-white text-ink-2")}>{g.l}</button>)}</div></div>
        <p className="ms-auto max-w-xs text-[12.5px] text-ink-3">Differences are highlighted per attribute. Riyah does not pick an overall winner.</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-card">
        <table className="w-full min-w-[720px] border-collapse text-[14px]">
          <caption className="sr-only">Property Comparison</caption>
          <thead>
            <tr>
              <th scope="col" className="w-48 border-b border-line bg-canvas p-4 text-start align-bottom text-[12px] font-bold uppercase tracking-[.1em] text-ink-3">{cmp.properties.length} properties</th>
              {cmp.properties.map((p) => (
                <th key={p.id} scope="col" className="border-b border-s border-line p-3 text-start align-top font-normal">
                  <div className="relative">
                    <PropertyPhoto image={coverOf(p)} className="aspect-[16/10] rounded-xl" sizes="260px" />
                    <button type="button" onClick={() => toggleCompare(p.id)} aria-label={`Remove ${p.title}`} className="absolute end-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/92 shadow-ring hover:bg-white"><X size={14} /></button>
                    <div className="absolute bottom-2 start-2"><VerificationBadge property={p} /></div>
                  </div>
                  <p className="num mt-3 text-lg font-bold">{formatSAR(p.price)}</p>
                  <Link href={`/property/${p.slug}`} className="block truncate text-[13px] font-semibold hover:text-palm-700">{locationLine(p).hood}</Link>
                  <Link href={`/agent?property=${p.id}&q=${encodeURIComponent("Compare this with other apartments.")}`} className="mt-1 inline-flex items-center gap-1 text-[12px] font-semibold text-palm-700 hover:underline"><MessageSquareText size={12} />Ask AI</Link>
                </th>
              ))}
              {cmp.properties.length < 4 && <th className="w-40 border-b border-s border-line p-3 align-middle"><button type="button" onClick={() => setAdding(true)} className="flex h-full min-h-[160px] w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong text-[13px] font-semibold text-ink-3 hover:border-palm-600 hover:text-palm-700"><Plus size={18} />Add property</button></th>}
            </tr>
          </thead>
          {groups.map((g) => (
            <tbody key={g}>
              <tr><th colSpan={cmp.properties.length + 2} scope="colgroup" className="bg-canvas px-4 py-2 text-start text-[11.5px] font-bold uppercase tracking-[.1em] text-ink-3">{g}{g === "Investment assumptions" && <Badge tone="gold" className="ms-2 normal-case tracking-normal">Demo Estimate</Badge>}</th></tr>
              {cmp.rows.filter((r) => r.group === g).map((r) => (
                <tr key={r.key} className="border-t border-line">
                  <th scope="row" className="p-4 text-start text-[13px] font-medium text-ink-3">{r.label}</th>
                  {r.cells.map((c, i) => (
                    <td key={i} className={cn("num border-s border-line p-4 align-top font-semibold", c.note && r.key !== "pay" && r.key !== "match" && "bg-palm-50/60")}>
                      {c.value === "Yes" ? <span className="text-palm-700">✓ Yes</span> : c.value === "—" ? <span className="text-ink-4">—</span> : c.value}
                      {c.note && <span className={cn("mt-1 block text-[11.5px] font-semibold", r.key === "match" || r.key === "pay" ? "font-medium text-ink-3" : "text-palm-700")}>{c.note}</span>}
                    </td>
                  ))}
                  {cmp.properties.length < 4 && <td className="border-s border-line" />}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="surface p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold"><Scale size={18} className="text-palm-700" />Key differences</h2>
          <ul className="mt-3 space-y-2 text-[14px] text-ink-2">{cmp.differences.map((d) => <li key={d} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-600" />{d}</li>)}</ul>
        </div>
        <div className="surface p-6 text-[13px] text-ink-3">
          <p className="font-semibold text-ink-2">How to read this</p>
          <p className="mt-2">Monthly payments assume 10% down, 15 years and a 5.0% demo profit rate. AI match factors score each listing against the budget and purpose above. {INVESTMENT_DISCLAIMER}</p>
        </div>
      </div>

      {adding && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/40 sm:items-center" onClick={() => setAdding(false)}>
          <div className="max-h-[80vh] w-full overflow-auto rounded-t-3xl bg-white p-6 shadow-lift sm:max-w-lg sm:rounded-3xl" role="dialog" aria-modal="true" aria-label="Add property to comparison" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between"><h2 className="font-bold">Add a property</h2><button type="button" onClick={() => setAdding(false)} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-lg hover:bg-ink/5"><X size={18} /></button></div>
            <p className="mb-3 text-[13px] text-ink-3">{candidates.length ? "From your saved and recently viewed properties" : "Nearby listings"}</p>
            <ul className="space-y-1.5">{pool.map((p) => (
              <li key={p.id}><button type="button" onClick={() => { toggleCompare(p.id); setAdding(false); }} className="flex w-full items-center gap-3 rounded-xl border border-line p-2 text-start hover:border-palm-600">
                <PropertyPhoto image={coverOf(p)} className="h-12 w-16 shrink-0 rounded-lg" sizes="64px" />
                <span className="min-w-0 flex-1"><span className="num block font-bold">{formatSAR(p.price)}</span><span className="block truncate text-[12.5px] text-ink-3">{locationLine(p).hood} · {p.bedrooms} bd · {p.area} sqm</span></span><Plus size={16} className="text-palm-700" />
              </button></li>
            ))}</ul>
          </div>
        </div>
      )}
    </div>
  );
}
