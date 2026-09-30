"use client";
import * as React from "react";
import Link from "next/link";
import { BadgeCheck, BarChart3, Bot, Building2, Flag, LayoutDashboard, Search, Settings, ShieldCheck, Users } from "lucide-react";
import { DashboardShell, Table, type NavItem } from "@/components/dashboard/Shell";
import { BarList, LineChart, Metric } from "@/components/dashboard/Charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PropertyThumb } from "@/components/property/PropertyImage";
import { adminMetrics, adminSeries, adminUsers, aiIntentMix, aiToolCalls, brokerStats, reports, verificationQueue } from "@/data/dashboard";
import { PROPERTIES } from "@/data/properties";
import { getNeighborhood } from "@/data/locations";
import { getPropertyById } from "@/services/propertySearch";
import { formatDate, formatNumber, formatSAR } from "@/lib/utils";
import { useApp } from "@/lib/store";

type Section = "overview" | "users" | "properties" | "agents" | "verification" | "reports" | "analytics" | "ai" | "settings";

export function AdminConsole() {
  const [section, setSection] = React.useState<Section>("overview");
  const items: NavItem<Section>[] = [
    { key: "overview", label: "Overview", icon: LayoutDashboard }, { key: "users", label: "Users", icon: Users },
    { key: "properties", label: "Properties", icon: Building2 }, { key: "agents", label: "Agents", icon: BadgeCheck },
    { key: "verification", label: "Verification", icon: ShieldCheck, badge: verificationQueue.length }, { key: "reports", label: "Reports", icon: Flag, badge: reports.filter((r) => r.status === "open").length },
    { key: "analytics", label: "Analytics", icon: BarChart3 }, { key: "ai", label: "AI Agent", icon: Bot }, { key: "settings", label: "Settings", icon: Settings },
  ];
  return (
    <DashboardShell title="Admin" badge="Riyah admin" subtitle="Platform console" items={items} active={section} onChange={setSection}>
      {section === "overview" && <Overview />}
      {section === "users" && <UsersView />}
      {section === "properties" && <PropertiesView />}
      {section === "agents" && <AgentsView />}
      {section === "verification" && <VerificationView />}
      {section === "reports" && <ReportsView />}
      {section === "analytics" && <AnalyticsView />}
      {section === "ai" && <AiView />}
      {section === "settings" && <SettingsView />}
    </DashboardShell>
  );
}

function Overview() {
  const m = adminMetrics;
  return <div className="space-y-6">
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-7">
      <Metric label="Users" value={formatNumber(m.users)} delta="+6.2%" /><Metric label="Listings" value={formatNumber(m.listings)} />
      <Metric label="Verified listings" value={formatNumber(m.verified)} /><Metric label="AI searches" value={formatNumber(m.aiSearches)} delta="+18.9%" />
      <Metric label="AI conversations" value={formatNumber(m.aiConversations)} delta="+14.1%" /><Metric label="Leads" value={formatNumber(m.leads)} delta="+7.5%" />
      <Metric label="Saved properties" value={formatNumber(m.saved)} />
    </div>
    <p className="text-[12.5px] text-ink-4">Listing and verified counts are computed from the demo catalogue; traffic figures are seeded demo values.</p>
    <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
      <div className="surface p-6"><h2 className="font-bold">Platform activity · 30 days</h2><LineChart className="mt-4" data={adminSeries} series={[{ key: "searches", label: "AI searches", color: "#145C45" }, { key: "conversations", label: "AI conversations", color: "#A8843F" }, { key: "users", label: "New users", color: "#737B78" }]} /></div>
      <div className="surface p-6"><h2 className="mb-4 font-bold">What buyers ask Raed</h2><BarList items={aiIntentMix} format={(v) => `${v}%`} /></div>
    </div>
  </div>;
}

