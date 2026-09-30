// Objective side-by-side comparison. It highlights differences per row
// (e.g. "lowest price") — it never declares an overall winner.
import { getNeighborhood } from "@/data/locations";
import { FEATURE_LABEL, TYPE_LABEL } from "@/data/properties";
import type { Feature, Property, SearchCriteria } from "@/types";
import { formatNumber, formatSAR, pricePerSqm } from "@/lib/utils";
import { defaultMortgageFor } from "./mortgage";
import { analyzeInvestment } from "./investment";
import { scoreProperty } from "./matching";
import { getProperties } from "./propertySearch";

export interface CompareCell { value: string; note?: string }
export interface CompareRow { key: string; label: string; group: string; cells: CompareCell[] }
export interface Comparison { properties: Property[]; rows: CompareRow[]; differences: string[] }

function tagExtremes(nums: number[], lowNote: string, highNote?: string): (string | undefined)[] {
  if (nums.length < 2 || nums.every((n) => n === nums[0])) return nums.map(() => undefined);
  const min = Math.min(...nums), max = Math.max(...nums);
  return nums.map((n) => (n === min ? lowNote : highNote && n === max ? highNote : undefined));
}

export function compareProperties(ids: string[], criteria?: SearchCriteria): Comparison {
  const ps = getProperties(ids).slice(0, 4);
  const price = ps.map((p) => p.price), psqm = ps.map((p) => pricePerSqm(p.price, p.area));
  const area = ps.map((p) => p.area), pay = ps.map((p) => (p.purpose === "sale" ? defaultMortgageFor(p.price).monthlyPayment : 0));
  const inv = ps.map(analyzeInvestment);
  const allFeatures = Array.from(new Set(ps.flatMap((p) => p.features))) as Feature[];

  const rows: CompareRow[] = [
    { key: "price", label: "Price", group: "Price", cells: ps.map((p, i) => ({ value: formatSAR(p.price) + (p.purpose === "rent" ? " / yr" : ""), note: tagExtremes(price, "Lowest price", "Highest price")[i] })) },
    { key: "psqm", label: "Price per sqm", group: "Price", cells: ps.map((_, i) => ({ value: `SAR ${formatNumber(psqm[i])}`, note: tagExtremes(psqm, "Lowest per sqm")[i] })) },
    { key: "pay", label: "Monthly payment (est.)", group: "Price", cells: ps.map((p, i) => ({ value: p.purpose === "sale" ? `${formatSAR(pay[i])} / mo` : "Rental listing", note: p.purpose === "sale" ? "10% down, 15 yrs, 5.0% demo rate" : undefined })) },
    { key: "loc", label: "Location", group: "Property", cells: ps.map((p) => ({ value: `${getNeighborhood(p.neighborhood)?.name}, ${p.city[0].toUpperCase() + p.city.slice(1)}` })) },
    { key: "type", label: "Type", group: "Property", cells: ps.map((p) => ({ value: `${TYPE_LABEL[p.type]} · ${p.completion === "ready" ? "Ready" : "Off-plan"}` })) },
    { key: "area", label: "Area", group: "Property", cells: ps.map((p, i) => ({ value: `${p.area} sqm`, note: tagExtremes(area, "Smallest", "Largest")[i] })) },
    { key: "beds", label: "Bedrooms", group: "Property", cells: ps.map((p) => ({ value: String(p.bedrooms) })) },
    { key: "baths", label: "Bathrooms", group: "Property", cells: ps.map((p) => ({ value: String(p.bathrooms) })) },
    ...allFeatures.map((f) => ({ key: `f-${f}`, label: FEATURE_LABEL[f], group: "Amenities", cells: ps.map((p) => ({ value: p.features.includes(f) ? "Yes" : "—" })) })),
    { key: "ver", label: "Advertising licence", group: "Verification", cells: ps.map((p) => ({ value: p.licensing.regaVerified ? "Shown on listing" : "Not shown" })) },
    { key: "yield", label: "Gross yield (demo estimate)", group: "Investment assumptions", cells: inv.map((a) => ({ value: `${a.scenarios[0].grossYield}–${a.scenarios[2].grossYield}%` })) },
    { key: "net", label: "Net income, base (demo estimate)", group: "Investment assumptions", cells: inv.map((a) => ({ value: `${formatSAR(a.scenarios[1].netIncome, { compact: true })} / yr` })) },
  ];
  if (criteria) {
    const scored = ps.map((p) => scoreProperty(p, criteria));
    if (scored[0]?.factors.length) {
      rows.push({ key: "match", label: "AI match factors", group: "AI match", cells: scored.map((s) => ({ value: `${s.percent}%`, note: s.factors.map((f) => `${f.label} ${Math.round(f.score * 100)}%`).join(" · ") })) });
    }
  }

  const differences: string[] = [];
  if (ps.length >= 2) {
    const minI = price.indexOf(Math.min(...price)), maxI = price.indexOf(Math.max(...price));
    differences.push(`Price spread is ${formatSAR(price[maxI] - price[minI], { compact: true })} between the most and least expensive options.`);
    const aMin = area.indexOf(Math.min(...area)), aMax = area.indexOf(Math.max(...area));
    if (aMin !== aMax) differences.push(`${getNeighborhood(ps[aMax].neighborhood)?.name} offers ${ps[aMax].area - ps[aMin].area} sqm more space than ${getNeighborhood(ps[aMin].neighborhood)?.name}.`);
    const unique = ps.map((p) => p.features.filter((f) => ps.filter((o) => o.features.includes(f)).length === 1));
    unique.forEach((u, i) => u.length && differences.push(`Only ${getNeighborhood(ps[i].neighborhood)?.name} (${formatSAR(ps[i].price, { compact: true })}) lists: ${u.map((f) => FEATURE_LABEL[f].toLowerCase()).join(", ")}.`));
  }
  return { properties: ps, rows, differences };
}
