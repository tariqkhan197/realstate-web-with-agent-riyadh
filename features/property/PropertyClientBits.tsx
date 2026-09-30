"use client";
import * as React from "react";
import Link from "next/link";
import { Columns3, MessageSquareText, Phone, Share2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SaveButton } from "@/components/property/PropertyCard";
import { useApp } from "@/lib/store";
import type { Broker } from "@/types";

export function RecordView({ id }: { id: string }) {
  const { pushRecent, hydrated } = useApp();
  React.useEffect(() => { if (hydrated) pushRecent(id); }, [hydrated, id]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

export function PropertyActions({ id, title }: { id: string; title: string }) {
  const { toggleCompare, compare, hydrated, toast } = useApp();
  const inCompare = hydrated && compare.includes(id);
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title, url });
      else { await navigator.clipboard.writeText(url); toast("Link copied", "success"); }
    } catch { /* user cancelled */ }
  };
  return (
    <div className="flex flex-wrap gap-2">
      <SaveButton id={id} label className="border border-line-strong !bg-white !shadow-none" />
      <Button variant={inCompare ? "soft" : "secondary"} size="sm" className="rounded-full" onClick={() => toggleCompare(id)} aria-pressed={inCompare}><Columns3 size={15} />{inCompare ? "In comparison" : "Compare"}</Button>
      <Button variant="secondary" size="sm" className="rounded-full" onClick={share}><Share2 size={15} />Share</Button>
    </div>
  );
}

const QUESTIONS = ["Is this suitable for a family?", "What would my monthly payment be?", "What are the main things I should consider?", "Find similar properties.", "Compare this with other apartments."];

export function AskAIPanel({ id }: { id: string }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-palm-950 text-white">
      <div className="p-5">
        <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[.12em] text-gold-400"><Sparkles size={13} />Raed · AI agent</p>
        <h3 className="mt-2 text-lg font-bold">Ask AI About This Property</h3>
        <p className="mt-1 text-[13px] text-white/65">Opens the agent with this listing already loaded as context.</p>
        <ul className="mt-4 space-y-1.5">
          {QUESTIONS.map((q) => (
            <li key={q}><Link href={`/agent?property=${id}&q=${encodeURIComponent(q)}`} className="flex items-center justify-between gap-2 rounded-xl bg-white/[.06] px-3 py-2.5 text-[13.5px] font-medium hover:bg-white/[.12]">{q}<span aria-hidden className="text-gold-400 rtl:rotate-180">→</span></Link></li>
          ))}
        </ul>
        <Button asChild variant="gold" className="mt-4 w-full"><Link href={`/agent?property=${id}`}><MessageSquareText size={16} />Open agent with this property</Link></Button>
      </div>
    </div>
  );
}

export function BrokerCard({ broker }: { broker: Broker }) {
  const [show, setShow] = React.useState(false);
  const { toast } = useApp();
  return (
    <div className="surface p-5">
      <p className="text-[12px] font-bold uppercase tracking-[.1em] text-ink-3">Listed by</p>
      <div className="mt-3 flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-palm-100 font-bold text-palm-900">{broker.initials}</span>
        <div><p className="font-bold">{broker.name}</p><p className="text-[13px] text-ink-3">{broker.company}</p></div>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
        <div><dt className="text-ink-3">Response time</dt><dd className="font-semibold">{broker.responseTime}</dd></div>
        <div><dt className="text-ink-3">Active listings</dt><dd className="num font-semibold">{broker.listings}</dd></div>
      </dl>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button variant="secondary" size="sm" onClick={() => setShow(true)}><Phone size={15} />{show ? broker.phoneMasked : "Show number"}</Button>
        <Button size="sm" onClick={() => toast("Enquiry sent (demo) — the lister will be notified", "success")}>Send enquiry</Button>
      </div>
      <p className="mt-3 text-[11.5px] text-ink-4">Demo contact details. Numbers are masked in this prototype.</p>
    </div>
  );
}
