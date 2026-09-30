"use client";
import { useRouter } from "next/navigation";
import * as React from "react";
import { ArrowUp, Sparkles } from "lucide-react";
import { useApp } from "@/lib/store";

const EXAMPLES = ["4-bedroom apartment in West Riyadh under SAR 800K", "Family villa in North Riyadh with a pool", "Apartments for rent in Al Olaya"];

export function HeroSearch() {
  const router = useRouter();
  const { t } = useApp();
  const [q, setQ] = React.useState("");
  const go = (text: string) => router.push(`/agent?q=${encodeURIComponent(text)}`);
  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) go(q.trim()); }} className="flex items-center gap-2 rounded-2xl border border-line-strong bg-white p-2 ps-4 shadow-card focus-within:border-palm-600 focus-within:ring-4 focus-within:ring-palm-100">
        <Sparkles size={18} className="shrink-0 text-gold-600" />
        <label htmlFor="hero-q" className="sr-only">Ask the AI agent</label>
        <input id="hero-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("search.placeholder")} className="h-11 min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink-4" />
        <button type="submit" aria-label="Ask" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-palm-900 text-white hover:bg-palm-800"><ArrowUp size={18} /></button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">
        {EXAMPLES.map((e) => (
          <button key={e} type="button" onClick={() => go(e)} className="rounded-full border border-line bg-white/70 px-3 py-1.5 text-[12.5px] font-medium text-ink-2 hover:border-line-strong hover:text-ink">{e}</button>
        ))}
      </div>
    </div>
  );
}
