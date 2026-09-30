import { BadgeCheck, Sparkles, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, discountPct } from "@/lib/utils";
import type { Property } from "@/types";

export function VerificationBadge({ property, tone = "glass", className }: { property: Property; tone?: "glass" | "palm"; className?: string }) {
  if (!property.licensing.regaVerified) return null;
  return <Badge tone={tone} className={className} title="Advertising licence displayed on listing. Demo listings use placeholder licence numbers.">
    <BadgeCheck size={13} className="text-palm-600" />{property.isPrimaryDemo ? "REGA licensed" : "Licence shown"}
  </Badge>;
}

export function DiscountBadge({ property, className }: { property: Property; className?: string }) {
  const d = discountPct(property.price, property.previousPrice);
  if (!d) return null;
  return <Badge tone="gold" className={className}><TrendingDown size={12} />{d.toFixed(1)}% off</Badge>;
}

export function MatchBadge({ percent, className, size = "sm" }: { percent: number; className?: string; size?: "sm" | "md" }) {
  const tone = percent >= 85 ? "bg-palm-900 text-white" : percent >= 70 ? "bg-palm-100 text-palm-900" : "bg-ink/[.07] text-ink-2";
  return <span className={cn("inline-flex items-center gap-1 rounded-full font-bold num", size === "md" ? "h-8 px-3 text-[13px]" : "h-6 px-2 text-[11.5px]", tone, className)}>
    <Sparkles size={size === "md" ? 13 : 11} className={percent >= 85 ? "text-gold-400" : "text-gold-600"} />AI Match {percent}%
  </span>;
}
