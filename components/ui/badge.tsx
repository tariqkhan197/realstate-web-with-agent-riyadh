import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva("inline-flex items-center gap-1 rounded-full font-semibold leading-none whitespace-nowrap", {
  variants: {
    tone: {
      neutral: "bg-ink/[.06] text-ink-2",
      palm: "bg-palm-50 text-palm-800 ring-1 ring-inset ring-palm-200/70",
      gold: "bg-gold-50 text-gold-700 ring-1 ring-inset ring-gold-200",
      solid: "bg-palm-900 text-white",
      glass: "bg-white/92 text-ink backdrop-blur-sm shadow-ring",
      danger: "bg-danger-50 text-danger",
      outline: "ring-1 ring-inset ring-line-strong text-ink-2",
    },
    size: { sm: "h-6 px-2 text-[11.5px]", md: "h-7 px-2.5 text-[12.5px]" },
  },
  defaultVariants: { tone: "neutral", size: "sm" },
});

export function Badge({ className, tone, size, ...p }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone, size }), className)} {...p} />;
}
