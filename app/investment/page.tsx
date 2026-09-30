import type { Metadata } from "next";
import { Suspense } from "react";
import { InvestmentExplorer } from "@/features/investment/InvestmentExplorer";

export const metadata: Metadata = { title: "Investment Intelligence", description: "Estimate rental potential, gross and net yield, annual costs and financing for Saudi properties — with low, base and high scenarios." };

export default function InvestmentPage() {
  return <div className="mx-auto max-w-[1360px] px-5 pb-28 pt-10 lg:px-8">
    <p className="text-[12px] font-bold uppercase tracking-[.14em] text-gold-700">Investment intelligence</p>
    <h1 className="mt-2 text-display">Yield, costs and financing — in one view</h1>
    <p className="mt-2 max-w-2xl text-ink-3">Scenario-based estimates built from transparent demo assumptions. Not financial advice or verified market data.</p>
    <div className="mt-8"><Suspense><InvestmentExplorer /></Suspense></div>
  </div>;
}
