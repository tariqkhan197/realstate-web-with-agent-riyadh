"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Check, CircleHelp, Columns3, Heart, MapPin, MessageSquareText, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MatchBadge, VerificationBadge } from "@/components/property/Badges";
import { locationLine } from "@/components/property/PropertyCard";
import { PropertyPhoto, coverOf } from "@/components/property/PropertyImage";
import { MortgageBreakdown } from "@/components/finance/MortgageCalculator";
import { InvestmentAnalysisCard } from "@/components/finance/InvestmentAnalysisCard";
import { useApp } from "@/lib/store";
import { getPropertyById } from "@/services/propertySearch";
import { cn, formatSAR } from "@/lib/utils";
import type { AgentBlock } from "@/lib/ai/types";
import type { MatchResult } from "@/types";

export interface BlockActions { ask: (propertyId: string, q: string) => void; focus: (propertyId: string) => void }

export function AgentResultCard({ r, actions, rank }: { r: MatchResult; actions: BlockActions; rank: number }) {
  const p = r.property;
  const { toggleCompare, compare, toggleSaved, isSaved, hydrated } = useApp();
  const loc = locationLine(p);
  const inCmp = hydrated && compare.includes(p.id), saved = hydrated && isSaved(p.id);
  return (
    <article className="group overflow-hidden rounded-2xl border border-line bg-white transition-shadow hover:shadow-card" onMouseEnter={() => actions.focus(p.id)}>
      <div className="flex gap-0 sm:block">
        <Link href={`/property/${p.slug}`} className="relative block w-32 shrink-0 sm:w-auto">
          <PropertyPhoto image={coverOf(p)} className="h-full min-h-[128px] sm:aspect-[16/10] sm:h-auto sm:min-h-0" sizes="(max-width:640px) 128px, 280px" />
          <span className="num absolute start-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-ink/75 text-[11px] font-bold text-white">{rank}</span>
          <div className="absolute bottom-2 start-2 hidden sm:block"><VerificationBadge property={p} /></div>
        </Link>
        <div className="min-w-0 flex-1 p-3.5">
          <div className="flex items-start justify-between gap-2">
            <p className="num text-[17px] font-bold tracking-tight">{formatSAR(p.price)}{p.purpose === "rent" && <span className="text-xs text-ink-3"> /yr</span>}</p>
            <MatchBadge percent={r.percent} />
          </div>
          <p className="mt-1 flex items-center gap-1 truncate text-[13px]"><MapPin size={13} className="shrink-0 text-palm-600" /><span className="font-semibold">{loc.hood}</span><span className="truncate text-ink-3">· {loc.area}</span></p>
          <p className="num mt-1 text-[12.5px] text-ink-2">{p.bedrooms} beds · {p.bathrooms} baths · {p.area} sqm</p>
          {r.reasons.length > 0 && <p className="mt-2 line-clamp-2 text-[12px] leading-snug text-palm-800">{r.reasons.slice(0, 2).join(" · ")}</p>}
          <div className="mt-3 grid grid-cols-4 gap-1">
            <Link href={`/property/${p.slug}`} className="inline-flex h-8 items-center justify-center gap-1 rounded-lg bg-palm-900 text-[12px] font-semibold text-white hover:bg-palm-800">View</Link>
            <button type="button" onClick={() => toggleCompare(p.id)} aria-pressed={inCmp} className={cn("inline-flex h-8 items-center justify-center gap-1 rounded-lg border text-[12px] font-semibold", inCmp ? "border-palm-200 bg-palm-50 text-palm-800" : "border-line hover:border-line-strong")}><Columns3 size={13} />{inCmp ? "Added" : "Compare"}</button>
            <button type="button" onClick={() => toggleSaved(p.id)} aria-pressed={saved} className={cn("inline-flex h-8 items-center justify-center gap-1 rounded-lg border text-[12px] font-semibold", saved ? "border-gold-200 bg-gold-50 text-gold-700" : "border-line hover:border-line-strong")}><Heart size={13} fill={saved ? "currentColor" : "none"} />{saved ? "Saved" : "Save"}</button>
            <button type="button" onClick={() => actions.ask(p.id, "Tell me more about this property")} className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-line text-[12px] font-semibold hover:border-line-strong"><MessageSquareText size={13} />Ask AI</button>
          </div>
        </div>
      </div>
    </article>
  );
}

