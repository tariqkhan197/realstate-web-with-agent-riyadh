import Image from "next/image";
import type { Property, PropertyImage as Img } from "@/types";
import { cn } from "@/lib/utils";

/** Cover image: first exterior photo, else first image. Placeholders (SVG) skip optimisation. */
export const coverOf = (p: Property): Img => p.images.find((i) => i.category === "exterior") ?? p.images[0];

export function PropertyPhoto({ image, className, sizes = "(max-width: 768px) 100vw, 33vw", priority, fit = "cover" }: { image: Img; className?: string; sizes?: string; priority?: boolean; fit?: "cover" | "contain" }) {
  const svg = image.src.startsWith("/placeholder") || image.src.endsWith(".svg");
  return (
    <div className={cn("relative overflow-hidden bg-ink/[.05]", className)}>
      <Image src={image.src} alt={image.alt} fill sizes={sizes} priority={priority} unoptimized={svg}
        className={fit === "contain" ? "object-contain" : "object-cover"} />
    </div>
  );
}

export function PropertyThumb({ property, className }: { property: Property; className?: string }) {
  return <PropertyPhoto image={coverOf(property)} className={className} sizes="120px" />;
}
