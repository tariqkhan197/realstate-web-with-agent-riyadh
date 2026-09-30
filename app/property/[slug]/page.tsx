import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, CalendarDays, Car, Check, ChevronRight, FileCheck2, Hammer, Home, Info, KeyRound, MapPin, Sofa, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DiscountBadge, VerificationBadge } from "@/components/property/Badges";
import { PropertyCard, Specs } from "@/components/property/PropertyCard";
import { locationLine } from "@/lib/location";
import { getCity } from "@/data/locations";
import { PropertyPhoto } from "@/components/property/PropertyImage";
import { DistrictMap } from "@/components/map/DistrictMap";
import { MortgageCalculator } from "@/components/finance/MortgageCalculator";
import { InvestmentAnalysisCard } from "@/components/finance/InvestmentAnalysisCard";
import { Gallery } from "@/features/property/Gallery";
import { AskAIPanel, BrokerCard, PropertyActions, RecordView } from "@/features/property/PropertyClientBits";
import { getNeighborhood } from "@/data/locations";
import { getBroker } from "@/data/brokers";
import { FEATURE_LABEL, TYPE_LABEL } from "@/data/properties";
import { allProperties, findSimilarProperties, getPropertyBySlug } from "@/services/propertySearch";
import { analyzeInvestment } from "@/services/investment";
import { defaultMortgageFor } from "@/services/mortgage";
import { getNeighborhoodInfo } from "@/services/neighborhood";
import { discountPct, formatDate, formatNumber, formatSAR, pricePerSqm } from "@/lib/utils";

