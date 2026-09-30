import { cn } from "@/lib/utils";

/** Raed — the Riyah agent. An eight-point Najdi star that turns slowly while working. */
export function AgentAvatar({ size = 36, working, className }: { size?: number; working?: boolean; className?: string }) {
  return (
    <span className={cn("relative inline-grid shrink-0 place-items-center rounded-full bg-palm-900", className)} style={{ width: size, height: size }} aria-hidden>
      {working && <span className="absolute inset-0 rounded-full ring-2 ring-gold-400/70 animate-pulse-dot" />}
      <svg viewBox="0 0 24 24" style={{ width: size * 0.58, height: size * 0.58 }} className={cn(working && "motion-safe:animate-[spin_6s_linear_infinite]")}>
        <rect x="6" y="6" width="12" height="12" rx="1.2" fill="none" stroke="#fff" strokeWidth="1.7" />
        <rect x="6" y="6" width="12" height="12" rx="1.2" fill="none" stroke="#fff" strokeWidth="1.7" transform="rotate(45 12 12)" />
        <circle cx="12" cy="12" r="2.2" fill="#C9A962" />
      </svg>
    </span>
  );
}
