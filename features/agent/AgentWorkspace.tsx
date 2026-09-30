"use client";
import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowUp, Bookmark, Check, ChevronDown, History, Loader2, MapPin, MessageSquarePlus, PanelLeft, PanelRight,
  RotateCcw, Sparkles, Trash2, TriangleAlert, Wrench, X,
} from "lucide-react";
import { AgentAvatar } from "@/components/brand/AgentAvatar";
import { MatchBadge, VerificationBadge } from "@/components/property/Badges";
import { Specs, locationLine } from "@/components/property/PropertyCard";
import { PropertyPhoto, coverOf } from "@/components/property/PropertyImage";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";
import { criteriaToQuery } from "@/lib/ai/describe";
import { getPropertyById } from "@/services/propertySearch";
import { cn, formatSAR, sleep, uid } from "@/lib/utils";
import type { AgentContext, AgentPhase, AgentReply, AgentStep } from "@/lib/ai/types";
import type { MatchResult } from "@/types";
import { BlockView, type BlockActions } from "./blocks";

// ---------------------------------------------------------------- state
interface UIMessage { id: string; role: "user" | "assistant"; content: string; reply?: AgentReply; error?: boolean }
interface Conversation { id: string; title: string; updatedAt: string; messages: UIMessage[]; context: AgentContext }

const STORE_KEY = "riyah:agent:v1";
const loadConvos = (): Conversation[] => { try { return JSON.parse(localStorage.getItem(STORE_KEY) ?? "[]"); } catch { return []; } };
const saveConvos = (c: Conversation[]) => { try { localStorage.setItem(STORE_KEY, JSON.stringify(c.slice(0, 12))); } catch { /* quota */ } };
const newConvo = (context: AgentContext = {}): Conversation => ({ id: uid(), title: "New conversation", updatedAt: new Date().toISOString(), messages: [], context });

const STEP_MS = 520;
const EXAMPLES = [
  "I have SAR 800,000 and want a family apartment in West Riyadh with at least 4 bedrooms.",
  "Find 4-bedroom apartments under SAR 800K.",
  "Villa in North Riyadh with a pool under 3M",
  "Tell me about Al Malqa",
];
const TOOLS = ["searchProperties", "filterProperties", "createShortlist", "compareProperties", "calculateMortgage", "analyzeInvestment", "findSimilarProperties", "getNeighborhoodInfo", "saveProperty"];
const PHASE_LABEL: Record<AgentPhase, string> = { thinking: "Thinking", searching: "Searching", analyzing: "Analyzing", comparing: "Comparing", completed: "Completed" };

// ---------------------------------------------------------------- tool ledger
function ToolLedger({ steps, revealed, live }: { steps: AgentStep[]; revealed: number; live: boolean }) {
  const [open, setOpen] = React.useState(true);
  React.useEffect(() => { if (!live && revealed >= steps.length && steps.length > 4) { const t = setTimeout(() => setOpen(false), 2400); return () => clearTimeout(t); } }, [live, revealed, steps.length]);
  if (!steps.length) return null;
  const done = Math.min(revealed, steps.length);
  return (
    <div className="rounded-2xl border border-line bg-white">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center gap-2 px-4 py-3 text-start">
        <Wrench size={14} className="text-palm-700" />
        <span className="text-[12.5px] font-bold uppercase tracking-[.1em] text-ink-2">Tool execution</span>
        <span className="num text-[12.5px] text-ink-3">{done}/{steps.length}</span>
        <span className="ms-auto h-1 w-20 overflow-hidden rounded-full bg-ink/[.07]"><span className="block h-full rounded-full bg-palm-700 transition-[width] duration-300" style={{ width: `${(done / steps.length) * 100}%` }} /></span>
        <ChevronDown size={15} className={cn("text-ink-3 transition-transform", open && "rotate-180")} />
      </button>
      {open && <ol className="border-t border-line px-4 py-2" aria-live="polite">
        {steps.map((s, i) => {
          const state = i < done ? "done" : i === done && live ? "running" : "pending";
          return (
            <li key={s.id} className={cn("flex items-start gap-3 py-2", state === "pending" && "opacity-40")}>
              <span className={cn("mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full", state === "done" ? "bg-palm-700 text-white" : state === "running" ? "bg-gold-50 text-gold-700" : "border border-line-strong")}>
                {state === "done" ? <Check size={12} strokeWidth={3} /> : state === "running" ? <Loader2 size={12} className="animate-spin" /> : null}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-semibold">{s.label}</p>
                {state === "done" && s.detail && <p className="num text-[12.5px] text-ink-3">{s.detail}</p>}
              </div>
              {s.tool && s.tool !== "understand" && s.tool !== "rank" && <code className="mt-0.5 hidden shrink-0 rounded-md bg-canvas px-1.5 py-0.5 font-mono text-[11px] text-ink-3 sm:block">{s.tool}()</code>}
            </li>
          );
        })}
      </ol>}
    </div>
  );
}