export function generateStaticParams() {
  return allProperties().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getPropertyBySlug((await params).slug);
  if (!p) return { title: "Property not found" };
  const loc = locationLine(p);
  const title = `${p.bedrooms ? `${p.bedrooms}-bed ` : ""}${TYPE_LABEL[p.type]} ${p.purpose === "rent" ? "for rent" : "for sale"} in ${loc.hood} · ${formatSAR(p.price)}`;
  const description = `${p.title}. ${p.area} sqm, ${p.bedrooms} bedrooms, ${p.bathrooms} bathrooms in ${loc.hood}, ${loc.area}. ${p.description.slice(0, 120)}`;
  const img = p.images[0]?.src;
  return { title, description, alternates: { canonical: `/property/${p.slug}` }, openGraph: { title, description, type: "article", images: img ? [{ url: img }] : undefined } };
}

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = getPropertyBySlug((await params).slug);
  if (!p) notFound();
  const loc = locationLine(p);
  const nb = getNeighborhood(p.neighborhood);
  const info = getNeighborhoodInfo(p.neighborhood);
  const broker = getBroker(p.brokerId);
  const similar = findSimilarProperties(p, 4);
  const inv = analyzeInvestment(p);
  const mort = defaultMortgageFor(p.price);
  const floorPlans = p.images.filter((i) => i.category === "floor-plan");
  const nearby = allProperties().filter((x) => x.neighborhood === p.neighborhood).slice(0, 8);
  const disc = discountPct(p.price, p.previousPrice);
  const L = p.licensing;

  const facts: [React.ReactNode, string, string][] = [
    [<Home key="i" size={16} />, "Type", TYPE_LABEL[p.type]],
    [<KeyRound key="i" size={16} />, "Purpose", p.purpose === "rent" ? "For Rent" : "For Sale"],
    [<Check key="i" size={16} />, "Completion", p.completion === "ready" ? "Ready" : "Off-plan"],
    [<Sofa key="i" size={16} />, "Furnishing", p.furnishing[0].toUpperCase() + p.furnishing.slice(1)],
    [<Hammer key="i" size={16} />, "Property age", p.age === "new" ? "New" : `${p.age} years`],
    [<Car key="i" size={16} />, "Parking", String(p.parking)],
    [<CalendarDays key="i" size={16} />, "Added", formatDate(p.addedOn)],
    ...(L.truCheckDate ? [[<FileCheck2 key="i" size={16} />, "TruCheck", formatDate(L.truCheckDate)] as [React.ReactNode, string, string]] : []),
  ];

  const jsonLd = {
    "@context": "https://schema.org", "@type": "RealEstateListing", name: p.title, description: p.description, url: `/property/${p.slug}`,
    datePosted: p.addedOn, image: p.images.filter((i) => !i.placeholder).map((i) => i.src),
    offers: { "@type": "Offer", price: p.price, priceCurrency: "SAR", businessFunction: p.purpose === "rent" ? "LeaseOut" : "Sell" },
    about: { "@type": "Apartment", numberOfRooms: p.bedrooms, numberOfBathroomsTotal: p.bathrooms, floorSize: { "@type": "QuantitativeValue", value: p.area, unitCode: "MTK" },
      address: { "@type": "PostalAddress", addressLocality: loc.hood, addressRegion: getCity(p.city)?.name ?? "", addressCountry: "SA" } },
  };

  return (
    <div className="mx-auto max-w-[1360px] px-5 pb-28 pt-6 lg:px-8">
      <RecordView id={p.id} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-[13px] text-ink-3">
        <Link href="/" className="hover:text-ink">Home</Link><ChevronRight size={14} className="rtl:rotate-180" />
        <Link href={p.purpose === "rent" ? "/rent" : "/buy"} className="hover:text-ink">{p.purpose === "rent" ? "Rent" : "Buy"}</Link><ChevronRight size={14} className="rtl:rotate-180" />
        {nb && <><Link href={`/neighborhoods/${nb.slug}`} className="hover:text-ink">{nb.name}</Link><ChevronRight size={14} className="rtl:rotate-180" /></>}
        <span className="truncate text-ink-2">{TYPE_LABEL[p.type]}</span>
      </nav>

      {p.images.some((i) => i.placeholder) && p.isPrimaryDemo && (
        <p className="mb-4 flex items-start gap-2 rounded-xl border border-gold-200 bg-gold-50 px-4 py-3 text-[13px] text-gold-700"><Info size={15} className="mt-0.5 shrink-0" />Photo slots are reserved for this listing's supplied photos. Add them to <code className="break-all font-semibold">/public/properties/dhahrat-laban/</code> and set <code className="break-all font-semibold">PHOTOS_READY</code> in <code className="break-all font-semibold">data/demoPropertyImages.ts</code>.</p>
      )}

      <Gallery images={p.images} title={p.title} badges={<><VerificationBadge property={p} /><DiscountBadge property={p} /></>} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-8">
          <header>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="palm" size="md">{TYPE_LABEL[p.type]} · {p.purpose === "rent" ? "For Rent" : "For Sale"}</Badge>
              {p.age === "new" && <Badge tone="outline" size="md">New</Badge>}
              <Badge tone="outline" size="md">{p.completion === "ready" ? "Ready" : "Off-plan"}</Badge>
              {!p.isPrimaryDemo && <Badge tone="neutral" size="md">Demo listing</Badge>}
            </div>
            <div className="mt-4 flex flex-wrap items-end gap-x-4 gap-y-1">
              <p className="num text-[clamp(2rem,4vw,2.8rem)] font-bold leading-none tracking-[-0.03em]">{formatSAR(p.price)}{p.purpose === "rent" && <span className="text-lg font-semibold text-ink-3"> / year</span>}</p>
              {p.previousPrice && <p className="num pb-1 text-ink-3"><span className="line-through">{formatSAR(p.previousPrice)}</span> <span className="font-semibold text-gold-700">−{disc.toFixed(1)}%</span></p>}
            </div>
            <h1 className="mt-3 text-[clamp(1.35rem,2.2vw,1.75rem)] font-bold leading-snug tracking-[-0.02em]">{p.title}</h1>
            <p className="mt-2 flex items-center gap-1.5 text-ink-2"><MapPin size={16} className="text-palm-600" /><span><span className="font-semibold">{loc.hood}</span>, {loc.area}</span></p>
            <Specs p={p} className="mt-4 text-[15px]" />
            <p className="num mt-2 text-[13px] text-ink-3">{formatSAR(Math.round(pricePerSqm(p.price, p.area)))} per sqm{p.purpose === "sale" && <> · est. {formatSAR(Math.round(mort.monthlyPayment))}/mo with 10% down <a href="#financing" className="font-semibold text-palm-700 hover:underline">(estimate)</a></>}</p>
            <div className="mt-5"><PropertyActions id={p.id} title={p.title} /></div>
          </header>

          <section className="surface p-6" aria-labelledby="facts">
            <h2 id="facts" className="text-title">Key details</h2>
            <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
              {facts.map(([icon, l, v]) => (
                <div key={l}><dt className="flex items-center gap-1.5 text-[12.5px] text-ink-3"><span className="text-ink-4">{icon}</span>{l}</dt><dd className="mt-0.5 font-semibold">{v}</dd></div>
              ))}
            </dl>
          </section>

          <section className="surface p-6" aria-labelledby="overview">
            <h2 id="overview" className="text-title">Overview</h2>
            <p className="mt-3 max-w-prose leading-relaxed text-ink-2">{p.description}</p>
            {!p.isPrimaryDemo && <p className="mt-3 text-[12.5px] text-ink-4">Demo listing — description generated for the prototype.</p>}
          </section>

          <section className="surface p-6" aria-labelledby="amenities">
            <h2 id="amenities" className="text-title">Amenities</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {p.features.map((f) => <li key={f} className="flex items-center gap-2.5 rounded-xl border border-line px-3.5 py-3 text-[14px] font-medium"><span className="grid h-7 w-7 place-items-center rounded-lg bg-palm-50 text-palm-700"><Check size={15} /></span>{FEATURE_LABEL[f]}</li>)}
              {p.demoFeatures?.map((f) => <li key={f} className="flex items-center gap-2.5 rounded-xl border border-dashed border-line-strong px-3.5 py-3 text-[14px] font-medium text-ink-2"><span className="grid h-7 w-7 place-items-center rounded-lg bg-ink/[.05] text-ink-3"><Check size={15} /></span>{FEATURE_LABEL[f]}<Badge tone="outline" className="ms-auto">Demo</Badge></li>)}
            </ul>
            {p.demoFeatures?.length ? <p className="mt-3 text-[12.5px] text-ink-3">Items marked “Demo” are illustrative additions, not part of the listing’s stated features.</p> : null}
          </section>

          <section className="surface p-6" aria-labelledby="verified">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="verified" className="text-title">Listing licence information</h2>
              {L.regaVerified ? <Badge tone="palm" size="md"><BadgeCheck size={14} />{p.isPrimaryDemo ? "REGA verified (as listed)" : "Licence shown (demo)"}</Badge> : <Badge tone="danger" size="md">No licence shown</Badge>}
            </div>
            <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {([["FAL licence", L.falLicense], ["Advertising licence", L.advertisingLicense], ["Licence issue date", L.licenseIssued && formatDate(L.licenseIssued)], ["Licence expiry date", L.licenseExpiry && formatDate(L.licenseExpiry)], ["Source reference", L.sourceReference], ["TruCheck", L.truCheckDate && formatDate(L.truCheckDate)]] as [string, string | undefined][])
                .filter(([, v]) => v).map(([l, v]) => <div key={l} className="flex justify-between gap-3 border-b border-line pb-3"><dt className="text-[13.5px] text-ink-3">{l}</dt><dd className="num text-end text-[14px] font-semibold">{v}</dd></div>)}
            </dl>
            <p className="mt-4 text-[12.5px] leading-relaxed text-ink-3">{p.isPrimaryDemo ? "Licence details are reproduced as provided with the listing. Riyah has not independently verified them — confirm title deed and licence status with REGA before any transaction." : "Demo listing: licence numbers prefixed DEMO- are placeholders, not real REGA/FAL records."}</p>
          </section>

          <section className="surface p-6" aria-labelledby="location">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="location" className="text-title">Location</h2>
              {nb && <Link href={`/neighborhoods/${nb.slug}`} className="text-sm font-semibold text-palm-700 hover:underline">Explore {nb.name} →</Link>}
            </div>
            <p className="mt-2 text-ink-2">{loc.hood}, {loc.area}. {nb?.summary}</p>
            <DistrictMap city={p.city} properties={nearby} selectedId={p.id} className="mt-5 h-[340px]" />
            {nb && <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div><h3 className="text-[13px] font-bold">Nearby amenities</h3><ul className="mt-1.5 space-y-1 text-[13.5px] text-ink-2">{nb.amenities.slice(0, 4).map((a) => <li key={a}>{a}</li>)}</ul></div>
              <div><h3 className="text-[13px] font-bold">Lifestyle</h3><ul className="mt-1.5 space-y-1 text-[13.5px] text-ink-2">{nb.lifestyle.slice(0, 4).map((a) => <li key={a}>{a}</li>)}</ul></div>
              <div><h3 className="text-[13px] font-bold">Transport</h3><p className="mt-1.5 text-[13.5px] text-ink-2">{nb.transport}</p></div>
            </div>}
            <p className="mt-4 text-[12px] text-ink-4">Simulated district map and demo neighbourhood notes. Connect a map provider for exact coordinates.</p>
          </section>

          <section className="surface p-6" aria-labelledby="floorplan">
            <h2 id="floorplan" className="text-title">Floor plan</h2>
            {floorPlans.length ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">{floorPlans.map((fp) => <figure key={fp.src}><PropertyPhoto image={fp} fit="contain" className="aspect-[4/3] rounded-2xl border border-line bg-white" sizes="(max-width:768px) 100vw, 40vw" /><figcaption className="mt-2 text-[13px] text-ink-3">{fp.caption}{fp.placeholder && " · reserved slot for the supplied floor plan"}</figcaption></figure>)}</div>
            ) : <p className="mt-3 text-sm text-ink-3">No floor plan has been provided for this listing yet. <Link href={`/agent?property=${p.id}&q=${encodeURIComponent("Can you request the floor plan?")}`} className="font-semibold text-palm-700">Ask the agent</Link>.</p>}
            {p.isPrimaryDemo && <p className="mt-3 text-[13px] text-ink-3">The development offers unit sizes from 106 to 194 sqm; this unit is {p.area} sqm.</p>}
          </section>

          {p.purpose === "sale" && <MortgageCalculator price={p.price} />}

          <InvestmentAnalysisCard a={inv} rental={p.purpose === "rent"} />

          <section aria-labelledby="ai-analysis" className="surface p-6">
            <h2 id="ai-analysis" className="flex items-center gap-2 text-title"><Sparkles size={20} className="text-gold-600" />AI analysis</h2>
            <p className="mt-3 text-ink-2">{info?.aiSummary}</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              <li className="rounded-xl bg-palm-50 p-4 text-[13.5px] text-palm-900"><b>Space:</b> {formatNumber(p.area / Math.max(1, p.bedrooms), 0)} sqm per bedroom{p.bedrooms >= 4 && p.area / p.bedrooms < 36 ? " — efficient layout; check room sizes on the floor plan." : "."}</li>
              <li className="rounded-xl bg-palm-50 p-4 text-[13.5px] text-palm-900"><b>Price position:</b> {formatSAR(Math.round(pricePerSqm(p.price, p.area)))}/sqm vs demo band {nb ? `${formatSAR(nb.demoPricePerSqm[0])}–${formatSAR(nb.demoPricePerSqm[1])}` : "n/a"} (Demo Estimate).</li>
              {p.features.includes("maid-room") && <li className="rounded-xl bg-palm-50 p-4 text-[13.5px] text-palm-900"><b>Family fit:</b> maid room and {p.bedrooms} bedrooms suit larger households.</li>}
              <li className="rounded-xl bg-palm-50 p-4 text-[13.5px] text-palm-900"><b>Parking:</b> {p.parking} space{p.parking === 1 ? "" : "s"}{p.parking < 2 && p.bedrooms >= 4 ? " — may be tight for a two-car family." : "."}</li>
            </ul>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <AskAIPanel id={p.id} />
          <BrokerCard broker={broker} />
          <div className="surface p-5 text-[13px] text-ink-3"><p className="font-semibold text-ink-2">Reference</p><p className="num mt-1">{L.sourceReference ?? p.id}</p></div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-14" aria-labelledby="similar">
          <div className="mb-6 flex items-end justify-between gap-4"><h2 id="similar" className="text-display">Similar properties</h2><Link href={`/agent?property=${p.id}&q=${encodeURIComponent("Find similar properties.")}`} className="text-sm font-semibold text-palm-700 hover:underline">Ask Raed for more →</Link></div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{similar.map((s) => <PropertyCard key={s.id} property={s} />)}</div>
        </section>
      )}
    </div>
  );
}
