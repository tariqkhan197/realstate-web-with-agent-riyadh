// Client-safe helpers that turn structured criteria into human-readable text.
import { getNeighborhood, REGION_LABEL, getCity } from "@/data/locations";
import { FEATURE_LABEL, TYPE_LABEL } from "@/data/properties";
import { formatSAR } from "@/lib/utils";
import type { SearchCriteria } from "@/types";

const GOAL_LABEL = { "first-home": "First home", "family-home": "Family-oriented", investment: "Investment", rental: "Rental", luxury: "Luxury" } as const;

export function describeCriteria(c: SearchCriteria): { label: string; value: string }[] {
  const out: { label: string; value: string }[] = [];
  const loc = c.neighborhoods?.length
    ? c.neighborhoods.map((s) => getNeighborhood(s)?.name).join(", ")
    : c.region ? `${REGION_LABEL[c.region]} ${getCity(c.city ?? "riyadh")?.name}` : c.city ? getCity(c.city)?.name : undefined;
  if (loc) out.push({ label: "Location", value: loc });
  if (c.types?.length) out.push({ label: "Type", value: c.types.map((t) => TYPE_LABEL[t]).join(" / ") });
  if (c.minBeds) out.push({ label: "Bedrooms", value: `${c.minBeds}+ bedrooms` });
  if (c.minPrice && c.maxPrice) out.push({ label: "Budget", value: `${formatSAR(c.minPrice, { compact: true })}–${formatSAR(c.maxPrice, { compact: true })}` });
  else if (c.maxPrice) out.push({ label: "Budget", value: `Up to ${formatSAR(c.maxPrice)}` });
  if (c.minArea) out.push({ label: "Area", value: `${c.minArea}+ sqm` });
  if (c.features?.length) out.push({ label: "Must have", value: c.features.map((f) => FEATURE_LABEL[f]).join(", ") });
  if (c.furnishing) out.push({ label: "Furnishing", value: c.furnishing });
  if (c.completion) out.push({ label: "Completion", value: c.completion === "ready" ? "Ready" : "Off-plan" });
  if (c.goal) out.push({ label: "Goal", value: GOAL_LABEL[c.goal] });
  if (c.purpose === "rent") out.push({ label: "Purpose", value: "For rent" });
  return out;
}


/** Natural-language query the agent can re-run, e.g. "4+ bedroom apartment in West Riyadh under SAR 800K". */
export function criteriaToQuery(c: SearchCriteria): string {
  const loc = c.neighborhoods?.length ? getNeighborhood(c.neighborhoods[0])?.name
    : c.region ? `${REGION_LABEL[c.region]} ${getCity(c.city ?? "riyadh")?.name}` : c.city ? getCity(c.city)?.name : "Saudi Arabia";
  const type = c.types?.length ? TYPE_LABEL[c.types[0]].toLowerCase() : "property";
  const beds = c.minBeds ? `${c.minBeds}-bedroom ` : "";
  const budget = c.maxPrice ? ` under ${formatSAR(c.maxPrice, { compact: true })}` : "";
  const feats = c.features?.length ? ` with ${c.features.map((f) => FEATURE_LABEL[f].toLowerCase()).join(" and ")}` : "";
  return `${beds}${type} ${c.purpose === "rent" ? "for rent" : "for sale"} in ${loc}${budget}${feats}`.replace(/^./, (x) => x.toUpperCase());
}
