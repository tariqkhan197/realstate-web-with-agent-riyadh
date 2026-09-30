// Rule-based natural-language understanding used by the offline mock provider.
// Understands English and common Arabic phrasings for Saudi property searches.
import { NEIGHBORHOODS } from "@/data/locations";
import type { BuyerGoal, CitySlug, Feature, PropertyType, Region, SearchCriteria } from "@/types";
import type { AgentContext, Intent, ParsedIntent } from "./types";

const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const WORDS: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };

const TYPES: [RegExp, PropertyType][] = [
  [/\b(apartments?|flats?)\b|شق[ةه]|شقق/, "apartment"], [/\bvillas?\b|فيلا|فلل/, "villa"], [/\btown ?houses?\b|تاون/, "townhouse"],
  [/\bduplex(es)?\b|دوبلكس/, "duplex"], [/\bpenthouses?\b|بنتهاوس/, "penthouse"], [/\b(floors?|dor)\b|دور/, "floor"], [/\b(land|plots?)\b|أرض|ارض/, "land"],
];
const CITIES: [RegExp, CitySlug][] = [
  [/riyadh|الرياض|رياض/, "riyadh"], [/jeddah|jedda|جدة|جده/, "jeddah"], [/dammam|الدمام/, "dammam"],
  [/khobar|الخبر/, "khobar"], [/makkah|mecca|مكة/, "makkah"], [/madinah|medina|المدينة/, "madinah"],
];
const REGIONS: [RegExp, Region][] = [
  [/\bwest(ern)?\b|غرب/, "west"], [/\bnorth(ern)?\b|شمال/, "north"], [/\beast(ern)?\b|شرق/, "east"],
  [/\bsouth(ern)?\b|جنوب/, "south"], [/\bcent(ral|re|er)\b|downtown|وسط/, "central"],
];
const HOOD_ALIASES: Record<string, RegExp> = {
  "dhahrat-laban": /dhahrat|laban|zaheer|ظهرة|لبن/, "al-malqa": /malqa|الملقا/, "al-nakheel": /nakheel|النخيل/,
  "al-olaya": /olaya|العليا/, "al-yasmin": /yasmin|الياسمين/, "al-narjis": /narjis|النرجس/, tuwaiq: /tuwaiq|طويق/,
  mahdiyah: /mahdi(y)?ah?|المهدية/, dirab: /dirab|ديراب/, "dahiat-namar": /namar|نمار/, "al-shati-jeddah": /shati.*jeddah|jeddah.*shati/,
  "al-rawdah-jeddah": /rawdah|الروضة/, obhur: /obhur|أبحر/, "al-faisaliyah-dammam": /faisaliyah|الفيصلية/, "al-aqrabiyah": /aqrabiyah|العقربية/,
  "al-yarmouk-khobar": /yarmouk|اليرموك/, "al-awali": /awali|العوالي/, quba: /\bquba\b|قباء/,
};
const FEATURES: [RegExp, Feature][] = [
  [/pool|مسبح/, "pool"], [/garden|lawn|حديقة/, "garden"], [/maid|خادمة/, "maid-room"], [/parking|garage|موقف/, "parking"],
  [/elevator|\blift\b|مصعد/, "elevator"], [/driver/, "driver-room"], [/\bgym\b/, "gym"], [/balcon/, "balcony"],
];
const GOALS: [RegExp, BuyerGoal][] = [
  [/first[- ]?(time )?(home|buyer)|أول/, "first-home"], [/famil|kids|children|عائل|أسرة/, "family-home"],
  [/invest|yield|\broi\b|استثمار/, "investment"], [/luxury|premium|high[- ]end|فاخر/, "luxury"],
];

export function normalize(text: string) {
  return text.toLowerCase().replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d))).replace(/\s+/g, " ").trim();
}

function money(num: string, unit?: string) {
  let v = parseFloat(num.replace(/,/g, ""));
  const u = (unit ?? "").toLowerCase();
  if (/^(k|thousand|ألف|الف)$/.test(u)) v *= 1_000;
  if (/^(m|mn|million|مليون)$/.test(u)) v *= 1_000_000;
  return v;
}

