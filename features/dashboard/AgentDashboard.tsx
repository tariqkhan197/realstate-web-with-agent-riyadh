"use client";
import * as React from "react";
import Link from "next/link";
import { BarChart3, BadgeCheck, Bot, LayoutDashboard, List, MessageSquare, Plus, Send, ShieldCheck, Sparkles, User, Users } from "lucide-react";
import { DashboardShell, Table, type NavItem } from "@/components/dashboard/Shell";
import { BarList, LineChart, Metric } from "@/components/dashboard/Charts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PropertyThumb } from "@/components/property/PropertyImage";
import { agentListings, agentSeries, leads, listingStats, messages, DEMO_AGENT_ID, type LeadStage } from "@/data/dashboard";
import { getBroker } from "@/data/brokers";
import { getPropertyById } from "@/services/propertySearch";
import { answerBuyerQuestion } from "@/services/listingAI";
import { cn, formatDate, formatNumber, formatSAR } from "@/lib/utils";
import { useApp } from "@/lib/store";

type Section = "overview" | "listings" | "leads" | "ai-leads" | "messages" | "analytics" | "profile" | "verification";
const STAGE_TONE: Record<LeadStage, "neutral" | "palm" | "gold" | "solid" | "outline"> = { new: "gold", contacted: "neutral", viewing: "palm", negotiating: "outline", closed: "solid" };

const sum = (k: "views" | "saves" | "aiRecs" | "leads") => Object.values(listingStats).reduce((a, s) => a + s[k], 0);

export function AgentDashboard() {
  const [section, setSection] = React.useState<Section>("overview");
  const broker = getBroker(DEMO_AGENT_ID);
  const aiLeads = leads.filter((l) => l.source === "AI agent");
  const unread = messages.filter((m) => m.unread).length;
  const items: NavItem<Section>[] = [
    { key: "overview", label: "Overview", icon: LayoutDashboard }, { key: "listings", label: "Listings", icon: List },
    { key: "leads", label: "Leads", icon: Users }, { key: "ai-leads", label: "AI Leads", icon: Bot, badge: aiLeads.filter((l) => l.stage === "new").length },
    { key: "messages", label: "Messages", icon: MessageSquare, badge: unread }, { key: "analytics", label: "Analytics", icon: BarChart3 },
    { key: "profile", label: "Profile", icon: User }, { key: "verification", label: "Verification", icon: ShieldCheck },
  ];
  return (
    <DashboardShell title="Agent dashboard" badge="Agent workspace" subtitle={broker.company} items={items} active={section} onChange={setSection}
      actions={<Button asChild><Link href="/dashboard/new"><Plus size={16} />Create listing</Link></Button>}>
      {section === "overview" && <Overview go={setSection} />}
      {section === "listings" && <Listings />}
      {section === "leads" && <LeadsTable rows={leads} />}
      {section === "ai-leads" && <AiLeads />}
      {section === "messages" && <Messages />}
      {section === "analytics" && <Analytics />}
      {section === "profile" && <Profile />}
      {section === "verification" && <Verification />}
    </DashboardShell>
  );
}

function Overview({ go }: { go: (s: Section) => void }) {
  return <div className="space-y-6">
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      <Metric label="Active listings" value={String(Object.values(listingStats).filter((s) => s.status === "active").length)} />
      <Metric label="Views" value={formatNumber(sum("views"))} delta="+12.4%" />
      <Metric label="Saves" value={formatNumber(sum("saves"))} delta="+8.1%" />
      <Metric label="AI recommendations" value={formatNumber(sum("aiRecs"))} delta="+21.7%" />
      <Metric label="Leads" value={formatNumber(sum("leads"))} delta="+9.3%" className="col-span-2 lg:col-span-1" />
    </div>
    <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
      <div className="surface p-6"><h2 className="font-bold">Performance · last 30 days</h2><LineChart className="mt-4" data={agentSeries} series={[{ key: "views", label: "Views", color: "#145C45" }, { key: "aiRecs", label: "AI recommendations", color: "#A8843F" }]} /></div>
      <div className="surface p-6">
        <div className="flex items-center justify-between"><h2 className="font-bold">Newest AI leads</h2><Button variant="link" onClick={() => go("ai-leads")}>View all</Button></div>
        <ul className="mt-4 divide-y divide-line">{leads.filter((l) => l.source === "AI agent").slice(0, 4).map((l) => (
          <li key={l.id} className="flex items-center gap-3 py-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-palm-50 text-[12px] font-bold text-palm-900">{l.name.split(" ").map((x) => x[0]).join("").slice(0, 2)}</span>
            <div className="min-w-0 flex-1"><p className="truncate text-[14px] font-semibold">{l.name}</p><p className="truncate text-[12.5px] text-ink-3">{l.brief}</p></div>
            <span className="num text-[13px] font-bold text-palm-700">{l.match}%</span></li>))}</ul>
      </div>
    </div>
    <Listings compact />
  </div>;
}

