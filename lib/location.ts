import { getNeighborhood, REGION_LABEL, getCity } from "@/data/locations";
import type { Property } from "@/types";

/** Human-readable location lines for a listing. Safe on server and client. */
export function locationLine(p: Property) {
  const nb = getNeighborhood(p.neighborhood);
  const city = getCity(p.city)?.name;
  return { hood: nb?.name ?? "", area: p.city === "riyadh" && nb ? `${REGION_LABEL[nb.region]} Riyadh, Riyadh` : city ?? "" };
}
