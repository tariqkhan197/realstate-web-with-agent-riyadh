"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Languages, Menu, Sparkles, X } from "lucide-react";
import * as React from "react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { DictKey } from "@/lib/i18n/dictionaries";

const NAV: { href: string; key: DictKey }[] = [
  { href: "/buy", key: "nav.buy" }, { href: "/rent", key: "nav.rent" }, { href: "/projects", key: "nav.projects" },
  { href: "/agent", key: "nav.agent" }, { href: "/map", key: "nav.map" }, { href: "/investment", key: "nav.investment" },
  { href: "/for-agents", key: "nav.forAgents" },
];

export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang, t } = useApp();
  return (
    <button type="button" onClick={() => setLang(lang === "en" ? "ar" : "en")} aria-label={lang === "en" ? "Switch to Arabic" : "Switch to English"}
      className={cn("inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-[13px] font-semibold text-ink-2 hover:bg-ink/5", className)}>
      <Languages size={16} /><span className={lang === "en" ? "font-arabic" : ""}>{t("lang.switch")}</span>
    </button>
  );
}

export function Header() {
  const path = usePathname();
  const { t, saved, user, hydrated } = useApp();
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => setOpen(false), [path]);
  const app = path.startsWith("/dashboard") || path.startsWith("/admin");

  return (
    <header className={cn("sticky top-0 z-50 border-b border-line/80 bg-white/90 backdrop-blur-md", app && "bg-white")}>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2">Skip to content</a>
      <div className={cn("mx-auto flex h-16 items-center gap-6 px-5 lg:px-8", app ? "max-w-none" : "max-w-[1360px]")}>
        <Link href="/" aria-label="Riyah home" className="shrink-0"><Logo /></Link>
        <nav aria-label="Main" className="hidden items-center gap-0.5 xl:flex">
          {NAV.map((n) => {
            const active = path === n.href || path.startsWith(n.href + "/");
            return (
              <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined}
                className={cn("relative rounded-lg px-3 py-2 text-[14px] font-semibold transition-colors",
                  active ? "text-palm-900" : "text-ink-2 hover:text-ink")}>
                {n.key === "nav.agent" && <Sparkles size={13} className="-mt-0.5 me-1 inline text-gold-600" />}
                {t(n.key)}
                {active && <span className="absolute inset-x-3 -bottom-[13px] h-[2px] rounded-full bg-palm-900" />}
              </Link>
            );
          })}
        </nav>
        <div className="ms-auto flex items-center gap-1">
          <LanguageSwitcher className="hidden sm:inline-flex" />
          <Link href="/saved" className="relative hidden h-10 items-center gap-1.5 rounded-xl px-3 text-[14px] font-semibold text-ink-2 hover:bg-ink/5 md:inline-flex">
            <Heart size={17} />{t("nav.saved")}
            {hydrated && saved.length > 0 && <span className="num grid h-5 min-w-5 place-items-center rounded-full bg-gold-600 px-1 text-[11px] text-white">{saved.length}</span>}
          </Link>
          {hydrated && user
            ? <Link href="/profile" className="ms-1 hidden h-9 w-9 place-items-center rounded-full bg-palm-100 text-[13px] font-bold text-palm-900 md:grid" aria-label="Your profile">{user.initials}</Link>
            : <Link href="/sign-in" className="hidden h-10 items-center rounded-xl px-3 text-[14px] font-semibold text-ink-2 hover:bg-ink/5 md:inline-flex">{t("nav.signIn")}</Link>}
          <Button asChild size="md" className="ms-2 hidden sm:inline-flex"><Link href="/agent"><Sparkles size={16} className="text-gold-400" />{t("nav.ask")}</Link></Button>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-xl hover:bg-ink/5 xl:hidden" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-line bg-white px-5 pb-5 pt-2 xl:hidden animate-fade-in">
          <nav aria-label="Mobile" className="grid grid-cols-2 gap-1">
            {NAV.map((n) => <Link key={n.href} href={n.href} className="rounded-xl px-3 py-3 text-[15px] font-semibold hover:bg-canvas">{t(n.key)}</Link>)}
            <Link href="/neighborhoods" className="rounded-xl px-3 py-3 text-[15px] font-semibold hover:bg-canvas">{t("nav.neighborhoods")}</Link>
            <Link href="/compare" className="rounded-xl px-3 py-3 text-[15px] font-semibold hover:bg-canvas">Compare</Link>
          </nav>
          <div className="mt-3 flex items-center gap-2 border-t border-line pt-3"><LanguageSwitcher /><Link href={user ? "/profile" : "/sign-in"} className="text-sm font-semibold text-ink-2">{user ? user.name : t("nav.signIn")}</Link></div>
        </div>
      )}
    </header>
  );
}
