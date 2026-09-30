// DEMO DATA — every listing below is fictional demo data for the Riyah prototype,
// except the primary listing, which uses the details supplied in the product brief.
// Licence numbers prefixed "DEMO-" are placeholders, not real REGA/FAL records.
import type { Feature, Furnishing, Property, PropertyImage, PropertyType, Purpose } from "@/types";
import { DEMO_PROPERTY_IMAGES } from "./demoPropertyImages";
import { getNeighborhood } from "./locations";

export const PRIMARY_PROPERTY: Property = {
  id: "riyah-0001",
  slug: "dhahrat-laban-4-bedroom-apartment-730000",
  title: "Apartments for Sale in Dhahrat Laban Neighborhood",
  type: "apartment",
  purpose: "sale",
  price: 730000,
  previousPrice: 790000,
  city: "riyadh",
  neighborhood: "dhahrat-laban",
  bedrooms: 4,
  bathrooms: 3,
  area: 135,
  completion: "ready",
  furnishing: "unfurnished",
  age: "new",
  parking: 1,
  features: ["maid-room", "parking", "garden", "cctv", "storage"],
  demoFeatures: ["central-ac", "kitchen"],
  description:
    "Owner-occupied apartments for sale in the Zaheerah Ben district near Al-Dairy, directly from the owner without a mediator. Elegant and modern finishing. Areas ranging from 106m to 194m at competitive prices.",
  images: DEMO_PROPERTY_IMAGES,
  licensing: {
    regaVerified: true,
    falLicense: "1100206867",
    advertisingLicense: "7100306377",
    licenseIssued: "2026-08-02",
    licenseExpiry: "2027-08-02",
    sourceReference: "Bayut - 88056393",
    truCheckDate: "2026-08-31",
  },
  addedOn: "2026-08-02",
  brokerId: "owner-direct",
  pos: { x: 25, y: 46 },
  isPrimaryDemo: true,
  demo: true,
};

type Row = [
  id: string, type: PropertyType, purpose: Purpose, hood: string, price: number, prev: number | null,
  beds: number, baths: number, area: number, completion: "ready" | "off-plan", furnishing: Furnishing,
  age: Property["age"], parking: number, features: string, verified: boolean, added: string, broker: string,
];

