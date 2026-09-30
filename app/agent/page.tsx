import type { Metadata } from "next";
import { Suspense } from "react";
import { AgentWorkspace } from "@/features/agent/AgentWorkspace";

export const metadata: Metadata = {
  title: "AI Real Estate Agent",
  description: "Tell Raed, Riyah's AI real estate agent, what you need. It searches listings, ranks matches, compares options, estimates financing and builds your shortlist.",
};

export default function AgentPage() {
  return <Suspense fallback={<div className="h-[calc(100dvh-8rem)] animate-pulse bg-canvas lg:h-[calc(100dvh-4rem)]" />}><AgentWorkspace /></Suspense>;
}
