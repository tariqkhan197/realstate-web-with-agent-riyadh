"use client";
import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MortgageCalculator } from "@/components/finance/MortgageCalculator";
import { InvestmentAnalysisCard } from "@/components/finance/InvestmentAnalysisCard";
import { locationLine } from "@/components/property/PropertyCard";
import { PropertyPhoto, coverOf } from "@/components/property/PropertyImage";
import { Specs } from "@/components/property/PropertyCard";
import { PRIMARY_PROPERTY } from "@/data/properties";
import { analyzeInvestment } from "@/services/investment";
import { allProperties, getPropertyById } from "@/services/propertySearch";
import { cn, formatPct, formatSAR } from "@/lib/utils";

export function InvestmentExplorer() {
  const params = useSearchParams();
  const sale = allProperties().filter((p) => p.purpose === "sale" && p.type !== "land");
  const [id, setId] = React.useState(params.get("property") && getPropertyById(params.get("property")!) ? params.get("property")! : PRIMARY_PROPERTY.id);
  const p = getPropertyById(id)!;
  const a = analyzeInvestment(p);
  const ranked = sale.map((x) => ({ p: x, a: analyzeInvestment(x) })).sort((x, y) => y.a.scenarios[1].netYield - x.a.scenarios[1].netYield).slice(0, 8);

  return (
    <div className="grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
      <aside className="space-y-4">
        <div><label htmlFor="inv-p" className="label">Analyze a property</label>
          <select id="inv-p" className="field" value={id} onChange={(e) => setId(e.target.value)}>{sale.map((x) => <option key={x.id} value={x.id}>{locationLine(x).hood} · {x.bedrooms} bd · {formatSAR(x.price, { compact: true })}</option>)}</select></div>
        <div className="surface overflow-hidden">
          <PropertyPhoto image={coverOf(p)} className="aspect-[16/10]" sizes="340px" />
          <div className="p-4"><p className="num text-lg font-bold">{formatSAR(p.price)}</p><p className="text-[13px] text-ink-3">{locationLine(p).hood} · {locationLine(p).area}</p><Specs p={p} className="mt-2" />
            <Link href={`/property/${p.slug}`} className="mt-3 inline-block text-[13px] font-semibold text-palm-700 hover:underline">View listing →</Link></div>
        </div>
        <div className="surface p-4">
          <p className="text-[13px] font-bold">Highest base-case net yield</p>
          <p className="text-[11.5px] text-gold-700">Demo Estimate</p>
          <ul className="mt-2 space-y-1">{ranked.map(({ p: x, a: ax }) => (
            <li key={x.id}><button type="button" onClick={() => setId(x.id)} className={cn("flex w-full items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-start text-[13px]", x.id === id ? "bg-palm-50" : "hover:bg-canvas")}>
              <span className="truncate">{locationLine(x).hood} · {formatSAR(x.price, { compact: true })}</span><span className="num font-bold text-palm-800">{formatPct(ax.scenarios[1].netYield)}</span></button></li>
          ))}</ul>
        </div>
      </aside>
      <div className="min-w-0 space-y-6">
        <InvestmentAnalysisCard key={p.id} a={a} />
        <MortgageCalculator key={`m-${p.id}`} price={p.price} />
        <Link href={`/agent?property=${p.id}&q=${encodeURIComponent("Analyze the investment potential of this property")}`} className="block rounded-2xl bg-palm-950 p-5 text-white hover:bg-palm-900"><p className="font-bold">Discuss this analysis with Raed →</p><p className="mt-1 text-[13px] text-white/65">Ask follow-ups like “what if rent is 10% lower?” or “compare with similar listings”.</p></Link>
      </div>
    </div>
  );
}
