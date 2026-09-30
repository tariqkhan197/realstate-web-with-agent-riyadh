"use client";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";

export function HeroText() {
  const { t } = useApp();
  return (
    <>
      <h1 className="max-w-[15ch] text-display-xl text-ink">{t("hero.title")}</h1>
      <p className="mt-5 max-w-[52ch] text-[17px] leading-relaxed text-ink-2">{t("hero.sub")}</p>
      <div className="mt-7 flex flex-wrap gap-3">
        <Button asChild size="lg"><Link href="/agent"><Sparkles size={17} className="text-gold-400" />{t("hero.cta")}</Link></Button>
        <Button asChild size="lg" variant="secondary"><Link href="/buy">{t("hero.cta2")}</Link></Button>
      </div>
    </>
  );
}
