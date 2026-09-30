"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Columns3, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PropertyThumb } from "@/components/property/PropertyImage";
import { useApp } from "@/lib/store";
import { getProperties } from "@/services/propertySearch";

export function CompareTray() {
  const { compare, toggleCompare, clearCompare, hydrated } = useApp();
  const path = usePathname();
  if (!hydrated || !compare.length || /^\/(compare|agent|dashboard|admin)/.test(path)) return null;
  const ps = getProperties(compare);
  return (
    <div className="fixed inset-x-3 bottom-20 z-40 mx-auto max-w-2xl rounded-2xl border border-line bg-white p-3 shadow-lift animate-fade-in lg:bottom-6">
      <div className="flex items-center gap-3">
        <div className="flex flex-1 items-center gap-2 overflow-x-auto scrollbar-none">
          {ps.map((p) => (
            <div key={p.id} className="relative shrink-0">
              <PropertyThumb property={p} className="h-12 w-16 rounded-lg" />
              <button type="button" onClick={() => toggleCompare(p.id)} aria-label={`Remove ${p.title} from comparison`} className="absolute -end-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-ink text-white"><X size={11} /></button>
            </div>
          ))}
          <span className="ms-1 whitespace-nowrap text-[13px] text-ink-3">{ps.length}/4 selected</span>
        </div>
        <Button variant="ghost" size="sm" onClick={clearCompare}>Clear</Button>
        <Button asChild size="sm" disabled={ps.length < 2}><Link href="/compare" aria-disabled={ps.length < 2}><Columns3 size={15} />Compare {ps.length >= 2 ? ps.length : ""}</Link></Button>
      </div>
    </div>
  );
}
