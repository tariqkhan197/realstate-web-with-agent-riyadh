import type { Metadata } from "next";
import { MatchWizard } from "@/features/match/MatchWizard";

export const metadata: Metadata = { title: "AI Property Matching", description: "Tell Riyah your budget, location, bedrooms and purpose and get a ranked shortlist with the reasons each property matched." };

export default function MatchPage() {
  return <div className="mx-auto max-w-[1360px] px-5 pb-28 pt-10 lg:px-8">
    <p className="text-[12px] font-bold uppercase tracking-[.14em] text-gold-700">AI Property Matching</p>
    <h1 className="mt-2 text-display">Six questions. One ranked shortlist.</h1>
    <p className="mt-2 max-w-2xl text-ink-3">Every percentage is a weighted score of explicit factors — open any card to see exactly why it matched.</p>
    <div className="mt-8"><MatchWizard /></div>
  </div>;
}
