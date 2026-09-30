"use client";
import * as React from "react";
import { Calculator, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { calculateMortgage, DEFAULT_DOWN_PCT, DEFAULT_TERM_YEARS, DEMO_PROFIT_RATE, type MortgageResult } from "@/services/mortgage";
import { cn, formatNumber, formatSAR } from "@/lib/utils";

function Field({ label, suffix, value, onChange, min, max, step, id }: { label: string; suffix?: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number; id: string }) {
  return (
    <div>
      <div className="flex items-center justify-between"><label htmlFor={id} className="label">{label}</label>
        <div className="flex items-center gap-1 rounded-lg border border-line bg-white px-2 focus-within:border-palm-600">
          <input id={id} type="number" inputMode="decimal" className="num h-8 w-28 bg-transparent text-end text-sm font-semibold outline-none" value={Number.isFinite(value) ? value : 0} min={min} max={max} step={step}
            onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value) || 0)))} />
          {suffix && <span className="text-xs font-semibold text-ink-3">{suffix}</span>}
        </div>
      </div>
      <input aria-label={`${label} slider`} type="range" className="range mt-3 w-full" value={value} min={min} max={max} step={step} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

export function MortgageBreakdown({ r, compact }: { r: MortgageResult; compact?: boolean }) {
  const principalPct = r.totalPayment ? (r.loanAmount / (r.totalPayment + r.downPayment)) * 100 : 0;
  const downPct = r.totalPayment + r.downPayment ? (r.downPayment / (r.totalPayment + r.downPayment)) * 100 : 100;
  return (
    <div>
      <p className="text-[12.5px] font-semibold text-ink-3">Estimated monthly payment</p>
      <p className="num mt-1 text-[34px] font-bold leading-none tracking-tight">{formatSAR(Math.round(r.monthlyPayment))}<span className="ms-1 text-base font-semibold text-ink-3">/ mo</span></p>
      <div className="mt-4 flex h-2.5 overflow-hidden rounded-full bg-ink/[.06]" aria-hidden>
        <span className="bg-gold-400" style={{ width: `${downPct}%` }} /><span className="bg-palm-700" style={{ width: `${principalPct}%` }} /><span className="flex-1 bg-palm-200" />
      </div>
      <dl className={cn("mt-4 grid gap-x-6 gap-y-3 text-sm", compact ? "grid-cols-2" : "grid-cols-2")}>
        {[
          ["Down payment", r.downPayment, "bg-gold-400"], ["Loan amount", r.loanAmount, "bg-palm-700"],
          ["Estimated bank profit", r.totalProfit, "bg-palm-200"], ["Total of payments", r.totalPayment, ""],
        ].map(([l, v, dot]) => (
          <div key={l as string}><dt className="flex items-center gap-1.5 text-[12.5px] text-ink-3">{dot && <span className={cn("h-2 w-2 rounded-full", dot as string)} />}{l}</dt><dd className="num font-bold">{formatSAR(Math.round(v as number))}</dd></div>
        ))}
      </dl>
      <p className="mt-3 text-[12px] text-ink-3"><span className="num">{r.years}</span> years · <span className="num">{r.ratePct}%</span> profit rate · <span className="num">{r.months}</span> payments</p>
    </div>
  );
}

export function MortgageCalculator({ price: initialPrice, className }: { price: number; className?: string }) {
  const [price, setPrice] = React.useState(initialPrice);
  const [down, setDown] = React.useState(Math.round(initialPrice * DEFAULT_DOWN_PCT / 100));
  const [years, setYears] = React.useState(DEFAULT_TERM_YEARS);
  const [rate, setRate] = React.useState(DEMO_PROFIT_RATE);
  const r = React.useMemo(() => calculateMortgage({ price, downPayment: Math.min(down, price), years, ratePct: rate }), [price, down, years, rate]);
  const reset = () => { setPrice(initialPrice); setDown(Math.round(initialPrice * DEFAULT_DOWN_PCT / 100)); setYears(DEFAULT_TERM_YEARS); setRate(DEMO_PROFIT_RATE); };

  return (
    <div id="financing" className={cn("surface scroll-mt-28 p-6", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-title"><Calculator size={20} className="text-palm-700" />Mortgage calculator</h2>
        <Badge tone="gold" size="md">Estimate</Badge>
      </div>
      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <Field id="m-price" label="Property price" suffix="SAR" value={price} onChange={(v) => { setPrice(v); if (down > v) setDown(v); }} min={50000} max={Math.max(10_000_000, initialPrice * 2)} step={5000} />
          <Field id="m-down" label={`Down payment (${price ? formatNumber((down / price) * 100, 0) : 0}%)`} suffix="SAR" value={down} onChange={(v) => setDown(Math.min(v, price))} min={0} max={price} step={1000} />
          <Field id="m-years" label="Loan period" suffix="yrs" value={years} onChange={setYears} min={1} max={30} step={1} />
          <Field id="m-rate" label="Profit / interest rate" suffix="%" value={rate} onChange={setRate} min={0} max={12} step={0.05} />
          <button type="button" onClick={reset} className="text-[13px] font-semibold text-palm-700 hover:underline">Reset to listing defaults</button>
        </div>
        <div className="rounded-2xl bg-canvas p-5"><MortgageBreakdown r={r} /></div>
      </div>
      <p className="mt-5 flex gap-2 text-[12.5px] leading-relaxed text-ink-3"><Info size={14} className="mt-0.5 shrink-0" />Estimate only, using a standard fixed-rate schedule and a {DEMO_PROFIT_RATE}% demo profit rate. Actual Murabaha/Ijara offers, fees, insurance and eligibility are set by lenders.</p>
    </div>
  );
}