function Listings({ compact }: { compact?: boolean }) {
  const { toast } = useApp();
  const [status, setStatus] = React.useState(() => Object.fromEntries(Object.entries(listingStats).map(([k, v]) => [k, v.status])));
  const rows = compact ? agentListings.slice(0, 4) : agentListings;
  return <div>
    {compact && <h2 className="mb-3 font-bold">Your listings</h2>}
    <Table head={["Listing", "Price", "Views", "Saves", "AI recs", "Leads", "Status", ""]}>
      {rows.map((p) => { const s = listingStats[p.id]; const st = status[p.id]; return (
        <tr key={p.id} className="hover:bg-canvas/60">
          <td className="px-4 py-3"><Link href={`/property/${p.slug}`} className="flex items-center gap-3"><PropertyThumb property={p} className="h-11 w-14 shrink-0 rounded-lg" /><span className="line-clamp-2 max-w-[260px] font-semibold">{p.title}</span></Link></td>
          <td className="num px-4 py-3 font-semibold">{formatSAR(p.price, { compact: true })}</td>
          <td className="num px-4 py-3">{formatNumber(s.views)}</td><td className="num px-4 py-3">{s.saves}</td><td className="num px-4 py-3">{s.aiRecs}</td><td className="num px-4 py-3">{s.leads}</td>
          <td className="px-4 py-3"><Badge tone={st === "active" ? "palm" : "neutral"}>{st === "active" ? "Active" : "Paused"}</Badge></td>
          <td className="px-4 py-3 text-end"><Button size="sm" variant="ghost" onClick={() => { setStatus((x) => ({ ...x, [p.id]: st === "active" ? "paused" : "active" })); toast(st === "active" ? "Listing paused" : "Listing re-activated", "success"); }}>{st === "active" ? "Pause" : "Activate"}</Button></td>
        </tr>); })}
    </Table>
  </div>;
}

function LeadsTable({ rows }: { rows: typeof leads }) {
  return <Table head={["Lead", "Property", "Source", "Budget", "Stage", "Received"]}>
    {rows.map((l) => { const p = getPropertyById(l.propertyId); return (
      <tr key={l.id}><td className="px-4 py-3"><p className="font-semibold">{l.name}</p><p className="text-[12px] text-ink-4">{l.id}</p></td>
        <td className="px-4 py-3"><span className="line-clamp-1 max-w-[240px]">{p?.title}</span></td>
        <td className="px-4 py-3">{l.source === "AI agent" ? <Badge tone="gold"><Sparkles size={11} />AI agent</Badge> : <Badge>{l.source}</Badge>}</td>
        <td className="num px-4 py-3">{formatSAR(l.budget, { compact: true })}</td>
        <td className="px-4 py-3"><Badge tone={STAGE_TONE[l.stage]} className="capitalize">{l.stage}</Badge></td>
        <td className="px-4 py-3 text-ink-3">{formatDate(l.at)}</td></tr>); })}
  </Table>;
}

