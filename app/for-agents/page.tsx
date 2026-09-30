import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3, BadgeCheck, MessagesSquare, PenLine, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "For Agents & Developers", description: "List on Riyah and get matched with buyers by an AI agent. AI listing tools, qualified leads and performance analytics." };

const FEATURES = [
  [Sparkles, "AI-matched buyers", "Raed recommends your listings when they fit a buyer’s stated budget, location and purpose — with the reasons shown."],
  [Users, "Qualified AI leads", "Leads arrive with the buyer’s brief, shortlist and financing estimate already attached."],
  [PenLine, "Listing copilot", "Generate descriptions, improve wording, suggest tags and draft answers to buyer questions."],
  [BadgeCheck, "Licence-first listings", "Show FAL and advertising licence details up front — buyers trust what they can check."],
  [MessagesSquare, "Unified inbox", "Enquiries from listings and the AI agent in one place."],
  [BarChart3, "Performance analytics", "Views, saves, AI recommendations and leads per listing."],
] as const;

export default function ForAgentsPage() {
  return <div>
    <section className="bg-palm-950 text-white">
      <div className="mx-auto max-w-[1360px] px-5 py-20 lg:px-8">
        <p className="text-[12px] font-bold uppercase tracking-[.14em] text-gold-400">For agents & developers</p>
        <h1 className="mt-3 max-w-3xl text-display-xl">Your listings, recommended by an AI agent.</h1>
        <p className="mt-5 max-w-2xl text-lg text-white/70">Riyah’s agent turns buyer conversations into shortlists. Be on them — with tools that make every listing clearer and every lead warmer.</p>
        <div className="mt-8 flex flex-wrap gap-3"><Button asChild variant="gold" size="lg"><Link href="/dashboard">Open agent dashboard</Link></Button><Button asChild size="lg" className="bg-white/10 hover:bg-white/20"><Link href="/dashboard/new">Create a listing</Link></Button></div>
      </div>
    </section>
    <section className="mx-auto max-w-[1360px] px-5 py-16 lg:px-8">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{FEATURES.map(([Icon, t, d]) => <div key={t} className="surface p-6"><span className="grid h-10 w-10 place-items-center rounded-xl bg-palm-50 text-palm-700"><Icon size={19} /></span><h2 className="mt-4 text-lg font-bold">{t}</h2><p className="mt-1.5 text-[14px] text-ink-3">{d}</p></div>)}</div>
      <p className="mt-8 text-[12.5px] text-ink-4">Prototype: dashboards use demo data. Pricing and onboarding are not yet live.</p>
    </section>
  </div>;
}
