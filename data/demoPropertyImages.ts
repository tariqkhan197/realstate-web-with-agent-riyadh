// PRIMARY DEMO PROPERTY — image manifest (Dhahrat Laban, SAR 730,000).
//
// No photos were supplied with the build, so each slot currently renders a generated,
// clearly-labelled placeholder. To use the real listing photos:
//   1. Put the files in /public/properties/dhahrat-laban/ using the file names below.
//   2. Set PHOTOS_READY to true.
// Each slot keeps its category, so exterior / interior / floor-plan photos stay in the
// right places (gallery, cards, agent previews, floor plan section).
import type { PropertyImage } from "@/types";

export const PHOTOS_READY = false;

const SLOTS: { file: string; category: PropertyImage["category"]; caption: string; kind: string }[] = [
  { file: "01-exterior-facade.jpg", category: "exterior", caption: "Building facade", kind: "exterior" },
  { file: "02-exterior-entrance.jpg", category: "exterior", caption: "Main entrance", kind: "exterior" },
  { file: "03-living-room.jpg", category: "interior", caption: "Living room", kind: "interior" },
  { file: "04-majlis.jpg", category: "interior", caption: "Majlis", kind: "interior" },
  { file: "05-kitchen.jpg", category: "interior", caption: "Kitchen", kind: "interior" },
  { file: "06-master-bedroom.jpg", category: "interior", caption: "Master bedroom", kind: "interior" },
  { file: "07-bedroom-2.jpg", category: "interior", caption: "Bedroom 2", kind: "interior" },
  { file: "08-bedroom-3.jpg", category: "interior", caption: "Bedroom 3", kind: "interior" },
  { file: "09-bathroom.jpg", category: "interior", caption: "Bathroom", kind: "interior" },
  { file: "10-maid-room.jpg", category: "interior", caption: "Maid room", kind: "interior" },
  { file: "11-garden.jpg", category: "exterior", caption: "Lawn and garden", kind: "exterior" },
  { file: "12-floor-plan.jpg", category: "floor-plan", caption: "Floor plan", kind: "floor-plan" },
];

export const DEMO_PROPERTY_IMAGES: PropertyImage[] = SLOTS.map((s, i) => ({
  src: PHOTOS_READY
    ? `/properties/dhahrat-laban/${s.file}`
    : `/placeholder/${s.kind}/primary-${String(i + 1).padStart(2, "0")}?label=${encodeURIComponent(`Photo slot ${i + 1} · ${s.caption}`)}`,
  alt: `${s.caption} — 4-bedroom apartment in Dhahrat Laban, West Riyadh`,
  category: s.category,
  caption: s.caption,
  placeholder: !PHOTOS_READY,
}));
