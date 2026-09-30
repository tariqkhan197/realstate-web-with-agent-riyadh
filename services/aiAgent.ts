// Riyah agent runtime. Provider (mock/LLM) → structured intent → tool execution → reply.
// All tool calls go through lib/ai/tools.ts so they are logged as visible steps.
import { getNeighborhood, REGION_LABEL, getCity } from "@/data/locations";
import { FEATURE_LABEL, TYPE_LABEL } from "@/data/properties";
import { getProvider, mockProvider } from "@/lib/ai";
import { runTool } from "@/lib/ai/tools";
import { describeCriteria } from "@/lib/ai/describe";
import type { AgentBlock, AgentContext, AgentReply, AgentStep, ChatMessage, ParsedIntent, ToolName } from "@/lib/ai/types";
import { formatSAR, uid } from "@/lib/utils";
import type { Property, SearchCriteria } from "@/types";
import type { Comparison } from "./compare";
import type { InvestmentAnalysis } from "./investment";
import { INVESTMENT_DISCLAIMER } from "./investment";
import { DEFAULT_DOWN_PCT, DEFAULT_TERM_YEARS, DEMO_PROFIT_RATE, type MortgageResult } from "./mortgage";
import type { NeighborhoodInfo } from "./neighborhood";
import { getPropertyById } from "./propertySearch";
import { scoreProperty } from "./matching";
import type { Shortlist } from "./shortlist";

export const AGENT = { name: "Raed", title: "Riyah AI Real Estate Agent" };

export { describeCriteria } from "@/lib/ai/describe";

const scopeName = (c: SearchCriteria) =>
  c.neighborhoods?.length ? getNeighborhood(c.neighborhoods[0])?.name : c.region ? `${REGION_LABEL[c.region]} ${getCity(c.city ?? "riyadh")?.name}` : c.city ? getCity(c.city)?.name : "Saudi";

class Trace {
  steps: AgentStep[] = [];
  add(s: Omit<AgentStep, "id">) { this.steps.push({ id: uid(), ...s }); }
  tool<T>(name: ToolName, args: unknown, s: Omit<AgentStep, "id" | "tool">, detail?: (r: T) => string): T {
    const r = runTool<T>(name, args);
    this.steps.push({ id: uid(), tool: name, ...s, detail: detail ? detail(r) : s.detail });
    return r;
  }
}

const shortName = (p: Property) => `${getNeighborhood(p.neighborhood)?.name} · ${formatSAR(p.price, { compact: true })}`;

