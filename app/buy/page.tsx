import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchExperience } from "@/features/search/SearchExperience";

export const metadata: Metadata = { title: "Properties for sale in Saudi Arabia", description: "Search apartments, villas, townhouses and land for sale across Riyadh, Jeddah, Dammam, Khobar, Makkah and Madinah." };

export default function BuyPage() {
  return <Suspense><SearchExperience purpose="sale" /></Suspense>;
}
