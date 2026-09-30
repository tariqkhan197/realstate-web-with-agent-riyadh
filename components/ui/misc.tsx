"use client";
import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("relative overflow-hidden rounded-xl bg-ink/[.06]", className)} aria-hidden>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
  </div>;
}

export function Card({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("surface", className)} {...p} />;
}

export function SectionHeading({ title, sub, action, className }: { title: string; sub?: string; action?: React.ReactNode; className?: string }) {
  return <div className={cn("mb-6 flex flex-wrap items-end justify-between gap-4", className)}>
    <div><h2 className="text-[clamp(1.6rem,2.6vw,2.2rem)] font-bold leading-tight tracking-[-0.03em]">{title}</h2>{sub && <p className="mt-2 max-w-xl text-ink-3">{sub}</p>}</div>
    {action}
  </div>;
}

export function EmptyState({ icon, title, body, action }: { icon: React.ReactNode; title: string; body: string; action?: React.ReactNode }) {
  return <div className="flex flex-col items-center rounded-2xl border border-dashed border-line-strong bg-white px-6 py-14 text-center">
    <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-palm-50 text-palm-700">{icon}</div>
    <h3 className="text-lg font-bold">{title}</h3>
    <p className="mt-1.5 max-w-sm text-sm text-ink-3">{body}</p>
    {action && <div className="mt-5">{action}</div>}
  </div>;
}

export function Tabs<T extends string>({ value, onChange, items, className, size = "md" }: { value: T; onChange: (v: T) => void; items: { value: T; label: React.ReactNode }[]; className?: string; size?: "sm" | "md" }) {
  return <div role="tablist" className={cn("inline-flex rounded-xl bg-ink/[.05] p-1", className)}>
    {items.map((i) => (
      <button key={i.value} type="button" role="tab" aria-selected={value === i.value} onClick={() => onChange(i.value)}
        className={cn("rounded-lg font-semibold transition-colors", size === "sm" ? "px-3 py-1.5 text-[13px]" : "px-4 py-2 text-sm",
          value === i.value ? "bg-white text-ink shadow-ring" : "text-ink-3 hover:text-ink")}>{i.label}</button>
    ))}
  </div>;
}

export function Chip({ active, className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return <button type="button" aria-pressed={active}
    className={cn("inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-semibold transition-colors",
      active ? "border-palm-900 bg-palm-900 text-white" : "border-line bg-white text-ink-2 hover:border-line-strong", className)} {...p} />;
}

export function Dialog({ open, onClose, title, children, className, wide }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; className?: string; wide?: boolean }) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey); document.body.style.overflow = "hidden";
    ref.current?.focus();
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; prev?.focus(); };
  }, [open, onClose]);
  if (!open) return null;
  return <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
    <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
      className={cn("max-h-[92vh] w-full overflow-auto rounded-t-3xl bg-white shadow-lift outline-none animate-fade-in sm:rounded-3xl", wide ? "sm:max-w-3xl" : "sm:max-w-md", className)}>
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white/95 px-6 py-4 backdrop-blur">
        <h2 className="text-base font-bold">{title}</h2>
        <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg text-ink-3 hover:bg-ink/5" aria-label="Close"><X size={18} /></button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>;
}

export function Stat({ label, value, sub, className }: { label: string; value: React.ReactNode; sub?: React.ReactNode; className?: string }) {
  return <div className={className}><div className="text-[12.5px] font-medium text-ink-3">{label}</div><div className="num mt-1 text-[17px] font-bold tracking-tight">{value}</div>{sub && <div className="mt-0.5 text-xs text-ink-3">{sub}</div>}</div>;
}