function RichText({ text }: { text: string }) {
  return <div className="space-y-2 text-[14.5px] leading-relaxed text-ink">
    {text.split("\n\n").map((para, i) => {
      const lines = para.split("\n");
      const bullets = lines.filter((l) => l.startsWith("• "));
      if (bullets.length && bullets.length === lines.length - (lines[0].startsWith("• ") ? 0 : 1)) {
        const head = lines[0].startsWith("• ") ? null : lines[0];
        return <div key={i}>{head && <p>{head}</p>}<ul className="mt-1 space-y-1">{bullets.map((b) => <li key={b} className="flex gap-2"><span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold-600" />{b.slice(2)}</li>)}</ul></div>;
      }
      return <p key={i} className="whitespace-pre-line">{para}</p>;
    })}
  </div>;
}

// ---------------------------------------------------------------- workspace
export function AgentWorkspace() {
  const params = useSearchParams();
  const { hydrated, searches, recent, t, toast } = useApp();
  const [convos, setConvos] = React.useState<Conversation[]>([]);
  const [activeId, setActiveId] = React.useState<string>("");
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [status, setStatus] = React.useState<{ text: string; phase: AgentPhase } | null>(null);
  const [reveal, setReveal] = React.useState<{ msgId: string; count: number } | null>(null);
  const [leftOpen, setLeftOpen] = React.useState(false);
  const [rightOpen, setRightOpen] = React.useState(false);
  const prevCtx = React.useRef<AgentContext>({});
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const booted = React.useRef(false);

  const convo = convos.find((c) => c.id === activeId);
  const ctx = convo?.context ?? {};

  const update = React.useCallback((id: string, fn: (c: Conversation) => Conversation) => {
    setConvos((cs) => { const next = cs.map((c) => (c.id === id ? fn(c) : c)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)); saveConvos(next); return next; });
  }, []);

  // ---- send a message through the agent API, then replay its tool steps
  const send = React.useCallback(async (text: string, convId: string, base?: Conversation, ctxOverride?: AgentContext) => {
    const q = text.trim();
    if (!q) return;
    const found = base ?? loadConvos().find((c) => c.id === convId);
    if (!found) return;
    const current = ctxOverride ? { ...found, context: ctxOverride } : found;
    prevCtx.current = current.context;
    const userMsg: UIMessage = { id: uid(), role: "user", content: q };
    const history = [...current.messages, userMsg];
    update(convId, (c) => ({ ...c, context: current.context, messages: history, title: c.messages.length ? c.title : q.slice(0, 60), updatedAt: new Date().toISOString() }));
    setInput(""); setBusy(true); setStatus({ text: "Understanding your request…", phase: "thinking" });

    try {
      const [res] = await Promise.all([
        fetch("/api/agent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: history.filter((m) => !m.error).map((m) => ({ role: m.role, content: m.content })), context: current.context }) }),
        sleep(450),
      ]);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Request failed");
      const reply = data as AgentReply;
      const msg: UIMessage = { id: reply.id, role: "assistant", content: reply.text, reply };
      update(convId, (c) => ({ ...c, messages: [...history, msg], context: reply.context, updatedAt: new Date().toISOString() }));
      // animate the tool ledger
      for (let i = 0; i < reply.steps.length; i++) {
        setReveal({ msgId: msg.id, count: i });
        setStatus({ text: reply.steps[i].status, phase: reply.steps[i].phase });
        await sleep(STEP_MS);
      }
      setReveal(null);
      setStatus({ text: reply.steps.at(-1)?.status ?? "Done.", phase: "completed" });
    } catch (e) {
      const msg: UIMessage = { id: uid(), role: "assistant", content: e instanceof Error ? e.message : "Something went wrong.", error: true };
      update(convId, (c) => ({ ...c, messages: [...history, msg] }));
      setStatus(null);
    } finally {
      setBusy(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [update]);

  // ---- boot: restore history, then honour ?property= and ?q=
  React.useEffect(() => {
    if (!hydrated || booted.current) return;
    booted.current = true;
    const stored = loadConvos();
    const pid = params.get("property") ?? undefined;
    const q = params.get("q") ?? undefined;
    const validPid = pid && getPropertyById(pid) ? pid : undefined;
    if (validPid || q || !stored.length) {
      const c = newConvo(validPid ? { activePropertyId: validPid } : {});
      if (validPid) c.title = `About ${locationLine(getPropertyById(validPid)!).hood} listing`;
      const all = [c, ...stored]; setConvos(all); saveConvos(all); setActiveId(c.id);
      if (q) void send(q, c.id, c);
    } else { setConvos(stored); setActiveId(stored[0].id); }
  }, [hydrated, params, send]);

  React.useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [convo?.messages.length, reveal?.count]);

  const startNew = (context: AgentContext = {}) => {
    const c = newConvo(context);
    setConvos((cs) => { const n = [c, ...cs]; saveConvos(n); return n; });
    setActiveId(c.id); setStatus(null); setLeftOpen(false);
    return c;
  };
  const removeConvo = (id: string) => {
    setConvos((cs) => { const n = cs.filter((c) => c.id !== id); saveConvos(n); if (id === activeId) setActiveId(n[0]?.id ?? ""); return n; });
  };
  const submit = (text: string) => {
    if (busy) return;
    if (!convo) { const c = startNew(); void send(text, c.id, c); return; }
    void send(text, convo.id);
  };
  const actions: BlockActions = {
    ask: (pid, q) => { if (!convo || busy) return; void send(q, convo.id, undefined, { ...convo.context, activePropertyId: pid }); },
    focus: (pid) => { if (convo && convo.context.activePropertyId !== pid && !busy) update(convo.id, (c) => ({ ...c, context: { ...c.context, activePropertyId: pid } })); },
  };
  const loadProperty = (pid: string) => {
    if (!convo) { startNew({ activePropertyId: pid }); return; }
    update(convo.id, (c) => ({ ...c, context: { ...c.context, activePropertyId: pid } }));
    toast("Property loaded into the agent's context", "success"); setLeftOpen(false);
  };

  // ---- derived: last results / criteria for the intelligence panel
  // While the tool ledger is still animating, the side panel keeps showing the previous state so results "land" when the run completes.
  const replies = (convo?.messages ?? []).filter((m) => m.reply && m.id !== reveal?.msgId).map((m) => m.reply!);
  const lastResults = [...replies].reverse().flatMap((r) => r.blocks).find((b) => b.kind === "results") as Extract<AgentReply["blocks"][number], { kind: "results" }> | undefined;
  const lastCriteria = [...replies].reverse().flatMap((r) => r.blocks).find((b) => b.kind === "criteria") as Extract<AgentReply["blocks"][number], { kind: "criteria" }> | undefined;
  const toolCounts = replies.flatMap((r) => r.steps).reduce<Record<string, number>>((a, s) => { if (s.tool && TOOLS.includes(s.tool)) a[s.tool] = (a[s.tool] ?? 0) + 1; return a; }, {});
  const panelPid = reveal ? prevCtx.current.activePropertyId : ctx.activePropertyId;
  const active = panelPid ? getPropertyById(panelPid) : undefined;
  const activeMatch = lastResults?.results.find((r) => r.property.id === active?.id);
  const working = busy || !!reveal;
  const provider = replies.at(-1)?.provider ?? "mock";

  // ---------------------------------------------------------------- panels
  const Sidebar = (
    <div className="flex h-full flex-col">
      <div className="p-3"><Button className="w-full" onClick={() => startNew()}><MessageSquarePlus size={16} />{t("agent.newChat")}</Button></div>
      <div className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
        <section aria-label={t("agent.history")}>
          <h2 className="mb-1.5 flex items-center gap-1.5 px-2 text-[11.5px] font-bold uppercase tracking-[.1em] text-ink-3"><History size={12} />{t("agent.history")}</h2>
          {convos.length === 0 && <p className="px-2 text-[13px] text-ink-4">No conversations yet.</p>}
          <ul className="space-y-0.5">{convos.map((c) => (
            <li key={c.id} className="group relative">
              <button type="button" onClick={() => { setActiveId(c.id); setLeftOpen(false); setStatus(null); }} aria-current={c.id === activeId}
                className={cn("w-full rounded-xl px-2.5 py-2 pe-8 text-start", c.id === activeId ? "bg-white shadow-ring" : "hover:bg-white/70")}>
                <p className="truncate text-[13.5px] font-semibold">{c.title}</p>
                <p className="num text-[11.5px] text-ink-4">{c.messages.filter((m) => m.role === "user").length} messages · {new Date(c.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p>
              </button>
              <button type="button" onClick={() => removeConvo(c.id)} aria-label={`Delete conversation ${c.title}`} className="absolute end-1.5 top-2.5 grid h-6 w-6 place-items-center rounded-md text-ink-4 opacity-0 hover:bg-ink/5 hover:text-danger focus:opacity-100 group-hover:opacity-100"><Trash2 size={13} /></button>
            </li>
          ))}</ul>
        </section>
        <section aria-label={t("agent.savedSearches")}>
          <h2 className="mb-1.5 flex items-center gap-1.5 px-2 text-[11.5px] font-bold uppercase tracking-[.1em] text-ink-3"><Bookmark size={12} />{t("agent.savedSearches")}</h2>
          {searches.length === 0 ? <p className="px-2 text-[13px] text-ink-4">Save a search from <Link href="/buy" className="font-semibold text-palm-700">Buy</Link> to re-run it here.</p>
            : <ul className="space-y-0.5">{searches.slice(0, 6).map((s) => <li key={s.id}><button type="button" onClick={() => { submit(criteriaToQuery(s.criteria)); setLeftOpen(false); }} className="w-full truncate rounded-xl px-2.5 py-2 text-start text-[13px] font-medium text-ink-2 hover:bg-white/70">{s.label}</button></li>)}</ul>}
        </section>
        <section aria-label={t("agent.recent")}>
          <h2 className="mb-1.5 flex items-center gap-1.5 px-2 text-[11.5px] font-bold uppercase tracking-[.1em] text-ink-3"><MapPin size={12} />{t("agent.recent")}</h2>
          {recent.length === 0 ? <p className="px-2 text-[13px] text-ink-4">Properties you view appear here.</p>
            : <ul className="space-y-1">{recent.slice(0, 5).map((id) => { const p = getPropertyById(id); if (!p) return null; return (
              <li key={id}><button type="button" onClick={() => loadProperty(id)} className="flex w-full items-center gap-2.5 rounded-xl p-1.5 text-start hover:bg-white/70">
                <PropertyPhoto image={coverOf(p)} className="h-10 w-12 shrink-0 rounded-lg" sizes="48px" />
                <span className="min-w-0"><span className="num block text-[13px] font-bold">{formatSAR(p.price, { compact: true })}</span><span className="block truncate text-[12px] text-ink-3">{locationLine(p).hood} · {p.bedrooms} bd</span></span>
              </button></li>); })}</ul>}
        </section>
      </div>
    </div>
  );

  const Intelligence = (
    <div className="h-full space-y-4 overflow-y-auto p-4">
      <div className="flex items-center justify-between"><h2 className="text-[11.5px] font-bold uppercase tracking-[.1em] text-ink-3">Property intelligence</h2><button type="button" onClick={() => setRightOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-ink/5 xl:hidden" aria-label="Close panel"><X size={16} /></button></div>

      {active ? (
        <section className="overflow-hidden rounded-2xl border border-line bg-white" aria-label="Property in context">
          <div className="relative"><PropertyPhoto image={coverOf(active)} className="aspect-[16/10]" sizes="340px" />
            <span className="absolute start-3 top-3 rounded-full bg-ink/75 px-2.5 py-1 text-[11px] font-bold text-white">In context</span>
            <div className="absolute bottom-3 start-3"><VerificationBadge property={active} /></div></div>
          <div className="p-4">
            <div className="flex items-start justify-between gap-2"><p className="num text-xl font-bold tracking-tight">{formatSAR(active.price)}</p>{activeMatch && <MatchBadge percent={activeMatch.percent} />}</div>
            <p className="mt-0.5 text-[13px]"><span className="font-semibold">{locationLine(active).hood}</span><span className="text-ink-3"> · {locationLine(active).area}</span></p>
            <Specs p={active} className="mt-2" />
            {activeMatch && <div className="mt-4 space-y-1.5" aria-label="Match factors">
              {activeMatch.factors.map((f) => <div key={f.key} className="grid grid-cols-[76px_1fr_32px] items-center gap-2 text-[11.5px]"><span className="text-ink-3">{f.label}</span><span className="h-1.5 overflow-hidden rounded-full bg-ink/[.07]"><span className="block h-full rounded-full bg-palm-700" style={{ width: `${f.score * 100}%` }} /></span><span className="num text-end font-semibold">{Math.round(f.score * 100)}</span></div>)}
            </div>}
            <div className="mt-4 grid grid-cols-2 gap-1.5">
              {["What would my monthly payment be?", "Is this suitable for a family?", "What are the main things I should consider?", "Find similar properties."].map((q) => (
                <button key={q} type="button" disabled={working} onClick={() => submit(q)} className="rounded-lg border border-line px-2 py-2 text-start text-[12px] font-semibold leading-tight hover:border-palm-600 hover:text-palm-800 disabled:opacity-50">{q}</button>
              ))}
            </div>
            <Link href={`/property/${active.slug}`} className="mt-3 block text-center text-[13px] font-semibold text-palm-700 hover:underline">Open full listing →</Link>
          </div>
        </section>
      ) : (
        <div className="rounded-2xl border border-dashed border-line-strong p-5 text-center text-[13px] text-ink-3">Search or open a property and its details, match factors and quick actions appear here.</div>
      )}

      {lastCriteria && lastCriteria.items.length > 0 && <section className="rounded-2xl border border-line bg-white p-4" aria-label="Search brief">
        <h3 className="text-[13px] font-bold">Search brief</h3>
        <dl className="mt-2 space-y-1.5 text-[13px]">{lastCriteria.items.map((i) => <div key={i.label} className="flex justify-between gap-3"><dt className="text-ink-3">{i.label}</dt><dd className="text-end font-semibold">{i.value}</dd></div>)}</dl>
      </section>}

      {lastResults && lastResults.results.length > 0 && <section className="rounded-2xl border border-line bg-white p-4" aria-label="Shortlist">
        <div className="flex items-center justify-between"><h3 className="text-[13px] font-bold">Your shortlist</h3><span className="num text-[12px] text-ink-3">{lastResults.strong} strong · {lastResults.found} found</span></div>
        <ul className="mt-2 space-y-1">{lastResults.results.slice(0, 6).map((r: MatchResult, i) => (
          <li key={r.property.id}><button type="button" onClick={() => actions.focus(r.property.id)} className={cn("flex w-full items-center gap-2.5 rounded-xl p-1.5 text-start", r.property.id === active?.id ? "bg-palm-50" : "hover:bg-canvas")}>
            <span className="num w-4 text-center text-[12px] font-bold text-ink-3">{i + 1}</span>
            <PropertyPhoto image={coverOf(r.property)} className="h-9 w-11 shrink-0 rounded-md" sizes="44px" />
            <span className="min-w-0 flex-1"><span className="num block text-[12.5px] font-bold">{formatSAR(r.property.price, { compact: true })}</span><span className="block truncate text-[11.5px] text-ink-3">{locationLine(r.property).hood}</span></span>
            <span className="num text-[12px] font-bold text-palm-800">{r.percent}%</span>
          </button></li>
        ))}</ul>
      </section>}

      <section className="rounded-2xl border border-line bg-white p-4" aria-label="Agent tools">
        <h3 className="text-[13px] font-bold">Agent tools</h3>
        <ul className="mt-2 grid grid-cols-1 gap-1">{TOOLS.map((tool) => <li key={tool} className="flex items-center justify-between text-[12px]"><code className="font-mono text-ink-2">{tool}()</code><span className={cn("num rounded-full px-1.5 text-[11px] font-bold", toolCounts[tool] ? "bg-palm-100 text-palm-900" : "text-ink-4")}>{toolCounts[tool] ?? 0}</span></li>)}</ul>
        <p className="mt-3 text-[11.5px] text-ink-4">Provider: <span className="font-semibold">{provider}</span> · operating on demo listings.</p>
      </section>
    </div>
  );

  // ---------------------------------------------------------------- render
  const messages = convo?.messages ?? [];
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");

  return (
    <div className="grid h-[calc(100dvh-8rem)] grid-cols-1 bg-canvas lg:h-[calc(100dvh-4rem)] lg:grid-cols-[272px_minmax(0,1fr)] xl:grid-cols-[272px_minmax(0,1fr)_340px]">
      <aside className="hidden border-e border-line bg-canvas lg:block" aria-label="Agent sidebar">{Sidebar}</aside>

      {/* mobile drawers */}
      {leftOpen && <div className="fixed inset-0 z-[70] bg-ink/30 lg:hidden" onClick={() => setLeftOpen(false)}><div className="h-full w-[86%] max-w-xs bg-canvas shadow-lift animate-fade-in" onClick={(e) => e.stopPropagation()}>{Sidebar}</div></div>}
      {rightOpen && <div className="fixed inset-0 z-[70] bg-ink/30 xl:hidden" onClick={() => setRightOpen(false)}><div className="ms-auto h-full w-[92%] max-w-sm bg-canvas shadow-lift animate-fade-in" onClick={(e) => e.stopPropagation()}>{Intelligence}</div></div>}

      <section className="flex min-h-0 flex-col bg-white" aria-label="Conversation with Raed">
        {/* agent identity + live status */}
        <header className="flex items-center gap-3 border-b border-line px-4 py-3 sm:px-6">
          <button type="button" onClick={() => setLeftOpen(true)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-ink/5 lg:hidden" aria-label="Open conversations"><PanelLeft size={18} /></button>
          <AgentAvatar size={40} working={working} />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 font-bold">Raed <span className="rounded-full bg-gold-50 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-[.08em] text-gold-700">AI Real Estate Agent</span></p>
            <p className="flex items-center gap-1.5 truncate text-[12.5px] text-ink-3" aria-live="polite">
              <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", working ? "bg-gold-600 animate-pulse-dot" : "bg-palm-600")} />
              {working && status ? <><span className="font-semibold text-ink-2">{PHASE_LABEL[status.phase]}</span> · {status.text}</> : status?.phase === "completed" ? <><span className="font-semibold text-palm-700">Completed</span> · {status.text}</> : t("agent.online")}
            </p>
          </div>
          <button type="button" onClick={() => setRightOpen(true)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-ink/5 xl:hidden" aria-label="Open property intelligence"><PanelRight size={18} /></button>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6">
            {messages.length === 0 && (
              <div className="animate-fade-in pt-4">
                <AgentAvatar size={52} />
                <h1 className="mt-5 text-display">{active ? "Ask me anything about this property." : "Tell me what you're looking for."}</h1>
                <p className="mt-3 max-w-xl text-ink-2">{active
                  ? `${locationLine(active).hood} · ${formatSAR(active.price)} · ${active.bedrooms} beds is loaded in my context. I can check family suitability, run financing, analyze investment potential or find alternatives.`
                  : "I search the Riyah listings database, filter and rank matches, compare options, estimate financing and build your shortlist — and I show every step I take."}</p>
                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                  {(active ? ["Is this suitable for a family?", "What would my monthly payment be?", "What are the main things I should consider?", "Compare this with other apartments."] : EXAMPLES).map((q) => (
                    <button key={q} type="button" onClick={() => submit(q)} className="rounded-2xl border border-line bg-white p-4 text-start text-[14px] font-medium leading-snug shadow-card transition hover:border-palm-600 hover:shadow-lift">
                      <Sparkles size={14} className="mb-2 text-gold-600" />{q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => {
              if (m.role === "user") return <div key={m.id} className="flex justify-end"><p className="max-w-[85%] rounded-2xl rounded-ee-md bg-palm-900 px-4 py-3 text-[14.5px] leading-relaxed text-white">{m.content}</p></div>;
              const live = reveal?.msgId === m.id;
              const revealed = live ? reveal!.count : Infinity;
              const complete = !live;
              return (
                <div key={m.id} className="flex gap-3">
                  <AgentAvatar size={30} working={live} className="mt-1" />
                  <div className="min-w-0 flex-1 space-y-3">
                    {m.error ? (
                      <div className="flex items-start gap-3 rounded-2xl border border-danger/20 bg-danger-50 p-4 text-[14px] text-danger">
                        <TriangleAlert size={17} className="mt-0.5 shrink-0" /><div className="flex-1"><p className="font-semibold">I couldn&apos;t complete that.</p><p className="mt-0.5 text-ink-2">{m.content}</p></div>
                        <Button size="sm" variant="secondary" onClick={() => { const lastUser = [...messages].reverse().find((x) => x.role === "user"); if (lastUser && convo) { update(convo.id, (c) => ({ ...c, messages: c.messages.filter((x) => x.id !== m.id && x.id !== lastUser.id) })); setTimeout(() => submit(lastUser.content), 0); } }}><RotateCcw size={14} />Retry</Button>
                      </div>
                    ) : <>
                      {m.reply && <ToolLedger steps={m.reply.steps} revealed={revealed} live={live} />}
                      {complete && <div className="animate-fade-in space-y-3">
                        <RichText text={m.content} />
                        {m.reply?.blocks.map((b, i) => <BlockView key={i} block={b} actions={actions} />)}
                        {m === lastAssistant && !working && m.reply?.suggestions.length ? <div className="flex flex-wrap gap-1.5 pt-1">{m.reply.suggestions.map((s) => <button key={s} type="button" onClick={() => submit(s)} className="h-8 rounded-full border border-line bg-white px-3 text-[12.5px] font-semibold text-ink-2 hover:border-palm-600 hover:text-palm-800">{s}</button>)}</div> : null}
                      </div>}
                    </>}
                  </div>
                </div>
              );
            })}

            {busy && !reveal && <div className="flex gap-3"><AgentAvatar size={30} working className="mt-1" /><div className="flex items-center gap-2 rounded-2xl border border-line bg-white px-4 py-3 text-[13.5px] text-ink-2"><Loader2 size={14} className="animate-spin text-palm-700" />{status?.text ?? "Thinking…"}</div></div>}
          </div>
        </div>

        {/* composer */}
        <div className="border-t border-line bg-white px-4 pb-4 pt-3 sm:px-6">
          <form className="mx-auto max-w-3xl" onSubmit={(e) => { e.preventDefault(); submit(input); }}>
            {active && <div className="mb-2 flex items-center gap-2 text-[12px] text-ink-3"><span className="rounded-full bg-palm-50 px-2 py-0.5 font-semibold text-palm-800">Context: {locationLine(active).hood} · {formatSAR(active.price, { compact: true })}</span>
              <button type="button" className="font-semibold hover:text-ink" onClick={() => convo && update(convo.id, (c) => ({ ...c, context: { ...c.context, activePropertyId: undefined } }))}>Clear</button></div>}
            <div className="flex items-end gap-2 rounded-2xl border border-line-strong bg-white p-2 shadow-card focus-within:border-palm-600 focus-within:ring-4 focus-within:ring-palm-100">
              <label htmlFor="agent-input" className="sr-only">Message Raed</label>
              <textarea id="agent-input" ref={inputRef} rows={1} value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("agent.placeholder")}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(input); } }}
                className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2.5 text-[15px] outline-none placeholder:text-ink-4" />
              <Button type="submit" size="icon" disabled={busy || !input.trim()} aria-label={t("agent.send")}>{busy ? <Loader2 size={18} className="animate-spin" /> : <ArrowUp size={18} />}</Button>
            </div>
            <p className="mt-2 text-center text-[11.5px] text-ink-4">Raed works on demo listings. Financial figures are estimates, not advice.</p>
          </form>
        </div>
      </section>

      <aside className="hidden border-s border-line bg-canvas xl:block" aria-label="Property intelligence panel">{Intelligence}</aside>
    </div>
  );
}
