// Core domain types for Riyah.

export type CitySlug = "riyadh" | "jeddah" | "dammam" | "khobar" | "makkah" | "madinah";
export type Region = "north" | "west" | "central" | "east" | "south";
export type PropertyType = "apartment" | "villa" | "townhouse" | "floor" | "duplex" | "penthouse" | "land";
export type Purpose = "sale" | "rent";
export type Completion = "ready" | "off-plan";
export type Furnishing = "furnished" | "semi-furnished" | "unfurnished";
export type BuyerGoal = "first-home" | "family-home" | "investment" | "rental" | "luxury";

export type Feature =
  | "maid-room" | "parking" | "garden" | "pool" | "elevator" | "cctv" | "storage"
  | "driver-room" | "roof" | "central-ac" | "kitchen" | "gym" | "balcony" | "basement" | "security";

export type ImageCategory = "exterior" | "interior" | "floor-plan";

export interface PropertyImage {
  src: string;
  alt: string;
  category: ImageCategory;
  caption?: string;
  /** true when the file is a generated placeholder rather than a real photo */
  placeholder?: boolean;
}

export interface Licensing {
  regaVerified: boolean;
  falLicense?: string;
  advertisingLicense?: string;
  licenseIssued?: string;
  licenseExpiry?: string;
  sourceReference?: string;
  truCheckDate?: string;
}

export interface Broker {
  id: string;
  name: string;
  company: string;
  phoneMasked: string;
  responseTime: string;
  listings: number;
  initials: string;
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  type: PropertyType;
  purpose: Purpose;
  /** SAR. For rentals this is the yearly rent. */
  price: number;
  previousPrice?: number;
  city: CitySlug;
  neighborhood: string; // neighborhood slug
  bedrooms: number;
  bathrooms: number;
  area: number; // sqm
  completion: Completion;
  furnishing: Furnishing;
  age: "new" | "1-5" | "5-10" | "10+";
  parking: number;
  features: Feature[];
  demoFeatures?: Feature[]; // extra amenities marked as demo data
  description: string;
  images: PropertyImage[];
  licensing: Licensing;
  addedOn: string; // ISO date
  brokerId: string;
  /** Map position inside the district canvas (0-100) */
  pos: { x: number; y: number };
  isPrimaryDemo?: boolean;
  /** true on every record: all listings are demo data */
  demo: true;
}

export interface Neighborhood {
  slug: string;
  name: string;
  nameAr: string;
  city: CitySlug;
  region: Region;
  center: { x: number; y: number };
  summary: string;
  lifestyle: string[];
  amenities: string[];
  transport: string;
  /** Demo SAR per sqm range for apartments (not market data) */
  demoPricePerSqm: [number, number];
  /** Demo gross rental yield assumptions (low, base, high) */
  demoYield: [number, number, number];
  propertyMix: Partial<Record<PropertyType, number>>;
}

export interface City {
  slug: CitySlug;
  name: string;
  nameAr: string;
  /** position on the simulated Saudi map (0-100) */
  pos: { x: number; y: number };
}

export interface SearchCriteria {
  query?: string;
  purpose?: Purpose;
  city?: CitySlug;
  region?: Region;
  neighborhoods?: string[];
  types?: PropertyType[];
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  maxBeds?: number;
  minBaths?: number;
  minArea?: number;
  maxArea?: number;
  furnishing?: Furnishing;
  completion?: Completion;
  newOnly?: boolean;
  features?: Feature[];
  verifiedOnly?: boolean;
  goal?: BuyerGoal;
  sort?: "relevance" | "price-asc" | "price-desc" | "newest" | "area-desc";
}

export interface MatchFactor {
  key: "budget" | "location" | "bedrooms" | "type" | "goal" | "features" | "space" | "quality";
  label: string;
  weight: number;
  score: number; // 0..1
  note: string;
}

export interface MatchResult {
  property: Property;
  percent: number;
  factors: MatchFactor[];
  reasons: string[];
}
