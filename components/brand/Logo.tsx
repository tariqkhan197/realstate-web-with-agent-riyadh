import { cn } from "@/lib/utils";

/** Riyah mark: a Najdi arched doorway with a wind stroke (riyah = winds). */
export function LogoMark({ className, inverted }: { className?: string; inverted?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-8 w-8", className)} aria-hidden>
      <path d="M5 29V14.5C5 8.1 9.9 3 16 3s11 5.1 11 11.5V29H5z" fill={inverted ? "#fff" : "#0B3B2E"} />
      <path d="M9.5 18.2c2.6-2.4 5.3-2.4 7.9 0s5.1 2.2 5.6.4" stroke={inverted ? "#0B3B2E" : "#fff"} strokeWidth="2.1" fill="none" strokeLinecap="round" />
      <path d="M9.5 23.2c2.6-2.4 5.3-2.4 7.9 0" stroke={inverted ? "#0B3B2E" : "#fff"} strokeOpacity=".55" strokeWidth="2.1" fill="none" strokeLinecap="round" />
      <path d="M16 6.2l1.6 2.3h-3.2z" fill="#C9A962" />
    </svg>
  );
}

export function Logo({ className, inverted }: { className?: string; inverted?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)} dir="ltr">
      <LogoMark inverted={inverted} />
      <span className={cn("text-[19px] font-extrabold tracking-[0.16em]", inverted ? "text-white" : "text-palm-950")}>RIYAH</span>
    </span>
  );
}
