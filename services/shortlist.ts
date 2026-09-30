// Shortlist creation: scope → filter (with small budget stretch) → rank.
import type { MatchResult, SearchCriteria } from "@/types";
import { filterProperties, searchProperties } from "./propertySearch";
import { rankProperties } from "./matching";

export interface Shortlist { criteria: SearchCriteria; scoped: number; found: number; strong: number; results: MatchResult[] }

export function createShortlist(c: SearchCriteria, limit = 6): Shortlist {
  const scope = searchProperties({ purpose: c.purpose ?? "sale", city: c.city, region: c.region, neighborhoods: c.neighborhoods, types: c.types });
  const loose = filterProperties(scope, {
    ...c, maxPrice: c.maxPrice ? Math.round(c.maxPrice * 1.1) : undefined,
    minBeds: c.minBeds ? c.minBeds - 1 : undefined, types: undefined,
  });
  const ranked = rankProperties(loose, c);
  const isStrong = (m: MatchResult) =>
    m.percent >= 85 && (!c.maxPrice || m.property.price <= c.maxPrice) && (!c.minBeds || m.property.bedrooms >= c.minBeds);
  return { criteria: c, scoped: scope.length, found: ranked.length, strong: ranked.filter(isStrong).length, results: ranked.slice(0, limit) };
}
