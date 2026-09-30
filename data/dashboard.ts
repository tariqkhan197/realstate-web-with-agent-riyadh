// DEMO DATA — dashboard metrics, leads, messages and admin records for the prototype.
// All values are deterministic (seeded) so the dashboards look the same on every load.
import { PROPERTIES } from "./properties";
import { BROKERS } from "./brokers";

function seeded(seed: number) { let s = seed; return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646; }
const rnd = seeded(20260925);
const between = (a: number, b: number) => Math.round(a + rnd() * (b - a));

export const DEMO_AGENT_ID = "b-najd";
export const agentListings = PROPERTIES.filter((p) => p.brokerId === DEMO_AGENT_ID);

export const listingStats = Object.fromEntries(agentListings.map((p) => [p.id, {
  views: between(180, 2400), saves: between(8, 160), aiRecs: between(4, 90), leads: between(1, 24),
  status: rnd() > 0.85 ? "paused" : "active" as "active" | "paused",
}]));

const days = Array.from({ length: 30 }, (_, i) => { const d = new Date("2026-08-27"); d.setDate(d.getDate() + i); return d.toISOString().slice(5, 10); });
export const agentSeries = days.map((d, i) => ({ d, views: Math.round(420 + i * 9 + Math.sin(i / 2.3) * 70 + between(-40, 40)), leads: Math.max(1, Math.round(6 + i * 0.25 + Math.sin(i / 3) * 3 + between(-2, 2))), aiRecs: Math.round(40 + i * 2.1 + between(-8, 8)) }));

const NAMES = ["Abdullah Al-Otaibi", "Sara Al-Mutairi", "Khalid Al-Shehri", "Lama Al-Ghamdi", "Turki Al-Anazi", "Hessa Al-Subaie", "Majed Al-Rashid", "Nouf Al-Harthi", "Saad Al-Qarni", "Joud Al-Faisal", "Mohammed Al-Yami", "Reema Al-Shammari"];
export type LeadStage = "new" | "contacted" | "viewing" | "negotiating" | "closed";
export interface Lead { id: string; name: string; propertyId: string; source: "Listing" | "AI agent" | "Map" | "Compare"; stage: LeadStage; budget: number; at: string; brief?: string; match?: number }
export const leads: Lead[] = NAMES.map((name, i) => {
  const p = agentListings[i % agentListings.length];
  const ai = i % 3 !== 2;
  return {
    id: `L-${2401 + i}`, name, propertyId: p.id, source: ai ? "AI agent" : (["Listing", "Map", "Compare"] as const)[i % 3],
    stage: (["new", "new", "contacted", "viewing", "negotiating", "contacted", "closed"] as LeadStage[])[i % 7],
    budget: Math.round(p.price * (0.95 + rnd() * 0.2) / 10000) * 10000, at: `2026-09-${String(25 - i).padStart(2, "0")}`,
    brief: ai ? `${p.bedrooms}+ bed ${p.type} · ${p.purpose === "rent" ? "rent" : "buy"} · ${["family home", "first home", "investment"][i % 3]}` : undefined,
    match: ai ? between(78, 97) : undefined,
  };
});

export const messages = [
  { id: "m1", from: "Sara Al-Mutairi", leadId: "L-2402", preview: "Is the maid room separate from the kitchen?", at: "10:42", unread: true,
    thread: [{ me: false, t: "Hello, Raed shortlisted your Dhahrat Laban listing for me. Is the maid room separate from the kitchen?" }, { me: true, t: "Hi Sara — yes, it has its own entrance off the service corridor. Happy to arrange a viewing." }, { me: false, t: "Great, is Saturday afternoon possible?" }] },
  { id: "m2", from: "Khalid Al-Shehri", leadId: "L-2403", preview: "Can the price be negotiated?", at: "09:15", unread: true, thread: [{ me: false, t: "Can the price be negotiated for a cash buyer?" }] },
  { id: "m3", from: "Lama Al-Ghamdi", leadId: "L-2404", preview: "Thanks, see you at the viewing.", at: "Yesterday", unread: false, thread: [{ me: true, t: "Viewing confirmed for Tuesday 5pm." }, { me: false, t: "Thanks, see you at the viewing." }] },
  { id: "m4", from: "Turki Al-Anazi", leadId: "L-2405", preview: "Is parking covered?", at: "Mon", unread: false, thread: [{ me: false, t: "Is parking covered?" }] },
];

// ---------------------------------------------------------------- admin
export const adminMetrics = { users: 18432, listings: PROPERTIES.length, verified: PROPERTIES.filter((p) => p.licensing.regaVerified).length, aiSearches: 64210, aiConversations: 21784, leads: 3912, saved: 27655 };
export const adminSeries = days.map((d, i) => ({ d, users: Math.round(520 + i * 14 + Math.sin(i / 2) * 60 + between(-30, 30)), searches: Math.round(1700 + i * 38 + Math.sin(i / 2.7) * 180 + between(-90, 90)), conversations: Math.round(610 + i * 14 + between(-50, 50)) }));
export const adminUsers = [...NAMES, "Aisha Al-Juhani", "Fahad Al-Dosari", "Maha Al-Tamimi"].map((name, i) => ({
  id: `U-${10230 + i}`, name, email: `${name.split(" ")[0].toLowerCase()}.${i}@example.com`, role: i % 5 === 0 ? "agent" : "buyer", status: i % 11 === 4 ? "suspended" : "active", joined: `2026-0${(i % 8) + 1}-1${i % 9}`, conversations: between(0, 40),
}));
export const verificationQueue = PROPERTIES.filter((p) => !p.licensing.regaVerified).map((p, i) => ({ propertyId: p.id, submitted: `2026-09-${String(24 - i).padStart(2, "0")}`, issue: ["Advertising licence missing", "Licence number format invalid", "Expired licence date", "Awaiting FAL confirmation"][i % 4] }));
export const reports = [
  { id: "R-118", propertyId: PROPERTIES[8].id, reason: "Price appears outdated", by: "Buyer", status: "open" },
  { id: "R-117", propertyId: PROPERTIES[14].id, reason: "Photos don’t match description", by: "Buyer", status: "open" },
  { id: "R-116", propertyId: PROPERTIES[21].id, reason: "Duplicate listing", by: "System", status: "reviewing" },
  { id: "R-115", propertyId: PROPERTIES[30].id, reason: "Agent unresponsive", by: "Buyer", status: "resolved" },
];
export const aiIntentMix = [{ k: "Search & shortlist", v: 46 }, { k: "Financing", v: 17 }, { k: "Comparison", v: 13 }, { k: "Neighborhood", v: 9 }, { k: "Investment", v: 8 }, { k: "Family check / considerations", v: 7 }];
export const aiToolCalls = [{ k: "searchProperties", v: 61240 }, { k: "filterProperties", v: 142880 }, { k: "createShortlist", v: 58110 }, { k: "calculateMortgage", v: 12630 }, { k: "compareProperties", v: 9420 }, { k: "analyzeInvestment", v: 6980 }, { k: "getNeighborhoodInfo", v: 6120 }, { k: "findSimilarProperties", v: 5870 }, { k: "saveProperty", v: 4410 }];
export const brokerStats = BROKERS.filter((b) => b.id !== "owner-direct").map((b) => ({ ...b, active: PROPERTIES.filter((p) => p.brokerId === b.id).length, leads: between(40, 400), rating: (4 + rnd()).toFixed(1), verified: rnd() > 0.2 }));