export function parseCriteria(raw: string) {
  const t = normalize(raw).replace(/\b(one|two|three|four|five|six|seven|eight|nine|ten)\b/g, (w) => String(WORDS[w]));
  const c: SearchCriteria = {};
  const mortgage: ParsedIntent["mortgage"] = {};
  let found = false;

  if (/\b(rent|rental|lease|to let)\b|إيجار|ايجار|للإيجار/.test(t) && !/rental (return|income|potential|yield)/.test(t)) { c.purpose = "rent"; found = true; }
  if (/\b(buy|purchase|for sale|own)\b|شراء|للبيع/.test(t)) { c.purpose = "sale"; }

  const types = TYPES.filter(([r]) => r.test(t)).map(([, v]) => v);
  if (types.length) { c.types = Array.from(new Set(types)); found = true; }
  if (/\bstudio\b/.test(t)) { c.types = ["apartment"]; c.maxBeds = 1; found = true; }

  const city = CITIES.find(([r]) => r.test(t));
  if (city) { c.city = city[1]; found = true; }
  const region = REGIONS.find(([r]) => r.test(t));
  if (region) { c.region = region[1]; c.city ??= "riyadh"; found = true; }
  const hoods = Object.entries(HOOD_ALIASES).filter(([, r]) => r.test(t)).map(([s]) => s);
  if (hoods.length) {
    c.neighborhoods = hoods; found = true;
    const nb = NEIGHBORHOODS.find((n) => n.slug === hoods[0]);
    if (nb) { c.city = nb.city; c.region ??= nb.region; }
  }

  // Numbers with their surrounding context
  const re = /(\d+(?:[.,]\d+)*)\s*(k|m|mn|million|thousand|ألف|الف|مليون)?(?![a-z])\s*(\+)?\s*(-|\s)?\s*(bed(room)?s?|br|rooms?|غرف|غرفة|%|percent|years?|yrs?|سنة|سنوات|sqm|m2|m²|square|متر)?/gi;
  const between = t.match(/between\s*(?:sar\s*)?(\d[\d,.]*)\s*(k|m|million)?\s*(?:and|-|to)\s*(?:sar\s*)?(\d[\d,.]*)\s*(k|m|million)?/);
  if (between) { c.minPrice = money(between[1], between[2] ?? between[4]); c.maxPrice = money(between[3], between[4]); found = true; }
  for (const m of t.matchAll(re)) {
    const [whole, num, unit, , , ctx] = m;
    const idx = m.index ?? 0;
    const before = t.slice(Math.max(0, idx - 28), idx);
    const k = (ctx ?? "").toLowerCase();
    if (/bed|br|room|غرف/.test(k)) { c.minBeds = parseInt(num); found = true; continue; }
    if (/%|percent/.test(k)) {
      const v = parseFloat(num);
      if (/rate|profit|interest|apr|فائدة/.test(before)) mortgage.ratePct = v; else mortgage.downPct = v;
      continue;
    }
    if (/year|yr|سن/.test(k)) { mortgage.years = parseInt(num); continue; }
    if (/sqm|m2|m²|square|متر/.test(k)) { c.minArea = parseInt(num); found = true; continue; }
    if (between) continue;
    const v = money(num, unit);
    if (v < 10_000 && !unit) continue;
    if (/(over|above|more than|at least|from|min(imum)?)\s*(sar\s*)?$/.test(before)) c.minPrice = v;
    else c.maxPrice = v;
    if (/down ?payment/.test(before)) { delete c.maxPrice; continue; }
    found = true;
    void whole;
  }
  const atLeast = t.match(/at least (\d+) (bed|room)/);
  if (atLeast) c.minBeds = parseInt(atLeast[1]);

  const feats = FEATURES.filter(([r]) => r.test(t)).map(([, v]) => v);
  if (feats.length) { c.features = feats; found = true; }
  if (/\bfurnished\b|مفروش/.test(t) && !/unfurnished/.test(t)) { c.furnishing = "furnished"; found = true; }
  if (/\bready\b|جاهز/.test(t)) c.completion = "ready";
  if (/off[- ]?plan|على الخارطة/.test(t)) c.completion = "off-plan";
  if (/verified|licensed|موثق/.test(t)) c.verifiedOnly = true;
  const goal = GOALS.find(([r]) => r.test(t));
  if (goal) c.goal = goal[1];

  return { c, found, mortgage, t };
}

function resolveProperty(t: string, ctx: AgentContext): string | undefined {
  const ids = ctx.lastResultIds ?? [];
  const ord = [/\b(first|1st|#1|number one|top (one|pick))\b|الأول/, /\b(second|2nd|#2)\b|الثاني/, /\b(third|3rd|#3)\b|الثالث/, /\b(fourth|4th|#4)\b/];
  for (let i = 0; i < ord.length; i++) if (ord[i].test(t) && ids[i]) return ids[i];
  return ctx.activePropertyId ?? ids[0];
}

export function parseIntent(text: string, ctx: AgentContext): ParsedIntent {
  const { c, found, mortgage, t } = parseCriteria(text);
  const propertyId = resolveProperty(t, ctx);
  const locationOrType = !!(c.types || c.city || c.region || c.neighborhoods);
  let intent: Intent = "help";

  if (/\bsave\b|احفظ|حفظ/.test(t) && propertyId) intent = "save";
  else if (/compar|versus|\bvs\.?\b|قارن|مقارنة/.test(t)) intent = "compare";
  else if (/mortgage|monthly|payment|financ|instal+ment|down ?payment|\bloan\b|afford|تمويل|قسط/.test(t) && !locationOrType) intent = "mortgage";
  else if (/similar|like this|alternative|مشابه/.test(t)) intent = "similar";
  else if (/suitable|good for (a |my )?famil|family[- ]friendly|مناسب/.test(t) && !found) intent = "family-check";
  else if (/consider|should i (know|check|ask)|risks?|watch out|things to|red flag|انتبه/.test(t) && !locationOrType) intent = "considerations";
  else if (/invest|yield|\broi\b|rental (return|income|potential)|good deal|استثمار|عائد/.test(t) && !locationOrType && propertyId) intent = "investment";
  else if (/(tell me about|what('s| is) .* like|about the (area|neighbou?rhood)|neighbou?rhood info|area guide|عن حي)/.test(t) && (c.neighborhoods || c.region) && !c.types && !c.maxPrice && !c.minBeds) intent = "neighborhood";
  else if (found) intent = "search";
  else if (/(this|the) (property|apartment|villa|one|listing)|tell me more|details|describe/.test(t) && propertyId) intent = "describe";
  else if (/\b(show|find|search|looking|need|want)\b|ابحث|أريد|ابغى/.test(t)) intent = "search";

  // Refinements ("only with a maid room", "what about under 700K") inherit the last search.
  let criteria = c;
  if (intent === "search" && ctx.lastCriteria && (!locationOrType || /^(what about|how about|only|and|also|with|without|show only|now)\b/.test(t))) {
    criteria = { ...ctx.lastCriteria, ...c, features: Array.from(new Set([...(ctx.lastCriteria.features ?? []), ...(c.features ?? [])])) };
    if (!criteria.features?.length) delete criteria.features;
  }
  if (intent === "search") criteria.purpose ??= "sale";
  return { intent, criteria, hasCriteria: found, propertyId, mortgage };
}