function AiLeads() {
  const ai = leads.filter((l) => l.source === "AI agent");
  return <div className="space-y-5">
    <div className="rounded-2xl border border-gold-200 bg-gold-50 p-5 text-[14px] text-ink-2"><p className="font-semibold text-ink">Leads qualified by Raed</p><p className="mt-1">These buyers described their needs to the AI agent, received your listing in their shortlist and asked to be contacted. Each brief and match score comes from the agent’s scoring factors, not from a random number.</p></div>
    <div className="grid gap-4 md:grid-cols-2">{ai.map((l) => { const p = getPropertyById(l.propertyId); return (
      <div key={l.id} className="surface p-5">
        <div className="flex items-start justify-between gap-3"><div><p className="font-bold">{l.name}</p><p className="text-[12.5px] text-ink-3">{formatDate(l.at)} · {l.id}</p></div><span className="num rounded-full bg-palm-900 px-2.5 py-1 text-[12px] font-bold text-white">{l.match}% match</span></div>
        <p className="mt-3 text-[13.5px]"><span className="text-ink-3">Brief: </span>{l.brief}</p>
        <p className="mt-1 text-[13.5px]"><span className="text-ink-3">Budget: </span><span className="num">{formatSAR(l.budget)}</span></p>
        <p className="mt-1 line-clamp-1 text-[13.5px]"><span className="text-ink-3">Interested in: </span>{p?.title}</p>
        <div className="mt-4 flex gap-2"><Badge tone={STAGE_TONE[l.stage]} className="capitalize">{l.stage}</Badge></div>
      </div>); })}</div>
  </div>;
}

function Messages() {
  const { toast } = useApp();
  const [active, setActive] = React.useState(messages[0].id);
  const [threads, setThreads] = React.useState(() => Object.fromEntries(messages.map((m) => [m.id, m.thread])));
  const [draft, setDraft] = React.useState("");
  const m = messages.find((x) => x.id === active)!;
  const lead = leads.find((l) => l.id === m.leadId);
  const p = lead ? getPropertyById(lead.propertyId) : undefined;
  const suggest = () => {
    const last = [...threads[active]].reverse().find((x) => !x.me)?.t ?? "";
    setDraft(p ? answerBuyerQuestion(last, { type: p.type, purpose: p.purpose, neighborhood: p.neighborhood, bedrooms: p.bedrooms, bathrooms: p.bathrooms, area: p.area, price: p.price, features: p.features }) : "Thanks for your message — I'll get back to you shortly.");
  };
  const send = () => { if (!draft.trim()) return; setThreads((t) => ({ ...t, [active]: [...t[active], { me: true, t: draft.trim() }] })); setDraft(""); toast("Message sent (demo)", "success"); };
  return <div className="grid overflow-hidden rounded-2xl border border-line bg-white shadow-card md:grid-cols-[280px_1fr]">
    <ul className="divide-y divide-line border-b border-line md:border-b-0 md:border-e">{messages.map((x) => (
      <li key={x.id}><button type="button" onClick={() => setActive(x.id)} className={cn("w-full px-4 py-3.5 text-start", active === x.id ? "bg-palm-50" : "hover:bg-canvas")}>
        <div className="flex justify-between gap-2"><span className="text-[14px] font-semibold">{x.from}</span><span className="text-[12px] text-ink-4">{x.at}</span></div>
        <p className={cn("mt-0.5 truncate text-[13px]", x.unread ? "font-semibold text-ink" : "text-ink-3")}>{x.preview}</p></button></li>))}</ul>
    <div className="flex min-h-[420px] flex-col">
      <div className="border-b border-line px-5 py-3.5"><p className="font-bold">{m.from}</p>{p && <p className="truncate text-[12.5px] text-ink-3">Re: {p.title}</p>}</div>
      <div className="flex-1 space-y-3 overflow-y-auto p-5">{threads[active].map((x, i) => (
        <div key={i} className={cn("max-w-[80%] rounded-2xl px-4 py-2.5 text-[14px]", x.me ? "ms-auto bg-palm-900 text-white" : "bg-canvas")}>{x.t}</div>))}</div>
      <div className="border-t border-line p-4">
        <div className="flex gap-2"><label htmlFor="reply" className="sr-only">Reply</label><input id="reply" className="field flex-1" placeholder="Write a reply…" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
          <Button variant="secondary" onClick={suggest} title="Answer Buyer Questions (AI)"><Sparkles size={15} className="text-gold-600" /><span className="hidden sm:inline">AI reply</span></Button>
          <Button onClick={send} aria-label="Send"><Send size={15} /></Button></div>
      </div>
    </div>
  </div>;
}