// prettier-ignore
const ROWS: Row[] = [
  ["r02","apartment","sale","dhahrat-laban",765000,null,4,3,148,"ready","unfurnished","new",1,"maid-room,parking,elevator,cctv",true,"2026-09-02","b-najd"],
  ["r03","apartment","sale","dhahrat-laban",612000,649000,3,2,118,"ready","unfurnished","new",1,"parking,elevator,storage",true,"2026-08-21","b-najd"],
  ["r04","floor","sale","dhahrat-laban",890000,null,5,4,210,"ready","unfurnished","1-5",1,"maid-room,parking,roof,central-ac",true,"2026-07-28","b-najd"],
  ["r05","villa","sale","dhahrat-laban",1950000,2100000,6,6,360,"ready","unfurnished","5-10",2,"maid-room,driver-room,parking,garden,roof",true,"2026-06-30","b-najd"],
  ["r06","apartment","rent","dhahrat-laban",52000,null,3,2,125,"ready","semi-furnished","1-5",1,"parking,elevator,kitchen,central-ac",true,"2026-09-10","b-najd"],
  ["r07","apartment","sale","tuwaiq",545000,null,4,3,140,"ready","unfurnished","new",1,"maid-room,parking,storage",true,"2026-09-05","b-najd"],
  ["r08","apartment","sale","tuwaiq",480000,510000,3,2,112,"ready","unfurnished","new",1,"parking,cctv",false,"2026-08-15","b-najd"],
  ["r09","villa","sale","tuwaiq",1450000,null,5,5,312,"ready","unfurnished","1-5",2,"maid-room,driver-room,parking,garden,roof",true,"2026-08-02","b-najd"],
  ["r10","apartment","sale","mahdiyah",598000,null,4,3,152,"ready","unfurnished","new",1,"maid-room,parking,garden,cctv",true,"2026-09-12","b-najd"],
  ["r11","villa","sale","mahdiyah",1680000,1790000,6,5,400,"ready","unfurnished","new",2,"maid-room,driver-room,parking,garden,pool,roof",true,"2026-07-19","b-sahel"],
  ["r12","townhouse","sale","mahdiyah",1120000,null,4,4,250,"off-plan","unfurnished","new",2,"maid-room,parking,roof,central-ac",true,"2026-09-18","b-sahel"],
  ["r13","apartment","sale","dahiat-namar",575000,null,4,3,145,"ready","unfurnished","new",1,"maid-room,parking,elevator,storage",true,"2026-08-27","b-sahel"],
  ["r14","duplex","sale","dahiat-namar",845000,895000,5,4,230,"ready","unfurnished","new",2,"maid-room,parking,roof,garden",true,"2026-08-09","b-sahel"],
  ["r15","villa","rent","dahiat-namar",95000,null,5,5,350,"ready","unfurnished","1-5",2,"maid-room,driver-room,parking,garden",true,"2026-09-14","b-sahel"],
  ["r16","land","sale","dirab",950000,null,0,0,900,"ready","unfurnished","new",0,"",true,"2026-07-12","b-najd"],
  ["r17","villa","sale","dirab",1250000,null,5,4,480,"ready","unfurnished","10+",3,"garden,pool,driver-room,parking",false,"2026-06-22","b-najd"],
  ["r18","apartment","sale","al-malqa",1180000,null,3,3,165,"ready","unfurnished","new",1,"parking,elevator,cctv,gym,security",true,"2026-09-08","b-sahel"],
  ["r19","villa","sale","al-malqa",3950000,4200000,6,7,520,"ready","unfurnished","new",3,"maid-room,driver-room,parking,garden,pool,elevator,roof,security",true,"2026-08-18","b-sahel"],
  ["r20","townhouse","sale","al-malqa",2450000,null,4,5,300,"ready","unfurnished","new",2,"maid-room,parking,roof,central-ac",true,"2026-07-30","b-sahel"],
  ["r21","apartment","rent","al-malqa",98000,null,3,3,170,"ready","furnished","new",1,"parking,elevator,gym,pool,security,kitchen",true,"2026-09-16","b-sahel"],
  ["r22","apartment","sale","al-nakheel",960000,1020000,3,3,138,"ready","unfurnished","1-5",1,"parking,elevator,cctv",true,"2026-08-11","b-najd"],
  ["r23","floor","sale","al-nakheel",1350000,null,5,4,240,"ready","unfurnished","5-10",1,"maid-room,parking,roof",true,"2026-07-05","b-najd"],
  ["r24","apartment","rent","al-nakheel",72000,null,2,2,110,"ready","furnished","1-5",1,"parking,elevator,kitchen,central-ac",true,"2026-09-03","b-najd"],
  ["r25","apartment","sale","al-olaya",1290000,null,2,2,125,"ready","furnished","new",1,"parking,elevator,gym,pool,security,kitchen",true,"2026-09-01","b-sahel"],
  ["r26","penthouse","sale","al-olaya",3400000,3650000,4,5,310,"ready","furnished","new",2,"parking,elevator,gym,pool,security,roof,balcony",true,"2026-08-24","b-sahel"],
  ["r27","apartment","rent","al-olaya",115000,null,2,2,118,"ready","furnished","new",1,"parking,elevator,gym,security,kitchen",true,"2026-09-19","b-sahel"],
  ["r28","apartment","sale","al-yasmin",865000,null,4,3,160,"ready","unfurnished","new",1,"maid-room,parking,elevator,cctv",true,"2026-09-07","b-najd"],
  ["r29","villa","sale","al-yasmin",2750000,null,5,6,400,"ready","unfurnished","new",2,"maid-room,driver-room,parking,garden,pool,roof",true,"2026-08-05","b-najd"],
  ["r30","apartment","sale","al-yasmin",790000,840000,3,3,145,"off-plan","unfurnished","new",1,"parking,elevator,balcony",false,"2026-09-11","b-najd"],
  ["r31","villa","sale","al-narjis",2980000,null,6,6,450,"ready","unfurnished","new",3,"maid-room,driver-room,parking,garden,pool,elevator",true,"2026-08-29","b-sahel"],
  ["r32","townhouse","sale","al-narjis",1890000,1990000,4,4,280,"off-plan","unfurnished","new",2,"maid-room,parking,roof",true,"2026-09-15","b-sahel"],
  ["r33","apartment","rent","al-narjis",68000,null,3,3,150,"ready","unfurnished","new",1,"parking,elevator,maid-room",true,"2026-09-20","b-sahel"],
  ["j01","apartment","sale","al-shati-jeddah",1650000,null,3,3,180,"ready","furnished","new",1,"parking,elevator,pool,gym,security,balcony",true,"2026-08-20","b-bahr"],
  ["j02","villa","sale","obhur",3200000,3450000,5,6,480,"ready","unfurnished","1-5",3,"maid-room,driver-room,pool,garden,parking",true,"2026-07-26","b-bahr"],
  ["j03","apartment","sale","al-rawdah-jeddah",720000,null,4,3,165,"ready","unfurnished","5-10",1,"maid-room,parking,elevator",true,"2026-09-04","b-bahr"],
  ["j04","apartment","rent","al-rawdah-jeddah",58000,null,3,2,130,"ready","semi-furnished","5-10",1,"parking,elevator,kitchen",false,"2026-09-13","b-bahr"],
  ["d01","floor","sale","al-faisaliyah-dammam",680000,null,5,4,220,"ready","unfurnished","1-5",1,"maid-room,parking,roof",true,"2026-08-14","b-sharqiya"],
  ["d02","villa","sale","al-shati-dammam",1850000,null,5,5,375,"ready","unfurnished","new",2,"maid-room,driver-room,garden,parking",true,"2026-08-01","b-sharqiya"],
  ["d03","apartment","sale","al-faisaliyah-dammam",455000,null,3,2,120,"ready","unfurnished","new",1,"parking,cctv",true,"2026-09-09","b-sharqiya"],
  ["k01","apartment","rent","al-aqrabiyah",62000,null,2,2,115,"ready","furnished","1-5",1,"parking,elevator,gym,kitchen",true,"2026-09-17","b-sharqiya"],
  ["k02","apartment","sale","al-aqrabiyah",740000,780000,3,3,150,"ready","unfurnished","new",1,"parking,elevator,balcony,cctv",true,"2026-08-26","b-sharqiya"],
  ["k03","townhouse","sale","al-yarmouk-khobar",1390000,null,4,4,285,"ready","unfurnished","new",2,"maid-room,parking,garden,roof",true,"2026-07-22","b-sharqiya"],
  ["m01","apartment","sale","al-awali",640000,null,4,3,150,"ready","unfurnished","new",1,"maid-room,parking,elevator",true,"2026-08-30","b-haram"],
  ["md1","apartment","sale","quba",585000,null,3,3,140,"ready","unfurnished","new",1,"parking,elevator,storage",true,"2026-09-06","b-haram"],
  ["md2","villa","sale","quba",1550000,null,5,5,360,"ready","unfurnished","1-5",2,"maid-room,driver-room,garden,parking",false,"2026-07-15","b-haram"],
];