function UsersView() {
  const [q, setQ] = React.useState(""); const { toast } = useApp();
  const [status, setStatus] = React.useState(() => Object.fromEntries(adminUsers.map((u) => [u.id, u.status])));
  const rows = adminUsers.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase()));
  return <div className="space-y-4">
    <SearchBox value={q} onChange={setQ} placeholder="Search users by name or email" />
    <Table head={["User", "Role", "Joined", "AI conversations", "Status", ""]}>{rows.map((u) => (
      <tr key={u.id}><td className="px-4 py-3"><p className="font-semibold">{u.name}</p><p className="text-[12px] text-ink-4">{u.email}</p></td>
        <td className="px-4 py-3 capitalize">{u.role}</td><td className="px-4 py-3 text-ink-3">{formatDate(u.joined)}</td><td className="num px-4 py-3">{u.conversations}</td>
        <td className="px-4 py-3"><Badge tone={status[u.id] === "active" ? "palm" : "danger"} className="capitalize">{status[u.id]}</Badge></td>
        <td className="px-4 py-3 text-end"><Button size="sm" variant="ghost" onClick={() => { const n = status[u.id] === "active" ? "suspended" : "active"; setStatus((s) => ({ ...s, [u.id]: n })); toast(`${u.name} ${n === "active" ? "re-activated" : "suspended"} (demo)`); }}>{status[u.id] === "active" ? "Suspend" : "Restore"}</Button></td></tr>))}
    </Table>
  </div>;
}

function PropertiesView() {
  const [q, setQ] = React.useState("");
  const rows = PROPERTIES.filter((p) => `${p.title} ${p.id}`.toLowerCase().includes(q.toLowerCase()));
  return <div className="space-y-4">
    <SearchBox value={q} onChange={setQ} placeholder="Search listings" />
    <Table head={["Listing", "Neighborhood", "Price", "Purpose", "Licence", "Added"]}>{rows.map((p) => (
      <tr key={p.id}><td className="px-4 py-3"><Link href={`/property/${p.slug}`} className="flex items-center gap-3"><PropertyThumb property={p} className="h-10 w-12 shrink-0 rounded-lg" /><span className="line-clamp-1 max-w-[280px] font-semibold">{p.title}</span></Link></td>
        <td className="px-4 py-3">{getNeighborhood(p.neighborhood)?.name}</td><td className="num px-4 py-3">{formatSAR(p.price, { compact: true })}</td>
        <td className="px-4 py-3">{p.purpose === "sale" ? "Sale" : "Rent"}</td>
        <td className="px-4 py-3">{p.licensing.regaVerified ? <Badge tone="palm">Licence on file</Badge> : <Badge tone="gold">Pending</Badge>}</td>
        <td className="px-4 py-3 text-ink-3">{formatDate(p.addedOn)}</td></tr>))}
    </Table>
  </div>;
}

function AgentsView() {
  return <Table head={["Agent", "Company", "Active listings", "Leads", "Rating", "Status"]}>{brokerStats.map((b) => (
    <tr key={b.id}><td className="px-4 py-3 font-semibold">{b.name}</td><td className="px-4 py-3">{b.company}</td><td className="num px-4 py-3">{b.active}</td><td className="num px-4 py-3">{b.leads}</td><td className="num px-4 py-3">{b.rating}</td>
      <td className="px-4 py-3">{b.verified ? <Badge tone="palm">FAL checked (demo)</Badge> : <Badge tone="gold">Review</Badge>}</td></tr>))}
  </Table>;
}

function VerificationView() {
  const { toast } = useApp();
  const [done, setDone] = React.useState<Record<string, "approved" | "rejected">>({});
  if (!verificationQueue.length) return <p className="text-ink-3">The verification queue is empty.</p>;
  return <div className="space-y-3">
    <p className="text-[13.5px] text-ink-3">Listings without complete licence data. Approving here does not contact REGA — it is a UI placeholder for the future verification integration.</p>
    {verificationQueue.map((v) => { const p = getPropertyById(v.propertyId); if (!p) return null; const s = done[v.propertyId]; return (
      <div key={v.propertyId} className="surface flex flex-wrap items-center gap-4 p-4">
        <PropertyThumb property={p} className="h-14 w-20 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1"><p className="truncate font-semibold">{p.title}</p><p className="text-[13px] text-ink-3">{v.issue} · submitted {formatDate(v.submitted)}</p></div>
        {s ? <Badge tone={s === "approved" ? "palm" : "danger"} size="md" className="capitalize">{s}</Badge> : <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => { setDone((d) => ({ ...d, [v.propertyId]: "rejected" })); toast("Returned to agent (demo)"); }}>Request fix</Button>
          <Button size="sm" onClick={() => { setDone((d) => ({ ...d, [v.propertyId]: "approved" })); toast("Marked as reviewed (demo)", "success"); }}>Mark reviewed</Button></div>}
      </div>); })}
  </div>;
}

