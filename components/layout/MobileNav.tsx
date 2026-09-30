"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Heart, Home, User } from "lucide-react";
import { AgentAvatar } from "@/components/brand/AgentAvatar";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const path = usePathname();
  const { t, saved, hydrated } = useApp();
  const items = [
    { href: "/", label: t("nav.home"), icon: Home, match: (p: string) => p === "/" },
    { href: "/buy", label: t("nav.explore"), icon: Compass, match: (p: string) => /^\/(buy|rent|map|property|projects|neighborhoods)/.test(p) },
    { href: "/agent", label: t("nav.agent"), icon: null, match: (p: string) => p.startsWith("/agent") },
    { href: "/saved", label: t("nav.saved"), icon: Heart, match: (p: string) => p.startsWith("/saved") },
    { href: "/profile", label: t("nav.profile"), icon: User, match: (p: string) => /^\/(profile|sign-in|sign-up)/.test(p) },
  ];
  return (
    <nav aria-label="Primary mobile" className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
      <ul className="mx-auto grid h-16 max-w-lg grid-cols-5">
        {items.map((i) => {
          const active = i.match(path);
          return (
            <li key={i.href}>
              <Link href={i.href} aria-current={active ? "page" : undefined} className={cn("flex h-full flex-col items-center justify-center gap-1 text-[11px] font-semibold", active ? "text-palm-900" : "text-ink-3")}>
                {i.icon ? (
                  <span className="relative"><i.icon size={21} strokeWidth={active ? 2.3 : 1.9} />
                    {i.href === "/saved" && hydrated && saved.length > 0 && <span className="absolute -end-1.5 -top-1 h-2 w-2 rounded-full bg-gold-600" />}
                  </span>
                ) : <AgentAvatar size={30} className={cn("-mt-1 ring-4", active ? "ring-palm-100" : "ring-white")} />}
                {i.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
