import type { Metadata } from "next";
import { CompareView } from "@/features/compare/CompareView";

export const metadata: Metadata = { title: "Property Comparison", description: "Compare 2–4 Saudi properties side by side: price, price per sqm, financing, amenities, verification and investment assumptions." };

export default function ComparePage() {
  return <div className="mx-auto max-w-[1360px] px-5 pb-28 pt-10 lg:px-8">
    <p className="text-[12px] font-bold uppercase tracking-[.14em] text-gold-700">Side by side</p>
    <h1 className="mt-2 text-display">Property Comparison</h1>
    <p className="mt-2 max-w-2xl text-ink-3">An objective view of 2–4 properties. We highlight where they differ; you decide what matters.</p>
    <div className="mt-8"><CompareView /></div>
  </div>;
}
