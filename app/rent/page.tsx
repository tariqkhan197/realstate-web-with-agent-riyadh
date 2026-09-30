import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchExperience } from "@/features/search/SearchExperience";

export const metadata: Metadata = { title: "Properties for rent in Saudi Arabia", description: "Find apartments and villas for annual rent across Saudi Arabia." };

export default function RentPage() {
  return <Suspense><SearchExperience purpose="rent" /></Suspense>;
}
