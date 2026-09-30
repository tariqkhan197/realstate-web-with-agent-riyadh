import type { Metadata } from "next";
import Link from "next/link";
import { Building2, CalendarClock, ShieldCheck } from "lucide-react";
import { PropertyCard } from "@/components/property/PropertyCard";
import { allProperties } from "@/services/propertySearch";

export const metadata: Metadata = { title: "New Projects & Off-plan", description: "Off-plan and newly completed developments across Riyadh and Saudi Arabia, with AI analysis of payment plans and handover risk." };

export default function ProjectsPage() {
  const all = allProperties().filter((p) => p.purpose === "sale");
  const offPlan = all.filter((p) => p.completion === "off-plan");
  const newReady = all.filter((p) => p.completion === "ready" && p.age === "new").slice(0, 8);
  return <div className="mx-auto max-w-[1360px] px-5 pb-28 pt-10 lg:px-8">
    <p className="text-[12px] font-bold uppercase tracking-[.14em] text-gold-700">Projects</p>
    <h1 className="mt-2 text-display">New projects and off-plan homes</h1>
    <p className="mt-2 max-w-2xl text-ink-3">Buying before completion can mean better pricing — and more to check. Raed flags handover, payment and registration questions for every project.</p>
    <div className="mt-8 grid gap-4 md:grid-cols-3">
      {[[ShieldCheck, "Check registration", "Confirm the project’s off-plan sales registration and escrow arrangements with the relevant authority."], [CalendarClock, "Understand milestones", "Map each payment to a construction milestone and the promised handover date."], [Building2, "Compare with ready stock", "Weigh the discount against waiting time, rent you’ll keep paying and delivery risk."]].map(([Icon, t, d]) => {
        const I = Icon as React.ElementType;
        return <div key={t as string} className="surface p-5"><I size={18} className="text-palm-700" /><p className="mt-2 font-bold">{t as string}</p><p className="mt-1 text-[13.5px] text-ink-3">{d as string}</p></div>;
      })}
    </div>
    <section className="mt-12"><h2 className="text-title">Off-plan</h2><div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{offPlan.map((p) => <PropertyCard key={p.id} property={p} />)}</div></section>
    <section className="mt-12"><div className="flex items-end justify-between"><h2 className="text-title">Newly completed</h2><Link href="/buy" className="text-sm font-semibold text-palm-700 hover:underline">All properties →</Link></div><div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{newReady.map((p) => <PropertyCard key={p.id} property={p} />)}</div></section>
    <p className="mt-8 text-[12.5px] text-ink-4">All projects shown are demo listings.</p>
  </div>;
}
