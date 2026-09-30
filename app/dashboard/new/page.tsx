import type { Metadata } from "next";
import { ListingWizard } from "@/features/dashboard/ListingWizard";
export const metadata: Metadata = { title: "Create listing", robots: { index: false } };
export default function Page() { return <ListingWizard />; }