export const TYPE_LABEL: Record<PropertyType, string> = {
  apartment: "Apartment", villa: "Villa", townhouse: "Townhouse", floor: "Floor",
  duplex: "Duplex", penthouse: "Penthouse", land: "Land",
};

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967295;
}

function describe(r: Row, hoodName: string): string {
  const [, type, purpose, , , , beds, , area, completion, furnishing] = r;
  if (type === "land") return `Residential land plot of ${area} sqm in ${hoodName}, suitable for a private villa or a small family compound. Flat terrain with street access on one side.`;
  const lead = purpose === "rent" ? `${TYPE_LABEL[type]} for annual rent` : `${completion === "off-plan" ? "Off-plan" : "Ready"} ${TYPE_LABEL[type].toLowerCase()} for sale`;
  const finish = furnishing === "furnished" ? "fully furnished with a fitted kitchen" : furnishing === "semi-furnished" ? "semi-furnished with kitchen and air conditioning" : "delivered unfurnished with modern finishing";
  return `${lead} in ${hoodName} with ${beds} bedrooms across ${area} sqm, ${finish}. Practical layout with separate family and guest areas.`;
}

function images(r: Row, title: string): PropertyImage[] {
  const [id, type] = r;
  if (type === "land") return [{ src: `/placeholder/land/${id}-1`, alt: `${title} — plot`, category: "exterior", placeholder: true }];
  return [
    { src: `/placeholder/exterior/${id}-1`, alt: `${title} — exterior`, category: "exterior", placeholder: true },
    { src: `/placeholder/interior/${id}-2`, alt: `${title} — living area`, category: "interior", caption: "Living area", placeholder: true },
    { src: `/placeholder/interior/${id}-3`, alt: `${title} — bedroom`, category: "interior", caption: "Bedroom", placeholder: true },
    { src: `/placeholder/floor-plan/${id}-4`, alt: `${title} — floor plan`, category: "floor-plan", caption: "Floor plan", placeholder: true },
  ];
}