function ReportsView() {
  return <Table head={["Report", "Listing", "Reason", "Reported by", "Status"]}>{reports.map((r) => (
    <tr key={r.id}><td className="num px-4 py-3 font-semibold">{r.id}</td><td className="px-4 py-3"><span className="line-clamp-1 max-w-[260px]">{getPropertyById(r.propertyId)?.title}</span></td><td className="px-4 py-3">{r.reason}</td><td className="px-4 py-3">{r.by}</td>
      <td className="px-4 py-3"><Badge tone={r.status === "open" ? "gold" : r.status === "resolved" ? "palm" : "neutral"} className="capitalize">{r.status}</Badge></td></tr>))}
  </Table>;
}

function AnalyticsView() {
  const byCity = Object.entries(PROPERTIES.reduce<Record<string, number>>((a, p) => ({ ...a, [p.city]: (a[p.city] ?? 0) + 1 }), {})).map(([k, v]) => ({ k: k[0].toUpperCase() + k.slice(1), v }));
  return <div className="space-y-6">
    <div className="surface p-6"><h2 className="font-bold">New users per day</h2><LineChart className="mt-4" height={200} data={adminSeries} series={[{ key: "users", label: "New users", color: "#145C45" }]} /></div>
    <div className="surface p-6"><h2 className="mb-4 font-bold">Listings by city</h2><BarList items={byCity.sort((a, b) => b.v - a.v)} /></div>
  </div>;
}

function AiView() {
  return <div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-3">
      <Metric label="Active provider" value="Mock" /><Metric label="Avg. tools per answer" value="4.6" /><Metric label="Shortlist completion" value="71%" />
    </div>
    <div className="surface p-6"><h2 className="mb-1 font-bold">Tool calls · 30 days</h2><p className="mb-4 text-[13px] text-ink-3">Each tool maps to a function in <code>services/</code> and a JSON schema in <code>lib/ai/tools.ts</code>.</p><BarList items={aiToolCalls} /></div>
    <div className="surface p-6 text-[14px] text-ink-2"><h2 className="font-bold text-ink">Switching to a real model</h2><p className="mt-2">Set <code>AI_PROVIDER</code> to <code>anthropic</code>, <code>openai</code> or <code>gemini</code> and add the matching key in <code>.env.local</code>. Keys are read on the server only, and the agent falls back to the mock provider if a call fails.</p></div>
  </div>;
}

function SettingsView() {
  const { toast } = useApp();
  const [s, setS] = React.useState({ requireLicence: true, aiEnabled: true, showDemoLabels: true, arabicDefault: false });
  const labels: Record<keyof typeof s, [string, string]> = {
    requireLicence: ["Require advertising licence", "Hide listings without a licence number from search."],
    aiEnabled: ["AI agent enabled", "Show the AI agent across the site."],
    showDemoLabels: ["Show demo labels", "Mark demo estimates and demo data everywhere."],
    arabicDefault: ["Arabic as default language", "New visitors start in Arabic (RTL)."],
  };
  return <div className="surface max-w-2xl divide-y divide-line">{(Object.keys(s) as (keyof typeof s)[]).map((k) => (
    <label key={k} className="flex cursor-pointer items-center justify-between gap-4 p-5"><span><span className="block font-semibold">{labels[k][0]}</span><span className="text-[13px] text-ink-3">{labels[k][1]}</span></span>
      <input type="checkbox" className="h-5 w-5 accent-palm-700" checked={s[k]} onChange={(e) => { setS((x) => ({ ...x, [k]: e.target.checked })); toast("Setting updated (demo)"); }} /></label>))}</div>;
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return <div className="relative max-w-md"><Search size={16} className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-ink-4" /><label className="sr-only" htmlFor="adm-q">{placeholder}</label><input id="adm-q" className="field ps-10" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} /></div>;
}
