"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bookmark, Clock, Heart, LayoutDashboard, LogOut, Shield } from "lucide-react";
import { useApp } from "@/lib/store";
import { mockAuth } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState, Skeleton } from "@/components/ui/misc";
import { LanguageSwitcher } from "@/components/layout/Header";

export function ProfileView() {
  const { user, setUser, saved, searches, recent, hydrated, toast } = useApp();
  const router = useRouter();
  if (!hydrated) return <div className="mx-auto max-w-3xl px-5 py-12"><Skeleton className="h-40 w-full rounded-2xl" /></div>;
  if (!user) return <div className="mx-auto max-w-3xl px-5 py-16"><EmptyState icon={<Shield size={22} />} title="You’re not signed in" body="Sign in to see your profile, saved properties and conversations." action={<div className="flex gap-2"><Button asChild variant="secondary"><Link href="/sign-up">Create account</Link></Button><Button asChild><Link href="/sign-in">Sign in</Link></Button></div>} /></div>;
  const signOut = async () => { await mockAuth.signOut(); setUser(null); toast("Signed out"); router.push("/"); };
  return (
    <div className="mx-auto max-w-3xl px-5 pb-28 pt-10">
      <div className="surface flex flex-wrap items-center gap-5 p-6">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-palm-900 text-xl font-bold text-white">{user.initials}</span>
        <div className="flex-1"><h1 className="text-title">{user.name}</h1><p className="text-[14px] text-ink-3">{user.email}</p><Badge tone="palm" className="mt-2 capitalize">{user.role}</Badge></div>
        <Button variant="secondary" onClick={signOut}><LogOut size={15} />Sign out</Button>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {[{ i: Heart, l: "Saved properties", v: saved.length }, { i: Bookmark, l: "Saved searches", v: searches.length }, { i: Clock, l: "Recently viewed", v: recent.length }].map(({ i: I, l, v }) => (
          <Link key={l} href="/saved" className="surface p-5 hover:shadow-lift"><I size={18} className="text-palm-700" /><p className="num mt-3 text-[24px] font-bold">{v}</p><p className="text-[13px] text-ink-3">{l}</p></Link>))}
      </div>
      <div className="surface mt-5 divide-y divide-line">
        <div className="flex items-center justify-between p-5"><div><p className="font-semibold">Language</p><p className="text-[13px] text-ink-3">English or Arabic (right-to-left)</p></div><LanguageSwitcher /></div>
        {user.role !== "buyer" && <Link href={user.role === "admin" ? "/admin" : "/dashboard"} className="flex items-center justify-between p-5 hover:bg-canvas"><span className="flex items-center gap-2 font-semibold"><LayoutDashboard size={16} />{user.role === "admin" ? "Admin console" : "Agent dashboard"}</span><span className="text-ink-4">→</span></Link>}
        <div className="p-5 text-[13px] text-ink-3">This profile is stored in your browser only (mock auth). Swap <code>services/auth.ts</code> for Supabase, Firebase or Auth.js to persist accounts.</div>
      </div>
    </div>
  );
}