function SaveAction({ id }: { id: string }) {
  const { save, hydrated } = useApp();
  const done = React.useRef(false);
  React.useEffect(() => { if (hydrated && !done.current) { done.current = true; save(id); } }, [hydrated, id, save]);
  const p = getPropertyById(id);
  if (!p) return null;
  return <div className="flex items-center gap-3 rounded-2xl border border-gold-200 bg-gold-50 p-3 text-sm">
    <PropertyPhoto image={coverOf(p)} className="h-12 w-16 shrink-0 rounded-lg" sizes="64px" />
    <div className="min-w-0 flex-1"><p className="font-semibold text-gold-700">saveProperty() · Saved to your list</p><p className="truncate text-[12.5px] text-ink-2">{locationLine(p).hood} · {formatSAR(p.price)}</p></div>
    <Link href="/saved" className="text-[13px] font-semibold text-palm-700 hover:underline">Open saved</Link>
  </div>;
}


function ResultsBlock({ block, actions }: { block: Extract<AgentBlock, { kind: "results" }>; actions: BlockActions }) {
      const router = useRouter();
  const { setCompare } = useApp();
  const [all, setAll] = React.useState(false);
      const list = all ? block.results : block.results.slice(0, 4);
      return <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="num inline-flex h-8 items-center rounded-full bg-ink px-3 text-[13px] font-bold text-white">{block.found} properties found</span>
          <span className="num inline-flex h-8 items-center rounded-full bg-palm-100 px-3 text-[13px] font-bold text-palm-900">{block.strong} strong matches</span>
          <span className="num text-[12.5px] text-ink-3">from {block.scoped} listings searched</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">{list.map((r, i) => <AgentResultCard key={r.property.id} r={r} rank={i + 1} actions={actions} />)}</div>
        <div className="mt-3 flex flex-wrap gap-2">
          {block.results.length > 4 && <Button variant="secondary" size="sm" onClick={() => setAll((x) => !x)}>{all ? "Show fewer" : `Show all ${block.results.length}`}</Button>}
          {block.results.length >= 2 && <Button variant="soft" size="sm" onClick={() => { setCompare(block.results.slice(0, 4).map((r) => r.property.id)); router.push("/compare"); }}><Columns3 size={14} />Compare top {Math.min(4, block.results.length)}</Button>}
        </div>
        <p className="mt-2 text-[11.5px] text-ink-4">Match % = weighted score of budget, location, bedrooms, type, goal and amenity fit against your stated requirements. Demo listings.</p>
      </div>;
}

