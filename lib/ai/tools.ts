// Tool registry: JSON-schema definitions (for LLM tool/function calling) and the
// executors that run them against the service layer.
import type { SearchCriteria } from "@/types";
import { filterProperties, findSimilarProperties, getPropertyById, searchProperties } from "@/services/propertySearch";
import { compareProperties } from "@/services/compare";
import { calculateMortgage } from "@/services/mortgage";
import { analyzeInvestment } from "@/services/investment";
import { createShortlist } from "@/services/shortlist";
import { getNeighborhoodInfo } from "@/services/neighborhood";
import type { ToolName } from "./types";

const criteriaSchema = {
  type: "object",
  properties: {
    purpose: { type: "string", enum: ["sale", "rent"] },
    city: { type: "string", enum: ["riyadh", "jeddah", "dammam", "khobar", "makkah", "madinah"] },
    region: { type: "string", enum: ["north", "west", "central", "east", "south"] },
    neighborhoods: { type: "array", items: { type: "string" }, description: "Neighbourhood slugs, e.g. dhahrat-laban" },
    types: { type: "array", items: { type: "string", enum: ["apartment", "villa", "townhouse", "floor", "duplex", "penthouse", "land"] } },
    minPrice: { type: "number" }, maxPrice: { type: "number", description: "SAR" },
    minBeds: { type: "integer" }, minBaths: { type: "integer" }, minArea: { type: "number" },
    features: { type: "array", items: { type: "string" } },
    goal: { type: "string", enum: ["first-home", "family-home", "investment", "rental", "luxury"] },
  },
} as const;

export const TOOL_DEFINITIONS: { name: ToolName; description: string; parameters: object }[] = [
  { name: "searchProperties", description: "Find listings by purpose, location and property type.", parameters: criteriaSchema },
  { name: "filterProperties", description: "Narrow a set of listings by price, rooms, area and amenities.", parameters: { type: "object", properties: { ids: { type: "array", items: { type: "string" } }, criteria: criteriaSchema }, required: ["ids", "criteria"] } },
  { name: "createShortlist", description: "Search, filter and rank listings against the user's requirements; returns match scores with explanations.", parameters: criteriaSchema },
  { name: "compareProperties", description: "Objective side-by-side comparison of 2–4 listings.", parameters: { type: "object", properties: { ids: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 4 } }, required: ["ids"] } },
  { name: "calculateMortgage", description: "Estimate home-finance payments.", parameters: { type: "object", properties: { price: { type: "number" }, downPayment: { type: "number" }, years: { type: "number" }, ratePct: { type: "number" } }, required: ["price", "downPayment", "years", "ratePct"] } },
  { name: "analyzeInvestment", description: "Demo-estimate rental yield scenarios and costs for a listing.", parameters: { type: "object", properties: { propertyId: { type: "string" } }, required: ["propertyId"] } },
  { name: "findSimilarProperties", description: "Find listings similar to a given listing.", parameters: { type: "object", properties: { propertyId: { type: "string" }, limit: { type: "integer" } }, required: ["propertyId"] } },
  { name: "saveProperty", description: "Save a listing to the user's saved list.", parameters: { type: "object", properties: { propertyId: { type: "string" } }, required: ["propertyId"] } },
  { name: "getNeighborhoodInfo", description: "Neighbourhood overview, lifestyle and demo price bands.", parameters: { type: "object", properties: { slug: { type: "string" } }, required: ["slug"] } },
];

/* eslint-disable @typescript-eslint/no-explicit-any */
export const TOOL_EXECUTORS: Record<ToolName, (args: any) => unknown> = {
  searchProperties: (c: SearchCriteria) => searchProperties(c),
  filterProperties: ({ ids, criteria }) => filterProperties(ids.map(getPropertyById).filter(Boolean), criteria),
  createShortlist: (c: SearchCriteria) => createShortlist(c),
  compareProperties: ({ ids, criteria }) => compareProperties(ids, criteria),
  calculateMortgage: (a) => calculateMortgage(a),
  analyzeInvestment: ({ propertyId }) => { const p = getPropertyById(propertyId); return p ? analyzeInvestment(p) : null; },
  findSimilarProperties: ({ propertyId, limit }) => { const p = getPropertyById(propertyId); return p ? findSimilarProperties(p, limit) : []; },
  saveProperty: ({ propertyId }) => ({ saved: true, propertyId }), // persisted client-side by the saved store
  getNeighborhoodInfo: ({ slug }) => getNeighborhoodInfo(slug),
};

export function runTool<T = unknown>(name: ToolName, args: unknown): T {
  return TOOL_EXECUTORS[name](args) as T;
}
