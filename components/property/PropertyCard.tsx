"use client";
import Link from "next/link";
import { Bath, BedDouble, Columns3, Heart, MapPin, MessageSquareText, Ruler } from "lucide-react";
import { locationLine } from "@/lib/location";
import { TYPE_LABEL } from "@/data/properties";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";
import { cn, formatSAR } from "@/lib/utils";
import type { MatchResult, Property } from "@/types";
import { DiscountBadge, MatchBadge, VerificationBadge } from "./Badges";
import { PropertyPhoto, coverOf } from "./PropertyImage";

export { locationLine };

export function Specs({ p, className }: { p: Property; className?: string }) {
  const { t } = useApp();
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink-2", className)}>
      {p.type !== "land" && <li className="flex items-center gap-1.5"><BedDouble size={15} className="text-ink-4" /><span className="num font-semibold text-ink">{p.bedrooms}</span> {t("card.beds")}</li>}
      {p.type !== "land" && <li className="flex items-center gap-1.5"><Bath size={15} className="text-ink-4" /><span className="num font-semibold text-ink">{p.bathrooms}</span> {t("card.baths")}</li>}
      <li className="flex items-center gap-1.5"><Ruler size={15} className="text-ink-4" /><span className="num font-semibold text-ink">{p.area}</span> sqm</li>
    </ul>
  );
}

export function SaveButton({ id, className, label }: { id: string; className?: string; label?: boolean }) {
  const { isSaved, toggleSaved, t, hydrated } = useApp();
  const on = hydrated && isSaved(id);
  return (
    <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSaved(id); }} aria-pressed={on} aria-label={on ? "Remove from saved" : "Save property"}
      className={cn("inline-flex items-center justify-center gap-1.5 rounded-full transition-colors", label ? "h-9 px-3 text-[13px] font-semibold" : "h-9 w-9", on ? "bg-gold-600 text-white" : "bg-white/92 text-ink shadow-ring backdrop-blur-sm hover:bg-white", className)}>
      <Heart size={16} fill={on ? "currentColor" : "none"} />{label && (on ? t("card.saved") : t("card.save"))}
    </button>
  );
}

export function PropertyCard({ property: p, match, className, priority }: { property: Property; match?: MatchResult; className?: string; priority?: boolean }) {
  const { t, toggleCompare, compare, hydrated } = useApp();
  const loc = locationLine(p);
  const inCompare = hydrated && compare.includes(p.id);
  return (
    <article className={cn("group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card transition-shadow hover:shadow-lift", className)}>
      <Link href={`/property/${p.slug}`} className="relative block" aria-label={p.title}>
        <PropertyPhoto image={coverOf(p)} className="aspect-[4/3]" priority={priority} />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5"><VerificationBadge property={p} /><DiscountBadge property={p} /></div>
          <SaveButton id={p.id} />
        </div>
        {match && match.percent > 0 && <MatchBadge percent={match.percent} className="absolute bottom-3 start-3" />}
        {p.images.length > 1 && <span className="num absolute bottom-3 end-3 rounded-full bg-ink/60 px-2 py-1 text-[11px] font-semibold text-white">{p.images.length} photos</span>}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-baseline justify-between gap-2">
          <p className="num text-[20px] font-bold tracking-tight">{formatSAR(p.price)}{p.purpose === "rent" && <span className="text-sm font-semibold text-ink-3"> / yr</span>}</p>
          {p.previousPrice && <p className="num text-[13px] text-ink-4 line-through">{formatSAR(p.previousPrice)}</p>}
        </div>
        <p className="mt-0.5 text-[13px] font-medium text-ink-3">{TYPE_LABEL[p.type]} · {p.purpose === "rent" ? "For rent" : "For sale"} · {p.completion === "ready" ? "Ready" : "Off-plan"}</p>
        <Specs p={p} className="mt-3" />
        <p className="mt-3 flex items-start gap-1.5 text-[13.5px]"><MapPin size={15} className="mt-0.5 shrink-0 text-palm-600" /><span><span className="font-semibold">{loc.hood}</span><span className="text-ink-3"> · {loc.area}</span></span></p>
        {match && match.reasons.length > 0 && (
          <p className="mt-3 line-clamp-2 rounded-xl bg-palm-50 px-3 py-2 text-[12.5px] leading-snug text-palm-900">{match.reasons.slice(0, 2).join(" · ")}</p>
        )}
        <div className="mt-auto flex gap-2 pt-4">
          <Button asChild variant="primary" size="sm" className="flex-1"><Link href={`/property/${p.slug}`}>{t("card.view")}</Link></Button>
          <Button variant={inCompare ? "soft" : "secondary"} size="sm" onClick={() => toggleCompare(p.id)} aria-pressed={inCompare}><Columns3 size={15} />{t("card.compare")}</Button>
          <Button asChild variant="ghost" size="sm" aria-label={`Ask AI about ${p.title}`}><Link href={`/agent?property=${p.id}`}><MessageSquareText size={15} /></Link></Button>
        </div>
      </div>
    </article>
  );
}

export function PropertyCardSkeleton() {
  return <div className="overflow-hidden rounded-2xl border border-line bg-white"><div className="aspect-[4/3] animate-pulse bg-ink/[.05]" /><div className="space-y-3 p-4"><div className="h-6 w-1/2 rounded bg-ink/[.06]" /><div className="h-4 w-2/3 rounded bg-ink/[.05]" /><div className="h-4 w-full rounded bg-ink/[.05]" /><div className="h-9 w-full rounded-lg bg-ink/[.05]" /></div></div>;
}
