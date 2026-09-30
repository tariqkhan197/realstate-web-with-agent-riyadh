// AI property matching. Match percentages are computed from explicit, weighted
// factors — never random. Each factor explains its own score.
import { getNeighborhood, REGION_LABEL } from "@/data/locations";
import { TYPE_LABEL } from "@/data/properties";
import type { MatchFactor, MatchResult, Property, PropertyType, SearchCriteria } from "@/types";
import { formatSAR } from "@/lib/utils";

const RELATED: Record<PropertyType, PropertyType[]> = {
  apartment: ["floor", "duplex", "penthouse"], floor: ["apartment", "duplex"], duplex: ["floor", "townhouse", "apartment"],
  penthouse: ["apartment", "duplex"], villa: ["townhouse"], townhouse: ["villa", "duplex"], land: [],
};

export function scoreProperty(p: Property, c: SearchCriteria): MatchResult {
  const f: MatchFactor[] = [];
  const nb = getNeighborhood(p.neighborhood);

  if (c.maxPrice) {
    const max = c.maxPrice;
    let s: number, note: string;
    if (p.price <= max) {
      s = p.price < max * 0.55 ? 0.85 : 1;
      note = `${formatSAR(p.price)} is ${formatSAR(max - p.price, { compact: true })} under your ${formatSAR(max, { compact: true })} budget`;
    } else {
      s = Math.max(0, 1 - ((p.price - max) / max) * 5);
      note = `${formatSAR(p.price - max, { compact: true })} over budget`;
    }
    f.push({ key: "budget", label: "Budget", weight: 30, score: s, note });
  }
  if (c.neighborhoods?.length || c.region || c.city) {
    let s = 0, note = "Outside your preferred area";
    if (c.neighborhoods?.includes(p.neighborhood)) { s = 1; note = `In ${nb?.name}`; }
    else if (c.region && nb?.region === c.region && (!c.city || p.city === c.city)) { s = c.neighborhoods?.length ? 0.7 : 1; note = `${REGION_LABEL[nb.region]} ${p.city === "riyadh" ? "Riyadh" : ""} · ${nb.name}`.trim(); }
    else if (c.city && p.city === c.city) { s = c.region || c.neighborhoods?.length ? 0.5 : 1; note = `Same city · ${nb?.name}`; }
    f.push({ key: "location", label: "Location", weight: 25, score: s, note });
  }
  if (c.minBeds) {
    const d = p.bedrooms - c.minBeds;
    f.push({ key: "bedrooms", label: "Bedrooms", weight: 20, score: d >= 0 ? 1 : d === -1 ? 0.5 : 0,
      note: d >= 0 ? `${p.bedrooms} bedrooms (you asked for ${c.minBeds}+)` : `${p.bedrooms} bedrooms — ${-d} fewer than requested` });
  }
  if (c.types?.length) {
    const s = c.types.includes(p.type) ? 1 : c.types.some((t) => RELATED[t].includes(p.type)) ? 0.5 : 0;
    f.push({ key: "type", label: "Property type", weight: 15, score: s, note: s === 1 ? TYPE_LABEL[p.type] : `${TYPE_LABEL[p.type]} (related type)` });
  }
  if (c.goal) {
    let s = 0.5, note = "";
    const has = (x: string) => p.features.includes(x as never);
    switch (c.goal) {
      case "family-home": {
        s = (p.bedrooms >= 4 ? 0.3 : p.bedrooms === 3 ? 0.15 : 0) + (has("maid-room") ? 0.2 : 0) + (has("garden") ? 0.15 : 0)
          + (p.parking > 0 ? 0.15 : 0) + (has("elevator") || has("cctv") || has("security") ? 0.1 : 0) + (p.area >= 130 ? 0.1 : 0);
        const bits = [p.bedrooms >= 4 && `${p.bedrooms} bedrooms`, has("maid-room") && "maid room", has("garden") && "garden", p.parking > 0 && "parking"].filter(Boolean);
        note = bits.length ? `Family features: ${bits.join(", ")}` : "Few family-specific features"; break;
      }
      case "investment": {
        const y = nb?.demoYield[1] ?? 5; s = y >= 6 ? 1 : y >= 5.4 ? 0.8 : 0.6;
        note = `Demo base yield assumption ${y}% for ${nb?.name}`; break;
      }
      case "first-home": {
        s = (p.price <= 800000 ? 0.7 : p.price <= 1200000 ? 0.45 : 0.2) + (p.completion === "ready" ? 0.3 : 0.1);
        note = `${p.completion === "ready" ? "Ready to move in" : "Off-plan"} · ${formatSAR(p.price, { compact: true })}`; break;
      }
      case "rental": { s = p.purpose === "rent" ? 1 : 0.4; note = p.purpose === "rent" ? "Available for annual rent" : "For sale, not rent"; break; }
      case "luxury": {
        s = (["villa", "penthouse"].includes(p.type) ? 0.4 : 0.1) + (has("pool") ? 0.25 : 0) + (p.area >= 300 ? 0.2 : 0) + (has("security") || has("gym") ? 0.15 : 0);
        note = has("pool") ? "Pool and premium specification" : "Standard specification"; break;
      }
    }
    f.push({ key: "goal", label: "Fit for your goal", weight: 10, score: Math.min(1, s), note });
  }
  if (c.features?.length) {
    const got = c.features.filter((x) => p.features.includes(x));
    f.push({ key: "features", label: "Amenities", weight: 10, score: got.length / c.features.length, note: `${got.length} of ${c.features.length} requested amenities` });
  }

  if (c.minBeds && p.bedrooms > 0) {
    const per = p.area / p.bedrooms;
    f.push({ key: "space", label: "Space per bedroom", weight: 10, score: Math.min(1, per / 38),
      note: `${Math.round(per)} sqm per bedroom${per < 32 ? " — rooms may be compact" : ""}` });
  }
  if (f.length) {
    const s = (p.licensing.regaVerified ? 0.6 : 0) + (p.completion === "ready" ? 0.2 : 0.05) + (p.age === "new" ? 0.2 : p.age === "1-5" ? 0.12 : 0.05);
    f.push({ key: "quality", label: "Listing quality", weight: 5, score: s,
      note: `${p.licensing.regaVerified ? "Licence shown" : "No licence shown"} · ${p.completion === "ready" ? "ready" : "off-plan"} · ${p.age === "new" ? "new build" : `${p.age} yrs old`}` });
  }
  const tw = f.reduce((a, x) => a + x.weight, 0);
  const percent = tw ? Math.round((f.reduce((a, x) => a + x.weight * x.score, 0) / tw) * 100) : 0;
  const reasons = f.filter((x) => x.score >= 0.8 && x.key !== "quality").sort((a, b) => b.weight - a.weight).map((x) => x.note);
  return { property: p, percent, factors: f, reasons };
}

export function rankProperties(list: Property[], c: SearchCriteria): MatchResult[] {
  return list.map((p) => scoreProperty(p, c)).sort((a, b) => b.percent - a.percent || a.property.price - b.property.price);
}

export const hasMatchCriteria = (c: SearchCriteria) =>
  !!(c.maxPrice || c.minBeds || c.types?.length || c.neighborhoods?.length || c.region || c.goal || c.features?.length);