function build(r: Row): Property {
  const [id, type, purpose, hood, price, prev, beds, baths, area, completion, furnishing, age, parking, feats, verified, added, broker] = r;
  const nb = getNeighborhood(hood)!;
  const title = type === "land"
    ? `Land for Sale in ${nb.name}`
    : `${beds}-Bedroom ${TYPE_LABEL[type]} for ${purpose === "rent" ? "Rent" : "Sale"} in ${nb.name}`;
  const slug = type === "land"
    ? `${hood}-land-${area}sqm-${price}`
    : `${hood}-${beds}-bedroom-${type}-${purpose === "rent" ? "rent-" : ""}${price}`;
  const jx = (hash(id + "x") - 0.5) * 12, jy = (hash(id + "y") - 0.5) * 10;
  const addedDate = new Date(added);
  const expiry = new Date(addedDate); expiry.setFullYear(expiry.getFullYear() + 1);
  const n4 = String(Math.floor(hash(id) * 9000) + 1000);
  return {
    id: `riyah-${id}`, slug, title, type, purpose, price, previousPrice: prev ?? undefined,
    city: nb.city, neighborhood: hood, bedrooms: beds, bathrooms: baths, area, completion, furnishing, age, parking,
    features: (feats ? feats.split(",") : []) as Feature[],
    description: describe(r, nb.name),
    images: images(r, title),
    licensing: verified
      ? { regaVerified: true, falLicense: `DEMO-FAL-${n4}`, advertisingLicense: `DEMO-AD-${n4}7`, licenseIssued: added, licenseExpiry: expiry.toISOString().slice(0, 10) }
      : { regaVerified: false },
    addedOn: added, brokerId: broker,
    pos: { x: Math.max(4, Math.min(96, nb.center.x + jx)), y: Math.max(4, Math.min(96, nb.center.y + jy)) },
    demo: true,
  };
}

export const PROPERTIES: Property[] = [PRIMARY_PROPERTY, ...ROWS.map(build)];

export const FEATURE_LABEL: Record<Feature, string> = {
  "maid-room": "Maid room", parking: "Parking", garden: "Lawn or garden", pool: "Swimming pool", elevator: "Elevator",
  cctv: "CCTV security", storage: "Storage areas", "driver-room": "Driver room", roof: "Private roof",
  "central-ac": "Central A/C", kitchen: "Fitted kitchen", gym: "Gym", balcony: "Balcony", basement: "Basement", security: "24/7 security",
};
