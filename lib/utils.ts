import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function formatSAR(n: number, opts: { compact?: boolean } = {}) {
  if (opts.compact) {
    if (n >= 1_000_000) return `SAR ${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 2).replace(/\.?0+$/, "")}M`;
    if (n >= 1_000) return `SAR ${Math.round(n / 1_000)}K`;
  }
  return `SAR ${Math.round(n).toLocaleString("en-US")}`;
}
export const formatNumber = (n: number, d = 0) => n.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d });
export const formatPct = (n: number, d = 1) => `${n.toFixed(d)}%`;
export function formatDate(iso: string) {
  return new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}
export const discountPct = (price: number, prev?: number) => (prev && prev > price ? ((prev - price) / prev) * 100 : 0);
export const pricePerSqm = (price: number, area: number) => (area > 0 ? price / area : 0);
export const uid = () => Math.random().toString(36).slice(2, 10);
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