export async function runAgent(messages: ChatMessage[], context: AgentContext = {}): Promise<AgentReply> {
  const provider = getProvider();
  let parsed: ParsedIntent;
  try { parsed = await provider.interpret(messages, context); }
  catch { parsed = await mockProvider.interpret(messages, context); }

  const tr = new Trace();
  const blocks: AgentBlock[] = [];
  let text = "";
  let suggestions: string[] = [];
  const ctx: AgentContext = { ...context };
  const property = parsed.propertyId ? getPropertyById(parsed.propertyId) : undefined;

  switch (parsed.intent) {
    case "search": {
      const c = parsed.criteria;
      const items = describeCriteria(c);
      tr.add({ tool: "understand", label: "Requirements understood", detail: items.map((i) => i.value).join(" · ") || "Open search", phase: "thinking", status: "Understanding your requirements…" });
      const scoped = tr.tool<Property[]>("searchProperties", { purpose: c.purpose, city: c.city, region: c.region, neighborhoods: c.neighborhoods, types: c.types },
        { label: `Searching ${scopeName(c)} listings`, phase: "searching", status: `Searching ${scopeName(c)} properties…` }, (r) => `${r.length} listings in scope`);
      let pool = scoped;
      if (c.maxPrice || c.minPrice) {
        pool = tr.tool<Property[]>("filterProperties", { ids: pool.map((p) => p.id), criteria: { minPrice: c.minPrice, maxPrice: c.maxPrice ? Math.round(c.maxPrice * 1.1) : undefined } },
          { label: "Filtering by budget", phase: "searching", status: "Filtering by budget…" }, (r) => `${r.length} within or near ${c.maxPrice ? formatSAR(c.maxPrice, { compact: true }) : "your range"}`);
      }
      if (c.minBeds) {
        pool = tr.tool<Property[]>("filterProperties", { ids: pool.map((p) => p.id), criteria: { minBeds: c.minBeds - 1 } },
          { label: "Filtering by bedrooms", phase: "searching", status: "Filtering by bedrooms…" }, (r) => `${r.length} with ${c.minBeds! - 1}+ bedrooms`);
      }
      if (c.features?.length) {
        pool = tr.tool<Property[]>("filterProperties", { ids: pool.map((p) => p.id), criteria: { features: c.features } },
          { label: "Filtering by amenities", phase: "searching", status: "Checking amenities…" }, (r) => `${r.length} with ${c.features!.map((f) => FEATURE_LABEL[f].toLowerCase()).join(", ")}`);
      }
      const sl = tr.tool<Shortlist>("createShortlist", c, { label: "Ranking matching properties", phase: "analyzing", status: `Analyzing ${pool.length} matching listings…` },
        () => `Scored on ${["budget", "location", "bedrooms", "type", "goal", "amenities"].filter((_, i) => [c.maxPrice, c.region || c.neighborhoods || c.city, c.minBeds, c.types, c.goal, c.features][i]).join(", ") || "recency"}`);
      tr.add({ label: "Shortlist ready", detail: `${sl.strong} strong match${sl.strong === 1 ? "" : "es"}`, phase: "completed", status: "Your shortlist is ready." });

      blocks.push({ kind: "criteria", items });
      blocks.push({ kind: "results", scoped: sl.scoped, found: sl.found, strong: sl.strong, results: sl.results, criteria: c });
      ctx.lastCriteria = c; ctx.lastResultIds = sl.results.map((r) => r.property.id);
      ctx.activePropertyId = sl.results[0]?.property.id;

      if (!sl.found) {
        text = `Got it. I searched ${sl.scoped} ${scopeName(c)} listings but none fit all of these requirements.\n\nTry widening the budget, allowing one fewer bedroom, or including nearby districts.`;
        suggestions = ["Widen the budget by 15%", "Include all of Riyadh", "Show 3-bedroom options instead"];
      } else {
        const top = sl.results[0];
        text = `Got it. I'm looking for:\n${items.map((i) => `• ${i.value}`).join("\n")}\n\n${sl.found} propert${sl.found === 1 ? "y" : "ies"} found, ${sl.strong} strong match${sl.strong === 1 ? "" : "es"}. ` +
          `Top of your list is ${shortName(top.property)}, a ${top.percent}% match — ${top.reasons.slice(0, 2).join("; ") || "a good overall fit"}. The full ranked shortlist is below.`;
        suggestions = ["Compare my top 3", "What would my monthly payment be on the first one?", "Show only ones with a maid room", "Analyze the investment potential of #1"];
      }
      break;
    }
    case "compare": {
      const ids = (context.lastResultIds?.length ? context.lastResultIds.slice(0, 3) : []);
      if (property && !ids.includes(property.id)) ids.unshift(property.id);
      if (ids.length < 2 && property) {
        const sim = tr.tool<Property[]>("findSimilarProperties", { propertyId: property.id, limit: 2 },
          { label: "Finding comparable listings", phase: "searching", status: "Finding comparable listings…" }, (r) => `${r.length} comparable listings`);
        ids.push(...sim.map((p) => p.id));
      }
      if (ids.length < 2) { text = "Tell me what you're looking for first and I'll compare the best options for you."; suggestions = ["4-bedroom apartment in West Riyadh under SAR 800K"]; break; }
      const cmp = tr.tool<Comparison>("compareProperties", { ids: ids.slice(0, 4), criteria: context.lastCriteria },
        { label: `Comparing your top ${Math.min(ids.length, 4)} options`, phase: "comparing", status: `Comparing your top ${Math.min(ids.length, 4)} options…` }, (r) => `${r.rows.length} attributes compared`);
      tr.add({ label: "Comparison ready", phase: "completed", status: "Comparison ready." });
      blocks.push({ kind: "comparison", comparison: cmp });
      text = `Here's an objective side-by-side of ${cmp.properties.length} options. I've highlighted differences rather than picking a winner — the right choice depends on what matters most to you.\n\n${cmp.differences.map((d) => `• ${d}`).join("\n")}`;
      suggestions = ["Which has the lowest monthly payment?", "Open the full comparison", "Find similar properties"];
      break;
    }
    case "mortgage": {
      if (!property) { text = "Which property should I calculate financing for? Search first, or open a property and tap Ask AI."; break; }
      const down = parsed.mortgage?.downPct ?? DEFAULT_DOWN_PCT, years = Math.min(30, parsed.mortgage?.years ?? DEFAULT_TERM_YEARS), rate = parsed.mortgage?.ratePct ?? DEMO_PROFIT_RATE;
      const m = tr.tool<MortgageResult>("calculateMortgage", { price: property.price, downPayment: Math.round(property.price * down / 100), years, ratePct: rate },
        { label: "Calculating financing", phase: "analyzing", status: "Calculating your monthly payment…" }, (r) => `${formatSAR(r.loanAmount)} over ${years} years`);
      tr.add({ label: "Estimate ready", phase: "completed", status: "Your estimate is ready." });
      blocks.push({ kind: "mortgage", propertyId: property.id, result: m });
      ctx.activePropertyId = property.id;
      text = `For ${shortName(property)} with ${down}% down (${formatSAR(m.downPayment)}), a ${years}-year term and a ${rate}% demo profit rate, the estimated monthly payment is ${formatSAR(m.monthlyPayment)}.\n\nTotal repaid would be about ${formatSAR(m.totalPayment)}, of which ${formatSAR(m.totalProfit)} is the bank's profit. This is an estimate — actual rates depend on your bank, salary and eligibility.`;
      suggestions = ["What if I put 20% down?", "Try 25 years", "Analyze the investment potential"];
      break;
    }
    case "investment": {
      if (!property) { text = "Open a property or run a search first, and I'll analyze its investment characteristics."; break; }
      const a = tr.tool<InvestmentAnalysis>("analyzeInvestment", { propertyId: property.id },
        { label: "Estimating rental scenarios", phase: "analyzing", status: "Analyzing investment characteristics…" }, (r) => `${r.scenarios[0].grossYield}–${r.scenarios[2].grossYield}% gross yield (demo)`);
      tr.add({ label: "Analysis ready", phase: "completed", status: "Analysis ready." });
      blocks.push({ kind: "investment", propertyId: property.id, analysis: a });
      ctx.activePropertyId = property.id;
      const b = a.scenarios[1];
      text = `AI estimate for ${shortName(property)}: in the base scenario, annual rent of about ${formatSAR(b.annualRent)} implies a ${b.grossYield}% gross yield, or roughly ${b.netYield.toFixed(1)}% after estimated running costs.\n\n${INVESTMENT_DISCLAIMER}`;
      suggestions = ["What are the main things I should consider?", "Compare this with other apartments", "Monthly payment with 20% down"];
      break;
    }
    case "similar": {
      if (!property) { text = "Which property should I find alternatives to?"; break; }
      const sim = tr.tool<Property[]>("findSimilarProperties", { propertyId: property.id, limit: 4 },
        { label: "Finding similar listings", phase: "searching", status: "Finding similar properties…" }, (r) => `${r.length} similar listings`);
      const nb = getNeighborhood(property.neighborhood);
      const c: SearchCriteria = { city: property.city, region: nb?.region, types: [property.type], minBeds: property.bedrooms, maxPrice: Math.round(property.price * 1.1), purpose: property.purpose };
      const results = sim.map((p) => scoreProperty(p, c)).sort((x, y) => y.percent - x.percent);
      tr.add({ tool: "rank", label: "Ranking by similarity", detail: "Region, price, size and bedrooms", phase: "analyzing", status: "Ranking alternatives…" });
      tr.add({ label: "Alternatives ready", phase: "completed", status: "Alternatives ready." });
      blocks.push({ kind: "results", scoped: sim.length, found: sim.length, strong: results.filter((r) => r.percent >= 85).length, results, criteria: c, title: `Similar to ${shortName(property)}` });
      ctx.lastResultIds = results.map((r) => r.property.id); ctx.lastCriteria = c;
      text = `Here are ${results.length} alternatives to ${shortName(property)}, matched on region, price, size and bedrooms.`;
      suggestions = ["Compare these", "Which is closest in price per sqm?", "Show me the first one's monthly payment"];
      break;
    }
    case "neighborhood": {
      const slug = parsed.criteria.neighborhoods?.[0] ?? (property?.neighborhood);
      const info = slug ? tr.tool<NeighborhoodInfo | undefined>("getNeighborhoodInfo", { slug }, { label: "Loading neighbourhood profile", phase: "analyzing", status: "Reading the neighbourhood profile…" }, (r) => `${r?.listings ?? 0} demo listings`) : undefined;
      tr.add({ label: "Profile ready", phase: "completed", status: "Profile ready." });
      if (!info) { text = "Tell me which neighbourhood you're curious about — for example Al Malqa or Dhahrat Laban."; break; }
      blocks.push({ kind: "neighborhood", info });
      text = info.aiSummary;
      suggestions = [`Show apartments in ${info.neighborhood.name}`, `Villas in ${info.neighborhood.name}`, "Compare with Al Yasmin"];
      break;
    }
    case "family-check": {
      if (!property) { text = "Open a property and I'll assess how well it suits a family."; break; }
      const info = tr.tool<NeighborhoodInfo | undefined>("getNeighborhoodInfo", { slug: property.neighborhood }, { label: "Checking the neighbourhood", phase: "analyzing", status: "Checking the neighbourhood…" }, (r) => r?.neighborhood.lifestyle[0] ?? "");
      tr.add({ tool: "rank", label: "Assessing family suitability", detail: "Rooms, space, amenities, safety", phase: "analyzing", status: "Assessing family suitability…" });
      tr.add({ label: "Assessment ready", phase: "completed", status: "Assessment ready." });
      const has = (f: string) => property.features.includes(f as never);
      const perBed = property.bedrooms ? Math.round(property.area / property.bedrooms) : 0;
      const items = [
        { label: `${property.bedrooms} bedrooms, ${property.bathrooms} bathrooms`, ok: property.bedrooms >= 3, note: property.bedrooms >= 4 ? "Room for children to have their own spaces." : "Works for a smaller family." },
        { label: `${property.area} sqm (~${perBed} sqm per bedroom)`, ok: perBed >= 30 ? true : perBed >= 25 ? null : false, note: perBed < 30 ? "Rooms may be compact — check the floor plan." : "Comfortable room sizes." },
        { label: "Maid room", ok: has("maid-room"), note: has("maid-room") ? "Separate room for household help." : "Not listed." },
        { label: "Parking", ok: property.parking > 0, note: `${property.parking} space${property.parking === 1 ? "" : "s"}${property.parking === 1 ? " — a second family car would need street parking" : ""}.` },
        { label: "Outdoor space", ok: has("garden") || has("roof") || null, note: has("garden") ? "Lawn or garden listed." : "No private outdoor space listed." },
        { label: "Security", ok: has("cctv") || has("security") || null, note: has("cctv") ? "CCTV listed." : "Ask about building security." },
        { label: "Neighbourhood", ok: /famil/i.test(info?.neighborhood.lifestyle.join(" ") ?? "") || null, note: info?.neighborhood.lifestyle.join(" · ") ?? "" },
      ];
      blocks.push({ kind: "checklist", title: "Family suitability", items });
      const good = items.filter((i) => i.ok === true).length;
      text = `${shortName(property)} ticks ${good} of ${items.length} family checks. ${property.bedrooms >= 4 && has("maid-room") ? "The 4-bedroom layout with a maid room is a strong fit for a family" : "It could work for a family"}; the main thing to check is room sizes, since ${property.area} sqm across ${property.bedrooms} bedrooms is on the compact side.`;
      suggestions = ["What would my monthly payment be?", "What are the main things I should consider?", "Find similar properties with more space"];
      break;
    }
    case "considerations": {
      if (!property) { text = "Open a property and I'll list what to check before you commit."; break; }
      const a = tr.tool<InvestmentAnalysis>("analyzeInvestment", { propertyId: property.id }, { label: "Reviewing listing details", phase: "analyzing", status: "Reviewing the listing…" }, () => "Licensing, pricing, building, costs");
      const nb = getNeighborhood(property.neighborhood)!;
      const psqm = property.price / property.area;
      tr.add({ label: "Checklist ready", phase: "completed", status: "Checklist ready." });
      const items = [
        { label: "Licence and title", ok: property.licensing.regaVerified ? true : false, note: property.licensing.regaVerified ? `Advertising licence ${property.licensing.advertisingLicense} is shown. Confirm the title deed matches the seller.` : "No licence shown on the listing." },
        { label: "Price per sqm", ok: psqm <= nb.demoPricePerSqm[1] ? true : null, note: `SAR ${Math.round(psqm).toLocaleString()}/sqm vs a demo band of ${nb.demoPricePerSqm[0].toLocaleString()}–${nb.demoPricePerSqm[1].toLocaleString()} for ${nb.name}.` },
        ...a.considerations.slice(0, 3).map((c) => ({ label: c.split(":")[0].split(" — ")[0].slice(0, 42), ok: null, note: c })),
      ];
      if (property.previousPrice) items.push({ label: "Recent price drop", ok: null, note: `Reduced from ${formatSAR(property.previousPrice)} — ask why, and whether there's room to negotiate.` });
      blocks.push({ kind: "checklist", title: "Things to check", items });
      text = `Before you commit to ${shortName(property)}, these are the points I'd check. Nothing here replaces an inspection or professional advice.`;
      suggestions = ["Is this suitable for a family?", "Compare this with other apartments", "Analyze the investment potential"];
      break;
    }
    case "save": {
      if (!property) break;
      tr.tool("saveProperty", { propertyId: property.id }, { label: "Saving to your list", phase: "completed", status: "Saved." });
      blocks.push({ kind: "action", action: "save", propertyId: property.id });
      text = `Saved ${shortName(property)} to your list. You'll find it under Saved.`;
      suggestions = ["Compare my saved properties", "Find similar properties"];
      break;
    }
    case "describe": {
      if (!property) break;
      const nb = getNeighborhood(property.neighborhood)!;
      tr.tool("getNeighborhoodInfo", { slug: property.neighborhood }, { label: "Loading property context", phase: "analyzing", status: "Reading the listing…" });
      tr.add({ label: "Summary ready", phase: "completed", status: "Summary ready." });
      text = `${property.title}: ${formatSAR(property.price)}${property.purpose === "rent" ? " per year" : ""}, ${property.bedrooms} bedrooms, ${property.bathrooms} bathrooms, ${property.area} sqm in ${nb.name}. ${property.description}\n\nListed amenities: ${property.features.map((f) => FEATURE_LABEL[f].toLowerCase()).join(", ") || "none listed"}.`;
      suggestions = ["Is this suitable for a family?", "What would my monthly payment be?", "Find similar properties"];
      break;
    }
    default: {
      text = property
        ? `I have ${shortName(property)} loaded. I can check family suitability, estimate the monthly payment, analyze investment characteristics, list things to check, or find and compare alternatives.`
        : "I'm Raed, your Riyah real estate agent. Tell me what you're looking for — location, budget, bedrooms, type — and I'll search, rank and shortlist listings, then help you compare and estimate financing.";
      suggestions = property
        ? ["Is this suitable for a family?", "What would my monthly payment be?", "What are the main things I should consider?", "Find similar properties"]
        : ["4-bedroom apartment in West Riyadh under SAR 800K", "Family villa in North Riyadh with a pool", "Tell me about Al Malqa", "Apartments for rent in Al Olaya"];
    }
  }

  if (!tr.steps.length) tr.add({ label: "Ready", phase: "completed", status: "Ready." });
  return { id: uid(), text, steps: tr.steps, blocks, suggestions, context: ctx, provider: provider.id };
}
