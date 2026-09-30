"use client";
import * as React from "react";
import { ChevronLeft, ChevronRight, Expand, Images, X } from "lucide-react";
import { PropertyPhoto } from "@/components/property/PropertyImage";
import { cn } from "@/lib/utils";
import type { PropertyImage } from "@/types";

/** Listing gallery: large image, thumbnail rail, counter, prev/next, fullscreen with keyboard support. */
export function Gallery({ images, title, badges }: { images: PropertyImage[]; title: string; badges?: React.ReactNode }) {
  const photos = images;
  const [i, setI] = React.useState(0);
  const [full, setFull] = React.useState(false);
  const n = photos.length;
  const go = React.useCallback((d: number) => setI((x) => (x + d + n) % n), [n]);
  const railRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    railRef.current?.querySelector<HTMLElement>(`[data-idx="${i}"]`)?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [i]);

  React.useEffect(() => {
    if (!full) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFull(false);
      const rtl = document.documentElement.dir === "rtl";
      if (e.key === "ArrowRight") go(rtl ? -1 : 1);
      if (e.key === "ArrowLeft") go(rtl ? 1 : -1);
    };
    document.addEventListener("keydown", onKey); document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [full, go]);

  // swipe
  const touch = React.useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => { touch.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touch.current == null) return; const dx = e.changedTouches[0].clientX - touch.current; touch.current = null;
    if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
  };

  if (!n) return null;
  const cur = photos[i];
  const Nav = ({ dark }: { dark?: boolean }) => <>
    <button type="button" onClick={() => go(-1)} aria-label="Previous image" className={cn("absolute start-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full", dark ? "bg-white/10 text-white hover:bg-white/20" : "bg-white/92 text-ink shadow-card hover:bg-white")}><ChevronLeft size={20} className="rtl:rotate-180" /></button>
    <button type="button" onClick={() => go(1)} aria-label="Next image" className={cn("absolute end-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full", dark ? "bg-white/10 text-white hover:bg-white/20" : "bg-white/92 text-ink shadow-card hover:bg-white")}><ChevronRight size={20} className="rtl:rotate-180" /></button>
  </>;

  return (
    <section aria-label={`${title} photos`}>
      <div className="relative overflow-hidden rounded-3xl bg-ink/5" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <button type="button" className="block w-full" onClick={() => setFull(true)} aria-label="Open fullscreen gallery">
          <PropertyPhoto key={cur.src} image={cur} className="aspect-[16/10] w-full animate-fade-in md:aspect-[16/8.5]" sizes="(max-width:1024px) 100vw, 66vw" priority={i === 0} fit={cur.category === "floor-plan" ? "contain" : "cover"} />
        </button>
        {badges && <div className="pointer-events-none absolute start-4 top-4 flex flex-wrap gap-1.5">{badges}</div>}
        <Nav />
        <div className="absolute bottom-4 end-4 flex items-center gap-2">
          <span className="num rounded-full bg-ink/70 px-3 py-1.5 text-[12.5px] font-semibold text-white" aria-live="polite">{i + 1} / {n}</span>
          <button type="button" onClick={() => setFull(true)} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white/92 px-3 text-[12.5px] font-semibold shadow-ring hover:bg-white"><Expand size={14} />Fullscreen</button>
        </div>
        {cur.caption && <span className="absolute bottom-4 start-4 rounded-full bg-white/92 px-3 py-1.5 text-[12.5px] font-semibold shadow-ring">{cur.caption}</span>}
      </div>

      <div ref={railRef} className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]" role="tablist" aria-label="Gallery thumbnails">
        {photos.map((img, idx) => (
          <button key={img.src} data-idx={idx} type="button" role="tab" aria-selected={idx === i} aria-label={`Show image ${idx + 1}: ${img.caption ?? img.alt}`} onClick={() => setI(idx)}
            className={cn("relative h-[68px] w-[96px] shrink-0 overflow-hidden rounded-xl ring-2 transition", idx === i ? "ring-palm-700" : "ring-transparent opacity-75 hover:opacity-100")}>
            <PropertyPhoto image={img} className="h-full w-full" sizes="96px" />
          </button>
        ))}
      </div>

      {full && (
        <div className="fixed inset-0 z-[95] flex flex-col bg-[#0b0f0e]" role="dialog" aria-modal="true" aria-label="Fullscreen gallery">
          <div className="flex items-center justify-between px-5 py-4 text-white">
            <p className="flex items-center gap-2 text-sm font-semibold"><Images size={16} className="text-gold-400" /><span className="num">{i + 1} / {n}</span><span className="hidden text-white/60 sm:inline">· {cur.caption}</span></p>
            <button type="button" autoFocus onClick={() => setFull(false)} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Close fullscreen"><X size={20} /></button>
          </div>
          <div className="relative flex-1" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <PropertyPhoto key={cur.src} image={cur} className="absolute inset-0 animate-fade-in" sizes="100vw" fit="contain" />
            <Nav dark />
          </div>
          <div className="flex justify-center gap-2 overflow-x-auto px-5 py-4">
            {photos.map((img, idx) => (
              <button key={img.src} type="button" onClick={() => setI(idx)} aria-label={`Show image ${idx + 1}`} className={cn("h-12 w-16 shrink-0 overflow-hidden rounded-lg ring-2", idx === i ? "ring-gold-400" : "ring-transparent opacity-50 hover:opacity-90")}>
                <PropertyPhoto image={img} className="h-full w-full" sizes="64px" />
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
