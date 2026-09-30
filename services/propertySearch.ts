// Property search service. Operates on local demo data; swap the data source for a
// database/API by replacing `source()` — the function signatures stay the same.
import { PROPERTIES } from "@/data/properties";
import { getNeighborhood } from "@/data/locations";
import type { Property, PropertyType, SearchCriteria } from "@/types";

const source = (): Property[] => PROPERTIES;

/** Broad scope: purpose, location and property type. */
export function searchProperties(c: SearchCriteria = {}): Property[] {
  return source().filter((p) => {
    if (c.purpose && p.purpose !== c.purpose) return false;
    if (c.city && p.city !== c.city) return false;
    if (c.neighborhoods?.length) {
      if (!c.neighborhoods.includes(p.neighborhood)) return false;
    } else if (c.region) {
      if (getNeighborhood(p.neighborhood)?.region !== c.region) return false;
    }
    if (c.types?.length && !c.types.includes(p.type)) return false;
    if (c.query) {
      const q = c.query.toLowerCase();
      const hay = `${p.title} ${getNeighborhood(p.neighborhood)?.name} ${p.city} ${p.type}`.toLowerCase();
      if (!q.split(/\s+/).every((w) => hay.includes(w))) return false;
    }
    return true;
  });
}

/** Precise filters: price, rooms, area and amenities. */
export function filterProperties(list: Property[], c: SearchCriteria = {}): Property[] {
  return list.filter((p) => {
    if (c.minPrice != null && p.price < c.minPrice) return false;
    if (c.maxPrice != null && p.price > c.maxPrice) return false;
    if (c.minBeds != null && p.bedrooms < c.minBeds) return false;
    if (c.maxBeds != null && p.bedrooms > c.maxBeds) return false;
    if (c.minBaths != null && p.bathrooms < c.minBaths) return false;
    if (c.minArea != null && p.area < c.minArea) return false;
    if (c.maxArea != null && p.area > c.maxArea) return false;
    if (c.furnishing && p.furnishing !== c.furnishing) return false;
    if (c.completion && p.completion !== c.completion) return false;
    if (c.newOnly && p.age !== "new") return false;
    if (c.verifiedOnly && !p.licensing.regaVerified) return false;
    if (c.features?.length && !c.features.every((f) => p.features.includes(f))) return false;
    return true;
  });
}

export function sortProperties(list: Property[], sort: SearchCriteria["sort"] = "relevance"): Property[] {
  const l = [...list];
  switch (sort) {
    case "price-asc": return l.sort((a, b) => a.price - b.price);
    case "price-desc": return l.sort((a, b) => b.price - a.price);
    case "area-desc": return l.sort((a, b) => b.area - a.area);
    case "newest": return l.sort((a, b) => b.addedOn.localeCompare(a.addedOn));
    default: return l.sort((a, b) => Number(!!b.isPrimaryDemo) - Number(!!a.isPrimaryDemo) || b.addedOn.localeCompare(a.addedOn));
  }
}

export const allProperties = () => source();
export const getPropertyBySlug = (slug: string) => source().find((p) => p.slug === slug || p.id === slug);
export const getPropertyById = (id: string) => source().find((p) => p.id === id);
export const getProperties = (ids: string[]) => ids.map(getPropertyById).filter(Boolean) as Property[];

const FAMILY: Record<PropertyType, PropertyType[]> = {
  apartment: ["apartment", "floor", "duplex", "penthouse"], floor: ["floor", "apartment", "duplex"],
  duplex: ["duplex", "floor", "apartment", "townhouse"], penthouse: ["penthouse", "apartment", "duplex"],
  villa: ["villa", "townhouse"], townhouse: ["townhouse", "villa", "duplex"], land: ["land"],
};

/** Similar = same purpose & related type, scored by region, price and size proximity. */
export function findSimilarProperties(p: Property, limit = 4): Property[] {
  const region = getNeighborhood(p.neighborhood)?.region;
  return source()
    .filter((o) => o.id !== p.id && o.purpose === p.purpose && FAMILY[p.type].includes(o.type) && o.city === p.city)
    .map((o) => {
      const priceGap = Math.abs(o.price - p.price) / p.price;
      const areaGap = Math.abs(o.area - p.area) / Math.max(p.area, 1);
      const score = (getNeighborhood(o.neighborhood)?.region === region ? 0 : 0.4) + priceGap + areaGap * 0.6 + Math.abs(o.bedrooms - p.bedrooms) * 0.15;
      return { o, score };
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, limit)
    .map((x) => x.o);
}
