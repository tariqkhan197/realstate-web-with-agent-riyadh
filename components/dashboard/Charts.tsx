import { cn, formatNumber } from "@/lib/utils";

/** Lightweight dependency-free SVG charts for dashboards. */
export function LineChart({ data, series, height = 220, className }: { data: Record<string, number | string>[]; series: { key: string; label: string; color: string }[]; height?: number; className?: string }) {
  const W = 640, H = height, P = { t: 12, r: 12, b: 26, l: 40 };
  const vals = data.flatMap((d) => series.map((s) => Number(d[s.key])));
  const max = Math.max(...vals) * 1.1, min = 0;
  const x = (i: number) => P.l + (i / (data.length - 1)) * (W - P.l - P.r);
  const y = (v: number) => P.t + (1 - (v - min) / (max - min)) * (H - P.t - P.b);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => min + t * (max - min));
  return (
    <div className={className}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Chart of ${series.map((s) => s.label).join(", ")}`}>
        {ticks.map((t) => <g key={t}><line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} stroke="#E5E6E1" /><text x={P.l - 6} y={y(t) + 3} textAnchor="end" fontSize="10" fill="#A3A9A6">{t >= 1000 ? `${Math.round(t / 100) / 10}k` : Math.round(t)}</text></g>)}
        {data.map((d, i) => i % 5 === 0 && <text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="10" fill="#A3A9A6">{String(d.d)}</text>)}
        {series.map((s, si) => {
          const path = data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(Number(d[s.key])).toFixed(1)}`).join(" ");
          return <g key={s.key}>
            {si === 0 && <path d={`${path} L${x(data.length - 1)} ${H - P.b} L${x(0)} ${H - P.b} Z`} fill={s.color} opacity=".08" />}
            <path d={path} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          </g>;
        })}
      </svg>
      <div className="mt-2 flex flex-wrap gap-4 text-[12px] text-ink-3">{series.map((s) => <span key={s.key} className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: s.color }} />{s.label}</span>)}</div>
    </div>
  );
}

export function BarList({ items, className, format = (v: number) => formatNumber(v) }: { items: { k: string; v: number }[]; className?: string; format?: (v: number) => string }) {
  const max = Math.max(...items.map((i) => i.v));
  return <ul className={cn("space-y-2.5", className)}>{items.map((i) => (
    <li key={i.k} className="text-[13px]"><div className="mb-1 flex justify-between gap-2"><span className="truncate text-ink-2">{i.k}</span><span className="num font-semibold">{format(i.v)}</span></div>
      <div className="h-2 overflow-hidden rounded-full bg-ink/[.06]"><div className="h-full rounded-full bg-palm-700" style={{ width: `${(i.v / max) * 100}%` }} /></div></li>
  ))}</ul>;
}

export function Metric({ label, value, delta, className }: { label: string; value: string; delta?: string; className?: string }) {
  return <div className={cn("surface p-5", className)}>
    <p className="text-[12.5px] font-medium text-ink-3">{label}</p>
    <p className="num mt-1.5 text-[26px] font-bold leading-none tracking-tight">{value}</p>
    {delta && <p className="num mt-2 text-[12px] font-semibold text-palm-700">{delta} <span className="font-medium text-ink-4">vs last 30 days</span></p>}
  </div>;
}
