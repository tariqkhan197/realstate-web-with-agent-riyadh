// Investment analysis. Every output is an ESTIMATE built from demo assumptions
// (neighbourhood yield bands in data/locations.ts) — not verified market data.
import { getNeighborhood } from "@/data/locations";
import type { Property } from "@/types";
import { defaultMortgageFor } from "./mortgage";

export const INVESTMENT_DISCLAIMER =
  "These figures are estimates for demonstration purposes and should not be treated as financial advice or verified market data.";

export interface Scenario { key: "low" | "base" | "high"; label: string; grossYield: number; annualRent: number; netIncome: number; netYield: number }
export interface InvestmentAnalysis {
  propertyId: string; price: number; monthlyPayment: number; annualCosts: number;
  costBreakdown: { label: string; amount: number }[];
  scenarios: Scenario[]; horizon: string; considerations: string[]; assumptions: string[];
}

export function analyzeInvestment(p: Property): InvestmentAnalysis {
  const nb = getNeighborhood(p.neighborhood);
  const [lo, base, hi] = nb?.demoYield ?? [4.5, 5.5, 6.5];
  // For rental listings, derive an implied value so yields stay meaningful.
  const price = p.purpose === "rent" ? p.price / (base / 100) : p.price;
  const maintenance = price * 0.008;
  const service = p.area * 12;
  const costFor = (rent: number) => maintenance + service + rent * 0.083 + rent * 0.05; // + vacancy (1 month) + management 5%
  const scenario = (key: Scenario["key"], label: string, y: number): Scenario => {
    const annualRent = price * y / 100; const netIncome = annualRent - costFor(annualRent);
    return { key, label, grossYield: y, annualRent, netIncome, netYield: (netIncome / price) * 100 };
  };
  const scenarios = [scenario("low", "Low scenario", lo), scenario("base", "Base scenario", base), scenario("high", "High scenario", hi)];
  const baseRent = scenarios[1].annualRent;
  const considerations = [
    p.completion === "off-plan" ? "Off-plan: confirm the developer's Wafi registration, handover date and payment milestones." : "Ready unit: rental income could start soon after purchase.",
    p.age === "new" ? "New building: check the developer warranty and the owners' association (service charge) arrangements." : "Older building: budget for refurbishment and inspect building services.",
    p.bedrooms >= 4 ? "4+ bedrooms tends to suit family tenants, who often stay longer (demo assumption)." : "Smaller units may rent faster to singles and couples but see more turnover (demo assumption).",
    "Check applicable real estate transaction tax, brokerage fees and financing eligibility with licensed professionals.",
    p.licensing.regaVerified ? "Advertising licence is shown on the listing; still confirm title deed and licence status independently." : "No advertising licence shown — verify before engaging.",
  ];
  return {
    propertyId: p.id, price, monthlyPayment: defaultMortgageFor(price).monthlyPayment,
    annualCosts: costFor(baseRent),
    costBreakdown: [
      { label: "Maintenance reserve (0.8% of price)", amount: maintenance },
      { label: "Service charges (SAR 12 / sqm)", amount: service },
      { label: "Vacancy allowance (1 month)", amount: baseRent * 0.083 },
      { label: "Management (5% of rent)", amount: baseRent * 0.05 },
    ],
    scenarios,
    horizon: p.completion === "off-plan" ? "7–10 years (includes construction period)" : "5–10 years",
    considerations,
    assumptions: [
      `Gross yield band ${lo}–${hi}% for ${nb?.name ?? "this area"} is a demo assumption.`,
      "Financing: 10% down payment, 15 years, 5.0% demo profit rate.",
      "Costs exclude purchase fees and taxes.",
    ],
  };
}
