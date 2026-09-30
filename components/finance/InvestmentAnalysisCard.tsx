"use client";
import * as React from "react";
import { AlertTriangle, LineChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { INVESTMENT_DISCLAIMER, type InvestmentAnalysis } from "@/services/investment";
import { cn, formatPct, formatSAR } from "@/lib/utils";

export function InvestmentAnalysisCard({ a, className, compact, rental }: { a: InvestmentAnalysis; className?: string; compact?: boolean; rental?: boolean }) {
  const [sel, setSel] = React.useState<"low" | "base" | "high">("base");
  const s = a.scenarios.find((x) => x.key === sel)!;
  const maxRent = Math.max(...a.scenarios.map((x) => x.annualRent));
  const metrics: [string, string, string][] = [
    [rental ? "Implied value" : "Purchase price", formatSAR(Math.round(a.price)), rental ? "Demo Estimate" : "Listing"],
    ["Est. monthly payment", formatSAR(Math.round(a.monthlyPayment)), "AI Estimate"],
    ["Est. annual rental potential", formatSAR(Math.round(s.annualRent)), "Demo Estimate"],
    ["Est. gross yield", formatPct(s.grossYield), "Demo Estimate"],
    ["Est. annual costs", formatSAR(Math.round(a.annualCosts)), "AI Estimate"],
    ["Investment horizon", a.horizon, "AI Estimate"],
  ];
  return (
    <div id="investment" className={cn("surface scroll-mt-28", compact ? "p-4" : "p-6", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className={cn("flex items-center gap-2", compact ? "text-base font-bold" : "text-title")}><LineChart size={compact ? 17 : 20} className="text-palm-700" />AI Investment Analysis</h2>
        <Badge tone="gold" size={compact ? "sm" : "md"}>Demo Estimate</Badge>
      </div>

      <div className="mt-4 inline-flex rounded-xl bg-ink/[.05] p-1" role="tablist" aria-label="Scenario">
        {a.scenarios.map((x) => (
          <button key={x.key} role="tab" type="button" aria-selected={sel === x.key} onClick={() => setSel(x.key)} className={cn("rounded-lg px-3 py-1.5 text-[13px] font-semibold", sel === x.key ? "bg-white shadow-ring" : "text-ink-3 hover:text-ink")}>{x.label}</button>
        ))}
      </div>

      <dl className={cn("mt-4 grid gap-3", compact ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-3")}>
        {metrics.map(([l, v, tag]) => (
          <div key={l} className="rounded-xl border border-line p-3">
            <dt className="text-[12px] text-ink-3">{l}</dt>
            <dd className="num mt-0.5 font-bold tracking-tight">{v}</dd>
            <span className="mt-1 inline-block text-[10.5px] font-semibold uppercase tracking-[.06em] text-gold-700">{tag}</span>
          </div>
        ))}
      </dl>

      <div className="mt-5 space-y-2.5" aria-label="Scenario comparison">
        {a.scenarios.map((x) => (
          <div key={x.key} className="grid grid-cols-[88px_1fr_auto] items-center gap-3 text-[13px]">
            <span className={cn("font-semibold", x.key === sel ? "text-ink" : "text-ink-3")}>{x.label.replace(" scenario", "")}</span>
            <span className="h-2 overflow-hidden rounded-full bg-ink/[.06]"><span className={cn("block h-full rounded-full", x.key === sel ? "bg-palm-700" : "bg-palm-200")} style={{ width: `${(x.annualRent / maxRent) * 100}%` }} /></span>
            <span className="num w-44 text-end text-ink-2">{formatPct(x.grossYield)} gross · {formatPct(x.netYield)} net</span>
          </div>
        ))}
      </div>

      {!compact && <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-bold">Key considerations</h3>
          <ul className="mt-2 space-y-2 text-[13.5px] text-ink-2">{a.considerations.map((c) => <li key={c} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-600" />{c}</li>)}</ul>
        </div>
        <div>
          <h3 className="text-sm font-bold">Estimated annual costs</h3>
          <ul className="mt-2 divide-y divide-line text-[13.5px]">{a.costBreakdown.map((c) => <li key={c.label} className="flex justify-between gap-3 py-2"><span className="text-ink-2">{c.label}</span><span className="num font-semibold">{formatSAR(Math.round(c.amount))}</span></li>)}</ul>
          <h3 className="mt-4 text-sm font-bold">Assumptions</h3>
          <ul className="mt-1 space-y-1 text-[12.5px] text-ink-3">{a.assumptions.map((x) => <li key={x}>{x}</li>)}</ul>
        </div>
      </div>}

      <p className="mt-5 flex gap-2 rounded-xl bg-gold-50 p-3 text-[12.5px] leading-relaxed text-gold-700"><AlertTriangle size={14} className="mt-0.5 shrink-0" />{INVESTMENT_DISCLAIMER}</p>
    </div>
  );
}
