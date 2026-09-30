import type { Metadata } from "next";
import { Suspense } from "react";
import { MapExplorer } from "@/features/map/MapExplorer";

export const metadata: Metadata = { title: "Property Map", description: "Explore Riyadh, Jeddah, Dammam, Khobar, Makkah and Madinah listings on a map with price markers and instant previews." };

export default function MapPage() {
  return <div className="mx-auto max-w-[1360px] px-5 pb-28 pt-10 lg:px-8">
    <p className="text-[12px] font-bold uppercase tracking-[.14em] text-gold-700">Map</p>
    <h1 className="mt-2 text-display">Discover property by place</h1>
    <p className="mt-2 max-w-2xl text-ink-3">Pick a city, then a district. Tap a price marker to preview the listing.</p>
    <div className="mt-8"><Suspense><MapExplorer /></Suspense></div>
  </div>;
}
