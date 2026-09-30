"use client";
import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface NavItem<T extends string> { key: T; label: string; icon: React.ElementType; badge?: number }

/** App shell for dashboards: sticky side nav on desktop, horizontal scroller on mobile. */
export function DashboardShell<T extends string>({ title, subtitle, items, active, onChange, actions, children, badge }: {
  title: string; subtitle: string; items: NavItem<T>[]; active: T; onChange: (k: T) => void; actions?: React.ReactNode; children: React.ReactNode; badge?: string;
}) {
  return (
    <div className="grid min-h-[calc(100vh-4rem)] grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="min-w-0 border-b border-line bg-white lg:border-b-0 lg:border-e">
        <div className="hidden p-5 lg:block"><p className="text-[11.5px] font-bold uppercase tracking-[.12em] text-ink-3">{badge}</p><p className="mt-1 font-bold">{subtitle}</p></div>
        <nav aria-label={`${title} sections`} className="flex gap-1 overflow-x-auto px-3 py-2 lg:flex-col lg:overflow-visible lg:py-0">
          {items.map((i) => { const Icon = i.icon; return (
            <button key={i.key} type="button" onClick={() => onChange(i.key)} aria-current={active === i.key ? "page" : undefined}
              className={cn("flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-[14px] font-semibold transition-colors", active === i.key ? "bg-palm-50 text-palm-900" : "text-ink-2 hover:bg-ink/[.04]")}>
              <Icon size={17} className={active === i.key ? "text-palm-700" : "text-ink-4"} />{i.label}
              {i.badge ? <span className="num ms-auto rounded-full bg-gold-600 px-1.5 text-[11px] text-white">{i.badge}</span> : null}
            </button>); })}
        </nav>
        <div className="hidden p-5 lg:block"><Link href="/" className="text-[13px] font-semibold text-ink-3 hover:text-ink">← Back to Riyah</Link></div>
      </aside>
      <div className="min-w-0 bg-canvas px-5 pb-28 pt-8 lg:px-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-[12px] font-bold uppercase tracking-[.14em] text-gold-700">{title}</p><h1 className="mt-1 text-display">{items.find((i) => i.key === active)?.label}</h1></div>
          {actions}
        </div>
        {children}
        <p className="mt-10 text-[12px] text-ink-4">All dashboard figures are demo data.</p>
      </div>
    </div>
  );
}

export function Table({ head, children, className }: { head: string[]; children: React.ReactNode; className?: string }) {
  return <div className={cn("overflow-x-auto rounded-2xl border border-line bg-white shadow-card", className)}>
    <table className="w-full min-w-[640px] text-[13.5px]"><thead><tr className="border-b border-line bg-canvas">{head.map((h) => <th key={h} scope="col" className="px-4 py-3 text-start text-[12px] font-bold uppercase tracking-[.06em] text-ink-3">{h}</th>)}</tr></thead>
      <tbody className="divide-y divide-line">{children}</tbody></table>
  </div>;
}
