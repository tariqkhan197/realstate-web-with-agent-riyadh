import type { Metadata } from "next";
import { SavedView } from "@/features/saved/SavedView";
export const metadata: Metadata = { title: "Saved properties & searches" };
export default function Page() { return <SavedView />; }