function Analytics() {
  const top = [...agentListings].sort((a, b) => listingStats[b.id].views - listingStats[a.id].views).slice(0, 6);
  return <div className="space-y-6">
    <div className="surface p-6"><h2 className="font-bold">Leads per day</h2><LineChart className="mt-4" height={200} data={agentSeries} series={[{ key: "leads", label: "Leads", color: "#145C45" }]} /></div>
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="surface p-6"><h2 className="mb-4 font-bold">Most viewed listings</h2><BarList items={top.map((p) => ({ k: p.title, v: listingStats[p.id].views }))} /></div>
      <div className="surface p-6"><h2 className="mb-4 font-bold">Lead sources</h2><BarList items={(["AI agent", "Listing", "Map", "Compare"] as const).map((k) => ({ k, v: leads.filter((l) => l.source === k).length }))} /></div>
    </div>
  </div>;
}

function Profile() {
  const b = getBroker(DEMO_AGENT_ID); const { toast } = useApp();
  return <form className="surface max-w-2xl space-y-4 p-6" onSubmit={(e) => { e.preventDefault(); toast("Profile saved (demo)", "success"); }}>
    <div className="flex items-center gap-4"><span className="grid h-14 w-14 place-items-center rounded-full bg-palm-900 text-lg font-bold text-white">{b.initials}</span><div><p className="font-bold">{b.name}</p><p className="text-[13px] text-ink-3">{b.company}</p></div></div>
    <div className="grid gap-4 sm:grid-cols-2">
      <div><label className="label" htmlFor="pn">Full name</label><input id="pn" className="field" defaultValue={b.name} /></div>
      <div><label className="label" htmlFor="pc">Company</label><input id="pc" className="field" defaultValue={b.company} /></div>
      <div><label className="label" htmlFor="pp">Phone</label><input id="pp" className="field" defaultValue="+966 5" /></div>
      <div><label className="label" htmlFor="pl">Languages</label><input id="pl" className="field" defaultValue="Arabic, English" /></div>
    </div>
    <div><label className="label" htmlFor="pb">About</label><textarea id="pb" rows={4} className="field h-auto py-3" defaultValue="Residential specialist for West and North Riyadh. (Demo profile)" /></div>
    <Button type="submit">Save profile</Button>
  </form>;
}

function Verification() {
  const rows = [
    { k: "FAL brokerage licence", s: "Submitted", note: "Demo — connect to the official REGA verification service before launch." },
    { k: "Commercial registration", s: "Submitted", note: "Document uploaded (demo)." },
    { k: "Advertising licences on listings", s: `${agentListings.filter((p) => p.licensing.advertisingLicense).length}/${agentListings.length} listings`, note: "Listings without a licence number are hidden from search." },
    { k: "Identity verification", s: "Pending", note: "Awaiting Nafath integration (not implemented in demo)." },
  ];
  return <div className="max-w-3xl space-y-3">
    <div className="rounded-2xl border border-line bg-white p-5 text-[14px] text-ink-2"><p className="flex items-center gap-2 font-semibold text-ink"><BadgeCheck size={17} className="text-palm-700" />Verification status</p><p className="mt-1">Riyah never marks a listing as verified unless its licence data is present. This screen shows the checks a real integration would run — none are live in this demo.</p></div>
    {rows.map((r) => <div key={r.k} className="surface flex flex-wrap items-center justify-between gap-3 p-5"><div><p className="font-semibold">{r.k}</p><p className="text-[13px] text-ink-3">{r.note}</p></div><Badge tone={r.s === "Pending" ? "gold" : "palm"} size="md">{r.s}</Badge></div>)}
  </div>;
}

