"use client";
import * as React from "react";
import Link from "next/link";
import { Bookmark, Clock, Heart, Search, Sparkles, Trash2 } from "lucide-react";
import { useApp } from "@/lib/store";
import { getProperties } from "@/services/propertySearch";
import { PropertyCard, PropertyCardSkeleton } from "@/components/property/PropertyCard";
import { EmptyState, Tabs } from "@/components/ui/misc";
import { Button } from "@/components/ui/button";
import { describeCriteria } from "@/services/aiAgent";
import { formatDate } from "@/lib/utils";
import type { SearchCriteria } from "@/types";

type Tab = "properties" | "searches" | "recent";

function searchHref(c: SearchCriteria) {
  return `${c.purpose === "rent" ? "/rent" : "/buy"}?c=${encodeURIComponent(JSON.stringify(c))}`;
}

export function SavedView() {
  const { saved, searches, recent, removeSearch, hydrated, compare, setCompare } = useApp();
  const [tab, setTab] = React.useState<Tab>("properties");
  const savedProps = getProperties(saved), recentProps = getProperties(recent);
  return (
    <div className="mx-auto max-w-7xl px-5 pb-28 pt-10 lg:px-8">
      <p className="text-[12px] font-bold uppercase tracking-[.14em] text-gold-700">Your collection</p>
      <h1 className="mt-1 text-display">Saved</h1>
      <Tabs className="mt-6" value={tab} onChange={setTab} items={[
        { value: "properties", label: <span className="flex items-center gap-1.5"><Heart size={14} />Saved Properties <span className="num text-ink-4">{hydrated ? saved.length : ""}</span></span> },
        { value: "searches", label: <span className="flex items-center gap-1.5"><Bookmark size={14} />Saved Searches <span className="num text-ink-4">{hydrated ? searches.length : ""}</span></span> },
        { value: "recent", label: <span className="flex items-center gap-1.5"><Clock size={14} />Recently Viewed</span> },
      ]} />
      <div className="mt-8">
        {!hydrated ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }, (_, i) => <PropertyCardSkeleton key={i} />)}</div>
        : tab === "properties" ? (savedProps.length ? <>
            {savedProps.length >= 2 && <div className="mb-5 flex justify-end"><Button variant="secondary" size="sm" onClick={() => setCompare(savedProps.slice(0, 4).map((p) => p.id))}>{compare.length ? "Replace comparison with saved" : "Compare saved"} ({Math.min(4, savedProps.length)})</Button></div>}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{savedProps.map((p) => <PropertyCard key={p.id} property={p} />)}</div></>
          : <EmptyState icon={<Heart size={22} />} title="No saved properties yet" body="Tap the heart on any listing — or ask Raed to save properties from your shortlist." action={<div className="flex gap-2"><Button asChild variant="secondary"><Link href="/buy">Explore properties</Link></Button><Button asChild><Link href="/agent"><Sparkles size={15} />Ask AI Agent</Link></Button></div>} />)
        : tab === "searches" ? (searches.length ? <ul className="grid gap-3 md:grid-cols-2">{searches.map((s) => (
            <li key={s.id} className="surface flex items-center gap-4 p-5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-palm-50 text-palm-700"><Search size={17} /></span>
              <div className="min-w-0 flex-1"><p className="truncate font-semibold">{s.label}</p><p className="truncate text-[13px] text-ink-3">{describeCriteria(s.criteria).map((x) => x.value).join(" · ")} · saved {formatDate(s.createdAt)}</p></div>
              <Button asChild size="sm" variant="soft"><Link href={searchHref(s.criteria)}>Open</Link></Button>
              <Button size="icon" variant="ghost" aria-label={`Delete ${s.label}`} onClick={() => removeSearch(s.id)}><Trash2 size={16} /></Button>
            </li>))}</ul>
          : <EmptyState icon={<Bookmark size={22} />} title="No saved searches" body="Set filters on the search page and choose “Save search” to get back to them quickly." action={<Button asChild variant="secondary"><Link href="/buy">Start a search</Link></Button>} />)
        : (recentProps.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{recentProps.map((p) => <PropertyCard key={p.id} property={p} />)}</div>
          : <EmptyState icon={<Clock size={22} />} title="Nothing viewed yet" body="Properties you open appear here so you can find them again." action={<Button asChild variant="secondary"><Link href="/buy">Explore properties</Link></Button>} />)}
      </div>
    </div>
  );
}
