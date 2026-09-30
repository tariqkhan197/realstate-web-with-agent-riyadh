import Link from "next/link";
import { ArrowUpRight, Calculator, Check, Columns3, LineChart, Map as MapIcon } from "lucide-react";
import { AgentAvatar } from "@/components/brand/AgentAvatar";
import { MatchBadge } from "@/components/property/Badges";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertyPhoto, coverOf } from "@/components/property/PropertyImage";
import { SectionHeading } from "@/components/ui/misc";
import { HeroSearch } from "@/features/home/HeroSearch";
import { HeroText } from "@/features/home/HeroText";
import { NEIGHBORHOODS, CITIES } from "@/data/locations";
import { PRIMARY_PROPERTY, PROPERTIES } from "@/data/properties";
import { getNeighborhood } from "@/data/locations";
import { parseCriteria } from "@/lib/ai/intent";
import { createShortlist } from "@/services/shortlist";
import { formatSAR } from "@/lib/utils";

const HERO_Q = "I need a 4-bedroom apartment in Riyadh under SAR 800K.";

export default function Home() {
  const hero = createShortlist({ ...parseCriteria(HERO_Q).c, purpose: "sale" }, 6);
  const heroResults = [hero.results.find((r) => r.property.isPrimaryDemo)!, ...hero.results.filter((r) => !r.property.isPrimaryDemo)].filter(Boolean).slice(0, 3).sort((a, b) => b.percent - a.percent);
  const featured = [PRIMARY_PROPERTY, ...PROPERTIES.filter((p) => ["riyah-r19", "riyah-r28", "riyah-r26"].includes(p.id))];
  const riyadh = NEIGHBORHOODS.filter((n) => n.city === "riyadh");
  const steps = ["Requirements understood", "Searching Riyadh listings", "Filtering by budget", "Filtering by bedrooms", "Ranking matching properties", "Shortlist ready"];

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-line bg-white">
        <div className="mx-auto grid max-w-[1360px] items-center gap-12 px-5 pb-16 pt-12 lg:grid-cols-[1fr_1.08fr] lg:px-8 lg:pb-24 lg:pt-20">
          <div>
            <HeroText />
            <div className="mt-10 max-w-xl"><HeroSearch /></div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-3xl">
              <PropertyPhoto image={coverOf(PRIMARY_PROPERTY)} className="aspect-[4/3.4] w-full lg:aspect-[4/3.6]" priority sizes="(max-width:1024px) 100vw, 55vw" />
              <div className="absolute start-4 top-4 rounded-full bg-white/92 px-3 py-1.5 text-[12px] font-semibold text-ink shadow-ring backdrop-blur">Dhahrat Laban · West Riyadh</div>
            </div>
            {/* Agent interface */}
            <div className="relative -mt-40 ms-4 me-4 rounded-3xl border border-line bg-white p-4 shadow-lift sm:-mt-52 sm:me-auto sm:ms-[-2rem] sm:max-w-[430px] lg:ms-[-4.5rem]">
              <div className="flex items-center gap-2.5 border-b border-line pb-3">
                <AgentAvatar size={32} />
                <div className="leading-tight"><p className="text-[13.5px] font-bold">Raed</p><p className="text-[11.5px] text-palm-700">Your shortlist is ready</p></div>
              </div>
              <div className="mt-3 flex justify-end"><p className="max-w-[85%] rounded-2xl rounded-ee-md bg-palm-900 px-3.5 py-2.5 text-[13px] text-white">{HERO_Q}</p></div>
              <p className="mt-3 text-[13px] leading-relaxed text-ink-2">I found <b className="text-ink">{hero.found} matching properties</b>. {hero.strong} closely match your budget, location and bedroom requirements. I&apos;ve prepared a shortlist for you.</p>
              <ul className="mt-3 space-y-2">
                {heroResults.map((r) => (
                  <li key={r.property.id}>
                    <Link href={`/property/${r.property.slug}`} className="flex items-center gap-3 rounded-2xl border border-line p-2 hover:border-line-strong">
                      <PropertyPhoto image={coverOf(r.property)} className="h-12 w-16 shrink-0 rounded-xl" sizes="64px" />
                      <div className="min-w-0 flex-1">
                        <p className="num text-[13.5px] font-bold">{formatSAR(r.property.price)}</p>
                        <p className="truncate text-[12px] text-ink-3">{getNeighborhood(r.property.neighborhood)?.name} · {r.property.bedrooms} beds · {r.property.area} sqm</p>
                      </div>
                      <MatchBadge percent={r.percent} />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* HOW THE AGENT WORKS — actual tool sequence */}
      <section className="mx-auto max-w-[1360px] px-5 py-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:items-center">
          <div>
            <h2 className="text-display">An agent that does the work, not a chatbot that talks about it.</h2>
            <p className="mt-4 max-w-md text-ink-2">Every request runs real tools — search, filter, rank, finance, compare — and shows you each step, so you can see exactly why a property made your shortlist.</p>
          </div>
          <ol className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2">
            {steps.map((s, i) => (
              <li key={s} className="flex items-center gap-3 bg-white px-5 py-4">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-palm-50 text-palm-700"><Check size={15} strokeWidth={2.6} /></span>
                <span className="text-[14.5px] font-semibold">{s}</span>
                <span className="num ms-auto text-xs text-ink-4">{String(i + 1).padStart(2, "0")}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto max-w-[1360px] px-5 lg:px-8">
        <SectionHeading title="Featured listings" sub="Hand-picked demo listings across Riyadh." action={<Link href="/buy" className="inline-flex items-center gap-1 text-sm font-semibold text-palm-700 hover:underline">View all properties <ArrowUpRight size={15} /></Link>} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{featured.map((p) => <PropertyCard key={p.id} property={p} />)}</div>
      </section>

      {/* NEIGHBOURHOODS */}
      <section className="mx-auto max-w-[1360px] px-5 py-20 lg:px-8">
        <SectionHeading title="Explore Riyadh by neighbourhood" sub="Profiles, demo price bands and lifestyle notes for each district." action={<Link href="/neighborhoods" className="inline-flex items-center gap-1 text-sm font-semibold text-palm-700 hover:underline">All neighbourhoods <ArrowUpRight size={15} /></Link>} />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {riyadh.map((n) => {
            const count = PROPERTIES.filter((p) => p.neighborhood === n.slug).length;
            return (
              <Link key={n.slug} href={`/neighborhoods/${n.slug}`} className="group rounded-2xl border border-line bg-white p-4 hover:border-palm-200 hover:bg-palm-50/40">
                <p className="text-[15px] font-bold">{n.name}</p>
                <p className="font-arabic text-[13px] text-ink-3">{n.nameAr}</p>
                <p className="mt-3 text-[12px] text-ink-3"><span className="capitalize">{n.region}</span> · {count} listing{count === 1 ? "" : "s"}</p>
              </Link>
            );
          })}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {CITIES.filter((c) => c.slug !== "riyadh").map((c) => <Link key={c.slug} href={`/buy?city=${c.slug}`} className="rounded-full border border-line bg-white px-4 py-2 text-[13px] font-semibold text-ink-2 hover:border-line-strong">{c.name}</Link>)}
        </div>
      </section>

      {/* TOOLS */}
      <section className="mx-auto max-w-[1360px] px-5 lg:px-8">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { href: "/investment", icon: LineChart, t: "Investment intelligence", d: "Low, base and high rental scenarios with running costs — clearly labelled as estimates." },
            { href: "/property/" + PRIMARY_PROPERTY.slug + "#financing", icon: Calculator, t: "Financing calculator", d: "Down payment, term and profit rate to an estimated monthly payment." },
            { href: "/compare", icon: Columns3, t: "Objective comparison", d: "Up to four properties side by side. Differences highlighted, no fake winners." },
            { href: "/map", icon: MapIcon, t: "Map discovery", d: "Browse Riyadh districts and Saudi cities with price markers." },
          ].map((x) => (
            <Link key={x.t} href={x.href} className="rounded-2xl border border-line bg-white p-5 hover:shadow-card">
              <x.icon size={20} className="text-palm-700" />
              <h3 className="mt-4 text-[16px] font-bold">{x.t}</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-3">{x.d}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* AGENTS BAND */}
      <section className="mx-auto mt-20 max-w-[1360px] px-5 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-palm-950 px-8 py-12 text-white md:px-14">
          <svg className="absolute -end-10 -top-10 h-72 w-72 opacity-[.08]" viewBox="0 0 24 24" aria-hidden><rect x="6" y="6" width="12" height="12" fill="none" stroke="#fff" strokeWidth=".6" /><rect x="6" y="6" width="12" height="12" fill="none" stroke="#fff" strokeWidth=".6" transform="rotate(45 12 12)" /></svg>
          <div className="relative max-w-2xl">
            <h2 className="text-display text-white">List where buyers arrive with a brief, not just a click.</h2>
            <p className="mt-4 text-white/70">Riyah&apos;s agent sends you buyers who already know their budget, area and must-haves — and it writes your listing descriptions too.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/for-agents" className="inline-flex h-12 items-center rounded-xl bg-white px-5 text-[15px] font-semibold text-palm-950 hover:bg-palm-50">For agents</Link>
              <Link href="/dashboard" className="inline-flex h-12 items-center rounded-xl border border-white/25 px-5 text-[15px] font-semibold text-white hover:bg-white/10">Open agent dashboard</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
