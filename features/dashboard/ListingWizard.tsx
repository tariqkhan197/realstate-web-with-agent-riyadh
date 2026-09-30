"use client";
import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, ImagePlus, Loader2, MessageCircleQuestion, Sparkles, Tags, Wand2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Chip } from "@/components/ui/misc";
import { CITIES, neighborhoodsIn, getNeighborhood, getCity } from "@/data/locations";
import { FEATURE_LABEL, TYPE_LABEL } from "@/data/properties";
import { answerBuyerQuestion, generateListingDescription, improveListing, suggestTags, type DraftListing } from "@/services/listingAI";
import { cn, formatSAR, formatNumber, sleep } from "@/lib/utils";
import { useApp } from "@/lib/store";
import type { Feature, PropertyType } from "@/types";

const STEPS = ["Property Details", "Location", "Photos", "Amenities", "Price", "Verification", "Preview", "Publish"] as const;

interface Draft extends DraftListing { title: string; city: string; photos: { name: string; url: string }[]; fal: string; adLicence: string; tags: string[] }

export function ListingWizard() {
  const { toast } = useApp();
  const [step, setStep] = React.useState(0);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [published, setPublished] = React.useState(false);
  const [changes, setChanges] = React.useState<string[]>([]);
  const [qa, setQa] = React.useState({ q: "Is parking included?", a: "" });
  const [d, setD] = React.useState<Draft>({ title: "", type: "apartment", purpose: "sale", city: "riyadh", neighborhood: "dhahrat-laban", bedrooms: 4, bathrooms: 3, area: 135, price: 730000, features: ["maid-room", "parking"], description: "", photos: [], fal: "", adLicence: "", tags: [] });
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));
  const nb = getNeighborhood(d.neighborhood);

  const ai = async (kind: "generate" | "improve" | "tags" | "answer") => {
    setBusy(kind); await sleep(700);
    if (kind === "generate") set("description", generateListingDescription(d));
    if (kind === "improve") { const r = improveListing(d.description || generateListingDescription(d)); set("description", r.text); setChanges(r.changes); }
    if (kind === "tags") set("tags", suggestTags(d));
    if (kind === "answer") setQa((x) => ({ ...x, a: answerBuyerQuestion(x.q, d) }));
    setBusy(null);
  };

  const errors: Record<number, string | null> = {
    0: d.title.trim().length < 8 ? "Add a descriptive title (at least 8 characters)." : d.area <= 0 ? "Enter the area." : null,
    2: null, 4: d.price < 1000 ? "Enter a valid price." : null,
    5: !/^\d{10}$/.test(d.adLicence) ? "Enter the 10-digit advertising licence number." : null,
  };
  const next = () => { const e = errors[step]; if (e) { toast(e); return; } setStep((s) => Math.min(STEPS.length - 1, s + 1)); };

  const onPhotos = (files: FileList | null) => {
    if (!files) return;
    set("photos", [...d.photos, ...Array.from(files).filter((f) => f.type.startsWith("image/")).map((f) => ({ name: f.name, url: URL.createObjectURL(f) }))].slice(0, 20));
  };

  if (published) return (
    <div className="mx-auto max-w-xl px-5 py-20 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-palm-900 text-white"><Check size={26} /></span>
      <h1 className="mt-5 text-display">Listing submitted</h1>
      <p className="mt-3 text-ink-3">Your listing is queued for licence verification. In this demo nothing is sent to a server — connect the listings service in <code className="text-[13px]">services/</code> to persist it.</p>
      <div className="mt-8 flex justify-center gap-2"><Button asChild variant="secondary"><Link href="/dashboard">Back to dashboard</Link></Button><Button onClick={() => { setPublished(false); setStep(0); }}>Create another</Button></div>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-5 pb-28 pt-8 lg:px-8">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ink-3 hover:text-ink"><ArrowLeft size={14} className="rtl:rotate-180" />Dashboard</Link>
      <h1 className="mt-3 text-display">Create listing</h1>
      <ol className="mt-6 flex gap-1.5 overflow-x-auto pb-2 scrollbar-none" aria-label="Steps">
        {STEPS.map((s, i) => (
          <li key={s}><button type="button" onClick={() => i < step && setStep(i)} aria-current={i === step ? "step" : undefined}
            className={cn("flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-semibold", i === step ? "border-palm-900 bg-palm-900 text-white" : i < step ? "border-palm-200 bg-palm-50 text-palm-900" : "border-line text-ink-3")}>
            <span className="num grid h-5 w-5 place-items-center rounded-full bg-white/15 text-[11px]">{i < step ? <Check size={12} /> : i + 1}</span>{s}</button></li>))}
      </ol>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <section className="surface p-6" aria-label={STEPS[step]}>
          <h2 className="text-title">{STEPS[step]}</h2>
          <div className="mt-5 space-y-4">
            {step === 0 && <>
              <div><label className="label" htmlFor="t">Listing title</label><input id="t" className="field" placeholder="e.g. 4-bedroom apartment in Dhahrat Laban" value={d.title} onChange={(e) => set("title", e.target.value)} /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="label" htmlFor="ty">Property type</label><select id="ty" className="field" value={d.type} onChange={(e) => set("type", e.target.value as PropertyType)}>{Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div>
                <div><span className="label">Purpose</span><div className="flex gap-2">{(["sale", "rent"] as const).map((p) => <Chip key={p} active={d.purpose === p} onClick={() => set("purpose", p)}>{p === "sale" ? "For sale" : "For rent"}</Chip>)}</div></div>
                <div><label className="label" htmlFor="bd">Bedrooms</label><input id="bd" type="number" min={0} className="field num" value={d.bedrooms} onChange={(e) => set("bedrooms", +e.target.value)} /></div>
                <div><label className="label" htmlFor="ba">Bathrooms</label><input id="ba" type="number" min={0} className="field num" value={d.bathrooms} onChange={(e) => set("bathrooms", +e.target.value)} /></div>
                <div><label className="label" htmlFor="ar">Area (sqm)</label><input id="ar" type="number" min={0} className="field num" value={d.area} onChange={(e) => set("area", +e.target.value)} /></div>
              </div>
            </>}
            {step === 1 && <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="label" htmlFor="c">City</label><select id="c" className="field" value={d.city} onChange={(e) => { set("city", e.target.value); set("neighborhood", neighborhoodsIn(e.target.value)[0]?.slug ?? ""); }}>{CITIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></div>
              <div><label className="label" htmlFor="n">Neighborhood</label><select id="n" className="field" value={d.neighborhood} onChange={(e) => set("neighborhood", e.target.value)}>{neighborhoodsIn(d.city).map((n) => <option key={n.slug} value={n.slug}>{n.name}</option>)}</select></div>
              <p className="text-[13px] text-ink-3 sm:col-span-2">Exact address and map pin are shared with buyers only after you approve a viewing.</p>
            </div>}
            {step === 2 && <div>
              <label htmlFor="ph" className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line-strong bg-canvas px-6 py-10 text-center hover:border-palm-600">
                <ImagePlus size={26} className="text-palm-700" /><span className="font-semibold">Add photos</span><span className="text-[13px] text-ink-3">Exterior, interiors and floor plan. JPG or PNG. Photos stay in your browser in this demo.</span>
                <input id="ph" type="file" accept="image/*" multiple className="sr-only" onChange={(e) => onPhotos(e.target.files)} />
              </label>
              {d.photos.length > 0 && <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">{d.photos.map((p, i) => (
                <li key={p.url} className="relative aspect-[4/3] overflow-hidden rounded-xl bg-canvas">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.url} alt={p.name} className="h-full w-full object-cover" />
                  {i === 0 && <Badge tone="glass" className="absolute start-2 top-2">Cover</Badge>}
                  <button type="button" aria-label={`Remove ${p.name}`} onClick={() => set("photos", d.photos.filter((x) => x.url !== p.url))} className="absolute end-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-white/90"><X size={14} /></button>
                </li>))}</ul>}
            </div>}
            {step === 3 && <div className="flex flex-wrap gap-2">{(Object.keys(FEATURE_LABEL) as Feature[]).map((f) => (
              <Chip key={f} active={d.features.includes(f)} onClick={() => set("features", d.features.includes(f) ? d.features.filter((x) => x !== f) : [...d.features, f])}>{FEATURE_LABEL[f]}</Chip>))}</div>}
            {step === 4 && <>
              <div><label className="label" htmlFor="pr">{d.purpose === "rent" ? "Annual rent (SAR)" : "Asking price (SAR)"}</label><input id="pr" type="number" className="field num" value={d.price} onChange={(e) => set("price", +e.target.value)} /></div>
              {nb && <p className="rounded-xl bg-canvas p-4 text-[13.5px] text-ink-2">Your price works out to <b className="num">{formatSAR(Math.round(d.price / Math.max(1, d.area)))}/sqm</b>. The demo reference for {nb.name} is <b className="num">{formatNumber(nb.demoPricePerSqm[0])}–{formatNumber(nb.demoPricePerSqm[1])} SAR/sqm</b> <Badge tone="gold" className="ms-1">Demo Estimate</Badge></p>}
            </>}
            {step === 5 && <>
              <p className="text-[13.5px] text-ink-3">Saudi regulations require a valid advertising licence on every listing. Riyah shows the verified badge only when licence data is present and checked.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="label" htmlFor="fal">FAL licence number</label><input id="fal" className="field num" inputMode="numeric" value={d.fal} onChange={(e) => set("fal", e.target.value.replace(/\D/g, ""))} /></div>
                <div><label className="label" htmlFor="adl">Advertising licence number</label><input id="adl" className="field num" inputMode="numeric" maxLength={10} value={d.adLicence} onChange={(e) => set("adLicence", e.target.value.replace(/\D/g, ""))} /></div>
              </div>
              <Badge tone="outline" size="md">Status after submission: Pending verification</Badge>
            </>}
            {step === 6 && <div className="overflow-hidden rounded-2xl border border-line">
              <div className="grid aspect-[16/7] place-items-center bg-canvas">{d.photos[0] ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={d.photos[0].url} alt="" className="h-full w-full object-cover" /> : <span className="text-[13px] text-ink-4">No photos added</span>}</div>
              <div className="p-5">
                <p className="num text-[22px] font-bold">{formatSAR(d.price)}{d.purpose === "rent" && <span className="text-[14px] font-medium text-ink-3"> / year</span>}</p>
                <p className="mt-1 font-semibold">{d.title || "Untitled listing"}</p>
                <p className="text-[13.5px] text-ink-3">{nb?.name}, {getCity(d.city)?.name} · {d.bedrooms} bed · {d.bathrooms} bath · {formatNumber(d.area)} sqm</p>
                <p className="mt-3 text-[14px] text-ink-2">{d.description || "No description yet — use Generate Listing Description."}</p>
                {d.tags.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{d.tags.map((t) => <Badge key={t}>{t}</Badge>)}</div>}
              </div>
            </div>}
            {step === 7 && <div className="space-y-3 text-[14px]">
              {[["Details", d.title.length >= 8], ["Photos", d.photos.length > 0], ["Description", (d.description ?? "").length > 40], ["Advertising licence", /^\d{10}$/.test(d.adLicence)]].map(([k, ok]) => (
                <p key={String(k)} className="flex items-center gap-2"><span className={cn("grid h-5 w-5 place-items-center rounded-full", ok ? "bg-palm-700 text-white" : "bg-ink/10 text-ink-3")}>{ok ? <Check size={12} /> : "–"}</span>{k}{!ok && <span className="text-ink-4">(recommended)</span>}</p>))}
              <Button size="lg" className="mt-2" onClick={() => { setPublished(true); toast("Listing submitted for verification", "success"); }}>Publish listing</Button>
            </div>}
          </div>
          <div className="mt-8 flex justify-between border-t border-line pt-5">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}><ArrowLeft size={15} className="rtl:rotate-180" />Back</Button>
            {step < STEPS.length - 1 && <Button onClick={next}>Continue<ArrowRight size={15} className="rtl:rotate-180" /></Button>}
          </div>
        </section>

        <aside className="space-y-4" aria-label="AI listing tools">
          <div className="surface p-5">
            <p className="flex items-center gap-2 font-bold"><Sparkles size={16} className="text-gold-600" />AI listing tools</p>
            <p className="mt-1 text-[12.5px] text-ink-3">Runs on the mock provider. Review every suggestion before publishing.</p>
            <div className="mt-4 grid gap-2">
              <Button variant="secondary" className="justify-start" onClick={() => ai("generate")} disabled={!!busy}>{busy === "generate" ? <Loader2 size={15} className="animate-spin" /> : <Wand2 size={15} />}Generate Listing Description</Button>
              <Button variant="secondary" className="justify-start" onClick={() => ai("improve")} disabled={!!busy}>{busy === "improve" ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}Improve Listing</Button>
              <Button variant="secondary" className="justify-start" onClick={() => ai("tags")} disabled={!!busy}>{busy === "tags" ? <Loader2 size={15} className="animate-spin" /> : <Tags size={15} />}Suggest Tags</Button>
            </div>
            <label className="label mt-4" htmlFor="desc">Description</label>
            <textarea id="desc" rows={6} className="field h-auto py-3 text-[13.5px]" value={d.description ?? ""} onChange={(e) => set("description", e.target.value)} />
            {changes.length > 0 && <ul className="mt-2 space-y-1 text-[12.5px] text-ink-3">{changes.map((c) => <li key={c}>• {c}</li>)}</ul>}
            {d.tags.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{d.tags.map((t) => <Badge key={t} tone="palm">{t}</Badge>)}</div>}
          </div>
          <div className="surface p-5">
            <p className="flex items-center gap-2 font-bold"><MessageCircleQuestion size={16} className="text-palm-700" />Answer Buyer Questions</p>
            <label className="label mt-3" htmlFor="bq">Sample buyer question</label>
            <input id="bq" className="field" value={qa.q} onChange={(e) => setQa({ q: e.target.value, a: "" })} />
            <Button size="sm" variant="soft" className="mt-2" onClick={() => ai("answer")} disabled={!!busy}>{busy === "answer" && <Loader2 size={14} className="animate-spin" />}Draft answer</Button>
            {qa.a && <p className="mt-3 rounded-xl bg-canvas p-3 text-[13.5px]">{qa.a}</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}
