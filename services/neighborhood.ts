import { getNeighborhood, NEIGHBORHOODS } from "@/data/locations";
import { PROPERTIES } from "@/data/properties";
import type { Neighborhood } from "@/types";

export interface NeighborhoodInfo {
  neighborhood: Neighborhood; listings: number; forSale: number; forRent: number;
  demoAvgPricePerSqm?: number; priceRange?: [number, number]; aiSummary: string;
}

export function getNeighborhoodInfo(slug: string): NeighborhoodInfo | undefined {
  const nb = getNeighborhood(slug);
  if (!nb) return undefined;
  const ls = PROPERTIES.filter((p) => p.neighborhood === slug);
  const sale = ls.filter((p) => p.purpose === "sale" && p.type !== "land");
  const avg = sale.length ? sale.reduce((a, p) => a + p.price / p.area, 0) / sale.length : undefined;
  const range: [number, number] | undefined = sale.length ? [Math.min(...sale.map((p) => p.price)), Math.max(...sale.map((p) => p.price))] : undefined;
  const aiSummary = `${nb.name} is a ${nb.region}ern ${nb.city === "riyadh" ? "Riyadh" : nb.city} district. ${nb.summary} On Riyah it currently has ${ls.length} demo listing${ls.length === 1 ? "" : "s"}. The demo price band for apartments is SAR ${nb.demoPricePerSqm[0].toLocaleString()}–${nb.demoPricePerSqm[1].toLocaleString()} per sqm — an illustrative assumption, not market data.`;
  return { neighborhood: nb, listings: ls.length, forSale: sale.length, forRent: ls.filter((p) => p.purpose === "rent").length, demoAvgPricePerSqm: avg, priceRange: range, aiSummary };
}

export const allNeighborhoodInfo = () => NEIGHBORHOODS.map((n) => getNeighborhoodInfo(n.slug)!);
