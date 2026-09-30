import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-5 py-24 text-center">
      <LogoMark className="h-12 w-12" />
      <p className="num mt-6 text-[13px] font-bold uppercase tracking-[.16em] text-gold-700">404</p>
      <h1 className="mt-2 text-display">This page has moved on</h1>
      <p className="mt-3 text-ink-3">The listing may have been sold or removed, or the link is incorrect. Raed can find you similar options.</p>
      <div className="mt-8 flex gap-2"><Button asChild variant="secondary"><Link href="/buy">Browse properties</Link></Button><Button asChild><Link href="/agent">Ask AI Agent</Link></Button></div>
    </div>
  );
}
