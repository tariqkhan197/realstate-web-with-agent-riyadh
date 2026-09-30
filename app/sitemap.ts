import type { MetadataRoute } from "next";
import { PROPERTIES } from "@/data/properties";
import { NEIGHBORHOODS } from "@/data/locations";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/buy", "/rent", "/projects", "/agent", "/map", "/investment", "/match", "/compare", "/neighborhoods", "/for-agents"];
  return [
    ...pages.map((p) => ({ url: `${BASE}${p}`, changeFrequency: "daily" as const, priority: p === "" ? 1 : 0.8 })),
    ...PROPERTIES.map((p) => ({ url: `${BASE}/property/${p.slug}`, lastModified: p.addedOn, priority: 0.7 })),
    ...NEIGHBORHOODS.map((n) => ({ url: `${BASE}/neighborhoods/${n.slug}`, priority: 0.6 })),
  ];
}
