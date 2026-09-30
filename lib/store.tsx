"use client";
// Client app state: language, saved properties, comparison tray, recently viewed,
// saved searches, mock user and toasts. Persistence uses localStorage behind a
// small adapter so it can be swapped for a user API later.
import * as React from "react";
import { dictionaries, type DictKey, type Lang } from "@/lib/i18n/dictionaries";
import type { SearchCriteria } from "@/types";
import type { User } from "@/services/auth";

export interface SavedSearch { id: string; label: string; criteria: SearchCriteria; createdAt: string }
interface Toast { id: number; message: string; tone?: "default" | "success" }

interface State {
  lang: Lang; dir: "ltr" | "rtl"; setLang: (l: Lang) => void; t: (k: DictKey) => string;
  saved: string[]; toggleSaved: (id: string) => void; isSaved: (id: string) => boolean; save: (id: string) => void;
  compare: string[]; toggleCompare: (id: string) => void; clearCompare: () => void; setCompare: (ids: string[]) => void;
  recent: string[]; pushRecent: (id: string) => void;
  searches: SavedSearch[]; saveSearch: (s: Omit<SavedSearch, "id" | "createdAt">) => void; removeSearch: (id: string) => void;
  user: User | null; setUser: (u: User | null) => void;
  toast: (message: string, tone?: Toast["tone"]) => void;
  hydrated: boolean;
}

const Ctx = React.createContext<State | null>(null);
const KEY = "riyah:v1";

const storage = {
  load(): Partial<Pick<State, "lang" | "saved" | "compare" | "recent" | "searches" | "user">> {
    try { return JSON.parse(localStorage.getItem(KEY) ?? "{}"); } catch { return {}; }
  },
  save(v: object) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch { /* storage unavailable */ } },
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = React.useState(false);
  const [lang, setLangState] = React.useState<Lang>("en");
  const [saved, setSaved] = React.useState<string[]>([]);
  const [compare, setCompareState] = React.useState<string[]>([]);
  const [recent, setRecent] = React.useState<string[]>([]);
  const [searches, setSearches] = React.useState<SavedSearch[]>([]);
  const [user, setUser] = React.useState<User | null>(null);
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  React.useEffect(() => {
    const s = storage.load();
    if (s.lang) setLangState(s.lang);
    setSaved(s.saved ?? []); setCompareState(s.compare ?? []); setRecent(s.recent ?? []);
    setSearches(s.searches ?? []); setUser(s.user ?? null); setHydrated(true);
  }, []);
  React.useEffect(() => { if (hydrated) storage.save({ lang, saved, compare, recent, searches, user }); }, [hydrated, lang, saved, compare, recent, searches, user]);
  React.useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const toast = React.useCallback((message: string, tone: Toast["tone"] = "default") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const value: State = {
    lang, dir: lang === "ar" ? "rtl" : "ltr", setLang: setLangState,
    t: (k) => dictionaries[lang][k] ?? dictionaries.en[k],
    saved, isSaved: (id) => saved.includes(id),
    save: (id) => setSaved((s) => (s.includes(id) ? s : [id, ...s])),
    toggleSaved: (id) => setSaved((s) => {
      const on = s.includes(id); toast(on ? "Removed from saved" : "Saved to your list", on ? "default" : "success");
      return on ? s.filter((x) => x !== id) : [id, ...s];
    }),
    compare,
    toggleCompare: (id) => setCompareState((c) => {
      if (c.includes(id)) return c.filter((x) => x !== id);
      if (c.length >= 4) { toast("You can compare up to 4 properties"); return c; }
      return [...c, id];
    }),
    clearCompare: () => setCompareState([]), setCompare: (ids) => setCompareState(ids.slice(0, 4)),
    recent, pushRecent: (id) => setRecent((r) => [id, ...r.filter((x) => x !== id)].slice(0, 12)),
    searches,
    saveSearch: (s) => { setSearches((x) => [{ ...s, id: String(Date.now()), createdAt: new Date().toISOString() }, ...x].slice(0, 20)); toast("Search saved", "success"); },
    removeSearch: (id) => setSearches((x) => x.filter((s) => s.id !== id)),
    user, setUser, toast, hydrated,
  };

  return <Ctx.Provider value={value}>
    {children}
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-[90] flex flex-col items-center gap-2 px-4 lg:bottom-8">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto flex items-center gap-2.5 rounded-2xl bg-ink px-4 py-3 text-sm font-medium text-white shadow-lift animate-fade-in">
          {t.tone === "success" && <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />}{t.message}
        </div>
      ))}
    </div>
  </Ctx.Provider>;
}

export function useApp() {
  const c = React.useContext(Ctx);
  if (!c) throw new Error("useApp must be used inside AppProvider");
  return c;
}
