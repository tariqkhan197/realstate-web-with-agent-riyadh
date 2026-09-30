"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/brand/Logo";
import { mockAuth } from "@/services/auth";
import { useApp } from "@/lib/store";

type Mode = "sign-in" | "sign-up" | "forgot";

function GoogleIcon() {
  return <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>;
}

export function AuthForm({ mode }: { mode: Mode }) {
  const { setUser, toast } = useApp();
  const router = useRouter();
  const [busy, setBusy] = React.useState<"form" | "google" | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);

  const done = (name: string) => { toast(`Welcome, ${name.split(" ")[0]}`, "success"); router.push("/profile"); };
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setError(null); setBusy("form");
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") ?? ""), password = String(f.get("password") ?? "");
    try {
      if (mode === "forgot") { await mockAuth.requestPasswordReset(email); setSent(true); }
      else { const u = mode === "sign-in" ? await mockAuth.signIn(email, password) : await mockAuth.signUp(String(f.get("name") ?? ""), email, password); setUser(u); done(u.name); }
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong."); }
    setBusy(null);
  };
  const google = async () => { setBusy("google"); const u = await mockAuth.signInWithGoogle(); setUser(u); setBusy(null); done(u.name); };

  const title = { "sign-in": "Welcome back", "sign-up": "Create your account", forgot: "Reset your password" }[mode];
  const sub = { "sign-in": "Sign in to sync saved properties and conversations.", "sign-up": "Save properties, keep your shortlists and pick up conversations with Raed.", forgot: "We’ll email you a link to choose a new password." }[mode];

  return (
    <div className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <div className="flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-sm">
          <LogoMark className="h-10 w-10" />
          <h1 className="mt-6 text-display">{title}</h1>
          <p className="mt-2 text-[14.5px] text-ink-3">{sub}</p>
          {sent ? (
            <div className="mt-8 rounded-2xl border border-palm-200 bg-palm-50 p-5 text-[14px]" role="status"><p className="flex items-center gap-2 font-semibold text-palm-900"><MailCheck size={17} />Check your inbox</p><p className="mt-1 text-ink-2">If an account exists for that email, a reset link is on its way. (Demo — no email is sent.)</p></div>
          ) : (<>
            {mode !== "forgot" && <>
              <Button variant="secondary" size="lg" className="mt-8 w-full" onClick={google} disabled={!!busy}>{busy === "google" ? <Loader2 size={16} className="animate-spin" /> : <GoogleIcon />}Continue with Google</Button>
              <div className="my-6 flex items-center gap-3 text-[12px] text-ink-4"><span className="h-px flex-1 bg-line" />or with email<span className="h-px flex-1 bg-line" /></div>
            </>}
            <form onSubmit={submit} className={mode === "forgot" ? "mt-8 space-y-4" : "space-y-4"} noValidate>
              {mode === "sign-up" && <div><label className="label" htmlFor="name">Full name</label><input id="name" name="name" autoComplete="name" className="field" required /></div>}
              <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="email" className="field" required /></div>
              {mode !== "forgot" && <div>
                <div className="flex justify-between"><label className="label" htmlFor="password">Password</label>{mode === "sign-in" && <Link href="/forgot-password" className="text-[13px] font-semibold text-palm-700">Forgot password?</Link>}</div>
                <input id="password" name="password" type="password" autoComplete={mode === "sign-in" ? "current-password" : "new-password"} className="field" required minLength={6} />
              </div>}
              {error && <p role="alert" className="rounded-xl bg-danger-50 px-3 py-2 text-[13.5px] text-danger">{error}</p>}
              <Button type="submit" size="lg" className="w-full" disabled={!!busy}>{busy === "form" && <Loader2 size={16} className="animate-spin" />}{mode === "sign-in" ? "Sign in" : mode === "sign-up" ? "Create account" : "Send reset link"}</Button>
            </form>
          </>)}
          <p className="mt-6 text-center text-[14px] text-ink-3">
            {mode === "sign-in" ? <>New to Riyah? <Link href="/sign-up" className="font-semibold text-palm-700">Create an account</Link></> : <>Already have an account? <Link href="/sign-in" className="font-semibold text-palm-700">Sign in</Link></>}
          </p>
          <p className="mt-4 text-center text-[12px] text-ink-4">Demo authentication — any email and a 6+ character password work. Emails starting with “agent” or “admin” get those roles.</p>
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-palm-950 lg:block">
        <svg className="absolute inset-0 h-full w-full opacity-[.08]" aria-hidden="true"><defs><pattern id="p" width="56" height="56" patternUnits="userSpaceOnUse"><path d="M28 4 L34 22 L52 28 L34 34 L28 52 L22 34 L4 28 L22 22 Z" fill="none" stroke="#C9A962" /></pattern></defs><rect width="100%" height="100%" fill="url(#p)" /></svg>
        <div className="relative flex h-full flex-col justify-end p-14 text-white">
          <p className="text-[12px] font-bold uppercase tracking-[.16em] text-gold-400">Raed · AI Real Estate Agent</p>
          <p className="mt-4 max-w-md text-[28px] font-bold leading-tight">“Tell me what you need. I’ll search, filter, compare and finance-check the options for you.”</p>
          <p className="mt-6 max-w-md text-[14px] text-white/60">Your saved properties, shortlists and conversations follow you across devices once you sign in.</p>
        </div>
      </div>
    </div>
  );
}
