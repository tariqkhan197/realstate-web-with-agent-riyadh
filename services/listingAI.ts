// Seller-side AI tools (mock). Replace the bodies with LLM calls via lib/ai/providers.
import { FEATURE_LABEL, TYPE_LABEL } from "@/data/properties";
import { getNeighborhood } from "@/data/locations";
import type { Feature, PropertyType } from "@/types";

export interface DraftListing { type: PropertyType; purpose: "sale" | "rent"; neighborhood: string; bedrooms: number; bathrooms: number; area: number; price: number; features: Feature[]; description?: string }

export function generateListingDescription(d: DraftListing): string {
  const nb = getNeighborhood(d.neighborhood)?.name ?? "Riyadh";
  const feats = d.features.slice(0, 4).map((f) => FEATURE_LABEL[f].toLowerCase());
  return `${d.bedrooms}-bedroom ${TYPE_LABEL[d.type].toLowerCase()} for ${d.purpose === "rent" ? "annual rent" : "sale"} in ${nb}, offering ${d.area} sqm of living space with ${d.bathrooms} bathrooms. ` +
    (feats.length ? `Highlights include ${feats.join(", ")}. ` : "") +
    `Well suited to ${d.bedrooms >= 4 ? "families looking for room to grow" : "couples and professionals"}, with easy access to local schools, mosques and daily amenities.`;
}

export function improveListing(text: string): { text: string; changes: string[] } {
  const changes: string[] = [];
  let t = text.trim().replace(/\s+/g, " ");
  if (!/sqm|m²/.test(t)) changes.push("Add the exact area in sqm — buyers filter by size.");
  if (!/licen/i.test(t)) changes.push("Mention that the advertising licence is displayed on the listing.");
  if (t.length < 160) changes.push("Expand with layout details (majlis, family living, maid room).");
  t = t.replace(/\bwithout a mediator\b/i, "with no broker involved").replace(/!{2,}/g, "!");
  if (t && !/[.!?]$/.test(t)) t += ".";
  changes.push("Tightened phrasing and removed repetition.");
  return { text: t, changes };
}

export function suggestTags(d: DraftListing): string[] {
  const t = [TYPE_LABEL[d.type], getNeighborhood(d.neighborhood)?.name ?? "", `${d.bedrooms} bedrooms`];
  if (d.bedrooms >= 4) t.push("Family home");
  if (d.features.includes("maid-room")) t.push("Maid room");
  if (d.features.includes("pool")) t.push("Private pool");
  if (d.price < 800000 && d.purpose === "sale") t.push("First home");
  return t.filter(Boolean);
}

export function answerBuyerQuestion(q: string, d: DraftListing): string {
  const s = q.toLowerCase();
  if (/park/.test(s)) return d.features.includes("parking") ? "Yes — the unit includes dedicated parking." : "Parking is not listed; please confirm with the seller.";
  if (/negotia|discount|price/.test(s)) return "The price is open to reasonable offers from serious buyers. Please share your offer through Riyah and I'll pass it on.";
  if (/maid/.test(s)) return d.features.includes("maid-room") ? "Yes, there is a separate maid room." : "There is no dedicated maid room.";
  return "Thanks for your question — I'll confirm the details and get back to you shortly.";
}