export function BlockView({ block, actions }: { block: AgentBlock; actions: BlockActions }) {
  const router = useRouter();
  const { setCompare } = useApp();
  switch (block.kind) {
    case "criteria":
      return block.items.length ? <div className="flex flex-wrap gap-1.5" aria-label="Understood requirements">
        {block.items.map((i) => <span key={i.label} className="inline-flex h-7 items-center gap-1.5 rounded-full border border-palm-200 bg-palm-50 px-2.5 text-[12px] font-semibold text-palm-900"><span className="text-palm-600/80">{i.label}</span>{i.value}</span>)}
      </div> : null;
    case "results":
      return <ResultsBlock block={block} actions={actions} />;
    case "comparison": {
      const c = block.comparison;
      const rows = c.rows.filter((r) => ["price", "psqm", "pay", "loc", "area", "beds", "baths", "ver", "yield", "match"].includes(r.key)).slice(0, 10);
      const shown = rows.length ? rows : c.rows.slice(0, 9);
      return <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <div className="overflow-x-auto"><table className="w-full min-w-[520px] text-[13px]">
          <thead><tr className="border-b border-line bg-canvas"><th className="px-3 py-2.5 text-start font-semibold text-ink-3">Property Comparison</th>{c.properties.map((p) => <th key={p.id} className="px-3 py-2.5 text-start"><Link href={`/property/${p.slug}`} className="font-bold hover:text-palm-700">{locationLine(p).hood}</Link></th>)}</tr></thead>
          <tbody>{shown.map((r) => <tr key={r.key} className="border-b border-line last:border-0"><td className="px-3 py-2.5 text-ink-3">{r.label}</td>{r.cells.map((cell, i) => <td key={i} className="num px-3 py-2.5 font-semibold">{cell.value}{cell.note && <span className="mt-0.5 block text-[11px] font-semibold text-palm-700">{cell.note}</span>}</td>)}</tr>)}</tbody>
        </table></div>
        <div className="flex items-center justify-between gap-2 border-t border-line bg-canvas px-3 py-2.5"><span className="text-[12px] text-ink-3">Objective differences — no overall winner.</span><Button variant="link" size="sm" onClick={() => { setCompare(c.properties.map((p) => p.id)); router.push("/compare"); }}>Open full comparison <ArrowUpRight size={14} /></Button></div>
      </div>;
    }
    case "mortgage": {
      const p = getPropertyById(block.propertyId);
      return <div className="rounded-2xl border border-line bg-white p-4">
        <div className="mb-3 flex items-center justify-between gap-2"><p className="text-[13px] font-bold">calculateMortgage() · {p && locationLine(p).hood}</p><Badge tone="gold">Estimate</Badge></div>
        <MortgageBreakdown r={block.result} compact />
        {p && <Link href={`/property/${p.slug}#financing`} className="mt-3 inline-block text-[13px] font-semibold text-palm-700 hover:underline">Adjust in full calculator →</Link>}
      </div>;
    }
    case "investment": {
      const p = getPropertyById(block.propertyId);
      return <InvestmentAnalysisCard a={block.analysis} compact rental={p?.purpose === "rent"} className="shadow-none" />;
    }
    case "neighborhood": {
      const { neighborhood: n, listings, forSale, forRent, priceRange } = block.info;
      return <div className="rounded-2xl border border-line bg-white p-4">
        <div className="flex items-start justify-between gap-2"><div><p className="text-[12px] font-bold uppercase tracking-[.1em] text-ink-3">getNeighborhoodInfo()</p><p className="mt-1 text-lg font-bold">{n.name} <span className="font-arabic text-base font-semibold text-ink-3">{n.nameAr}</span></p></div><Badge tone="gold">Demo data</Badge></div>
        <p className="mt-2 text-[13.5px] text-ink-2">{n.summary}</p>
        <dl className="mt-3 grid grid-cols-3 gap-2 text-[12.5px]">
          <div className="rounded-xl bg-canvas p-2.5"><dt className="text-ink-3">Listings</dt><dd className="num font-bold">{listings} <span className="font-medium text-ink-3">({forSale} sale · {forRent} rent)</span></dd></div>
          <div className="rounded-xl bg-canvas p-2.5"><dt className="text-ink-3">Demo SAR/sqm</dt><dd className="num font-bold">{n.demoPricePerSqm[0].toLocaleString()}–{n.demoPricePerSqm[1].toLocaleString()}</dd></div>
          <div className="rounded-xl bg-canvas p-2.5"><dt className="text-ink-3">Listed range</dt><dd className="num font-bold">{priceRange ? `${formatSAR(priceRange[0], { compact: true })}–${formatSAR(priceRange[1], { compact: true })}` : "—"}</dd></div>
        </dl>
        <Link href={`/neighborhoods/${n.slug}`} className="mt-3 inline-block text-[13px] font-semibold text-palm-700 hover:underline">Open neighbourhood guide →</Link>
      </div>;
    }
    case "checklist":
      return <div className="rounded-2xl border border-line bg-white p-4">
        <p className="text-[13px] font-bold">{block.title}</p>
        <ul className="mt-2 divide-y divide-line">
          {block.items.map((i) => <li key={i.label} className="flex gap-3 py-2.5 text-[13px]">
            <span className={cn("mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full", i.ok === true ? "bg-palm-100 text-palm-700" : i.ok === false ? "bg-danger-50 text-danger" : "bg-gold-50 text-gold-700")}>{i.ok === true ? <Check size={12} /> : i.ok === false ? <X size={12} /> : <CircleHelp size={12} />}</span>
            <div><p className="font-semibold">{i.label}</p><p className="text-ink-3">{i.note}</p></div>
          </li>)}
        </ul>
      </div>;
    case "action":
      return <SaveAction id={block.propertyId} />;
  }
}
