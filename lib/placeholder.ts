// Generated architectural placeholder imagery for DEMO listings.
// Served from app/placeholder/[kind]/[seed]/route.ts. Replace with real photos per listing.

function rng(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
}
const pick = <T,>(r: () => number, a: T[]) => a[Math.floor(r() * a.length)];
const esc = (s: string) => s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c]!));

const W = 1200, H = 800;

const SKIES = [
  ["#DCE7EC", "#F3EEE4"], // clear morning
  ["#F0D9B8", "#F8EEDF"], // golden hour
  ["#C9D6DE", "#EDE6DA"], // hazy noon
  ["#2E3B4E", "#C99A6B"], // dusk
];
const STONE = ["#E9DFCF", "#DCCFB9", "#EFE8DC", "#D8CDBF", "#E4D8C4"];

function label(text?: string) {
  if (!text) return "";
  const w = Math.min(760, 26 + text.length * 13);
  return `<g><rect x="28" y="${H - 76}" width="${w}" height="48" rx="24" fill="#0B3B2E" fill-opacity=".82"/>
  <text x="52" y="${H - 45}" font-family="Manrope,Arial,sans-serif" font-size="22" font-weight="600" fill="#fff">${esc(text)}</text></g>`;
}

function palm(x: number, y: number, s: number, dark: boolean) {
  const c = dark ? "#1E2C27" : "#3E5A4A";
  const fr = [-70, -35, 0, 35, 70, 110, -110].map((a) => {
    const rad = (a - 90) * Math.PI / 180, ex = x + Math.cos(rad) * 70 * s, ey = y - 150 * s + Math.sin(rad) * 45 * s + 30 * s;
    return `<path d="M${x} ${y - 150 * s} Q ${(x + ex) / 2} ${y - 175 * s} ${ex} ${ey}" stroke="${c}" stroke-width="${9 * s}" fill="none" stroke-linecap="round"/>`;
  }).join("");
  return `<path d="M${x - 4 * s} ${y} Q ${x + 6 * s} ${y - 80 * s} ${x} ${y - 150 * s}" stroke="${dark ? "#2A221B" : "#7A6248"}" stroke-width="${8 * s}" fill="none"/>${fr}`;
}

function exterior(seed: string, villa: boolean, text?: string) {
  const r = rng(seed);
  const sky = pick(r, SKIES), dusk = sky[0] === "#2E3B4E";
  const stone = pick(r, STONE);
  const floors = villa ? 2 : 4 + Math.floor(r() * 4);
  const bw = villa ? 640 : 380 + r() * 180, fh = villa ? 120 : 64;
  const bx = (W - bw) / 2 + (r() - 0.5) * 140, ground = 640, top = ground - floors * fh - 30;
  const cols = Math.max(4, Math.floor(bw / (villa ? 110 : 62)));
  let win = "";
  for (let f = 0; f < floors; f++) for (let c = 0; c < cols; c++) {
    const ww = (bw - 60) / cols - 16, wx = bx + 30 + c * ((bw - 60) / cols) + 8, wy = top + 40 + f * fh;
    const lit = dusk && r() > 0.45;
    win += `<rect x="${wx.toFixed(1)}" y="${wy}" width="${ww.toFixed(1)}" height="${fh - 28}" rx="2" fill="${lit ? "#F2C77E" : dusk ? "#3B4A55" : "#8FA3AB"}" fill-opacity="${lit ? 0.95 : 0.8}"/>`;
    win += `<rect x="${wx.toFixed(1)}" y="${wy + fh - 30}" width="${ww.toFixed(1)}" height="4" fill="#00000018"/>`;
  }
  // Najdi triangular parapet
  let crest = "";
  const tri = 28, n = Math.floor(bw / tri);
  for (let i = 0; i < n; i++) crest += `<path d="M${bx + i * tri} ${top} l${tri / 2} -16 l${tri / 2} 16z" fill="${stone}"/>`;
  const door = `<rect x="${bx + bw / 2 - 34}" y="${ground - 92}" width="68" height="92" rx="34" ry="34" fill="${dusk ? "#F2C77E" : "#6B5A45"}"/>`;
  const shade = `<rect x="${bx + bw * 0.62}" y="${top}" width="${bw * 0.38}" height="${ground - top}" fill="#000" fill-opacity=".06"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient>
<linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${dusk ? "#8C7358" : "#D9C7A8"}"/><stop offset="1" stop-color="${dusk ? "#5E4C3B" : "#C7B18E"}"/></linearGradient></defs>
<rect width="${W}" height="${H}" fill="url(#s)"/>
${dusk ? `<circle cx="${200 + r() * 800}" cy="140" r="3" fill="#fff" opacity=".7"/>` : `<circle cx="${180 + r() * 840}" cy="${120 + r() * 60}" r="46" fill="#fff" opacity=".55"/>`}
<path d="M0 ${ground - 40} L${W * 0.2} ${ground - 70} L${W * 0.35} ${ground - 55} L${W * 0.6} ${ground - 85} L${W * 0.8} ${ground - 60} L${W} ${ground - 75} V${ground} H0z" fill="${dusk ? "#4A4644" : "#CFC3B1"}" opacity=".6"/>
<rect x="${bx - 6}" y="${top}" width="${bw + 12}" height="${ground - top}" fill="${stone}"/>
${crest}${win}${shade}
<rect x="${bx - 6}" y="${ground - 10}" width="${bw + 12}" height="10" fill="#00000014"/>
${door}
<rect y="${ground}" width="${W}" height="${H - ground}" fill="url(#g)"/>
<rect y="${ground}" width="${W}" height="6" fill="#00000012"/>
${palm(bx - 70, ground + 8, 1.15, dusk)}${palm(bx + bw + 80, ground + 10, 1.3, dusk)}${r() > 0.5 ? palm(bx + bw + 190, ground + 12, 0.9, dusk) : ""}
${label(text)}</svg>`;
}

function interior(seed: string, text?: string) {
  const r = rng(seed);
  const wall = pick(r, ["#EFEAE2", "#E8E3DA", "#F2EEE8", "#E6E2DB"]);
  const floor = pick(r, ["#C9B79C", "#D6C7B0", "#BFAE95", "#DCD3C6"]);
  const sofa = pick(r, ["#5E6B63", "#8C7A66", "#3F4A45", "#B7A58A", "#6E5B4B"]);
  const accent = pick(r, ["#A8843F", "#145C45", "#7A5230", "#4E6A7A"]);
  const bed = /bed|master/i.test(text ?? "") || r() > 0.7;
  const kitchen = /kitchen/i.test(text ?? "");
  const piece = kitchen
    ? `<rect x="180" y="470" width="840" height="150" fill="#F7F4EF"/><rect x="180" y="455" width="840" height="18" fill="#D9D2C6"/>
       ${[0, 1, 2, 3, 4, 5].map((i) => `<rect x="${196 + i * 138}" y="490" width="124" height="110" rx="4" fill="#EDE8E0" stroke="#00000010"/>`).join("")}
       <rect x="180" y="250" width="840" height="110" fill="#F4F0EA"/>`
    : bed
    ? `<rect x="330" y="420" width="540" height="200" rx="16" fill="#F6F3EE"/><rect x="330" y="360" width="540" height="90" rx="14" fill="${sofa}"/>
       <rect x="370" y="440" width="170" height="60" rx="14" fill="#fff"/><rect x="660" y="440" width="170" height="60" rx="14" fill="#fff"/>
       <rect x="330" y="540" width="540" height="80" rx="12" fill="${accent}" fill-opacity=".55"/>`
    : `<rect x="300" y="500" width="600" height="120" rx="22" fill="${sofa}"/><rect x="300" y="440" width="600" height="90" rx="22" fill="${sofa}" opacity=".9"/>
       <rect x="340" y="455" width="140" height="70" rx="12" fill="#fff" opacity=".35"/><rect x="720" y="455" width="140" height="70" rx="12" fill="${accent}" opacity=".5"/>
       <ellipse cx="600" cy="690" rx="300" ry="40" fill="${accent}" opacity=".18"/><rect x="520" y="640" width="160" height="30" rx="8" fill="#6B5A45"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
<defs><linearGradient id="l" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
<rect width="${W}" height="${H}" fill="${wall}"/>
<path d="M0 ${H} L150 620 H1050 L${W} ${H}z" fill="${floor}"/>
<path d="M0 0 L150 90 V620 L0 ${H}z" fill="#000" opacity=".05"/><path d="M${W} 0 L1050 90 V620 L${W} ${H}z" fill="#000" opacity=".08"/>
<rect x="${kitchen ? 820 : 760}" y="130" width="220" height="${kitchen ? 100 : 300}" fill="#DCE7EC" stroke="#fff" stroke-width="10"/>
<path d="M${kitchen ? 820 : 760} 130 L520 ${H} H${W} L1040 430z" fill="url(#l)" opacity=".35"/>
<line x1="600" y1="0" x2="600" y2="170" stroke="#3a3a3a" stroke-width="2"/><ellipse cx="600" cy="182" rx="46" ry="16" fill="${accent}"/>
${piece}
<rect x="190" y="${bed || kitchen ? 520 : 470}" width="46" height="100" rx="8" fill="#8C7A66"/><circle cx="213" cy="${bed || kitchen ? 480 : 430}" r="56" fill="#56705E"/>
${label(text)}</svg>`;
}

function floorPlan(seed: string, text?: string) {
  const r = rng(seed);
  const rooms = [
    { x: 120, y: 110, w: 380, h: 250, n: "Living / Majlis" },
    { x: 500, y: 110, w: 280, h: 250, n: "Master bedroom" },
    { x: 780, y: 110, w: 300, h: 250, n: "Bedroom 2" },
    { x: 120, y: 360, w: 260, h: 300, n: "Kitchen" },
    { x: 380, y: 360, w: 200, h: 150, n: "Bath" },
    { x: 380, y: 510, w: 200, h: 150, n: "Maid room" },
    { x: 580, y: 360, w: 240, h: 300, n: "Bedroom 3" },
    { x: 820, y: 360, w: 260, h: 300, n: r() > 0.5 ? "Bedroom 4" : "Family room" },
  ];
  const g = rooms.map((m) => `<rect x="${m.x}" y="${m.y}" width="${m.w}" height="${m.h}" fill="#FBFBF9" stroke="#1B211F" stroke-width="8"/>
<text x="${m.x + m.w / 2}" y="${m.y + m.h / 2}" text-anchor="middle" font-family="Manrope,Arial,sans-serif" font-size="22" font-weight="600" fill="#434B48">${m.n}</text>
<text x="${m.x + m.w / 2}" y="${m.y + m.h / 2 + 28}" text-anchor="middle" font-family="Manrope,Arial,sans-serif" font-size="17" fill="#737B78">${(m.w / 55).toFixed(1)} × ${(m.h / 55).toFixed(1)} m</text>`).join("");
  const doors = [[300, 360], [640, 360], [930, 360], [480, 510], [700, 360]].map(([x, y]) => `<rect x="${x - 30}" y="${y - 6}" width="60" height="12" fill="#FBFBF9"/><path d="M${x - 30} ${y} a60 60 0 0 1 60 -60" stroke="#A3A9A6" stroke-width="2" fill="none"/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
<rect width="${W}" height="${H}" fill="#F4F5F1"/>
<g stroke="#E1E3DD" stroke-width="1">${Array.from({ length: 24 }, (_, i) => `<line x1="${i * 50}" y1="0" x2="${i * 50}" y2="${H}"/>`).join("")}${Array.from({ length: 16 }, (_, i) => `<line x1="0" y1="${i * 50}" x2="${W}" y2="${i * 50}"/>`).join("")}</g>
${g}${doors}
<text x="1080" y="720" text-anchor="end" font-family="Manrope,Arial,sans-serif" font-size="18" fill="#737B78">Illustrative layout · not to scale</text>
${label(text)}</svg>`;
}

function land(seed: string, text?: string) {
  const r = rng(seed);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DCE7EC"/><stop offset="1" stop-color="#F3EEE4"/></linearGradient></defs>
<rect width="${W}" height="${H}" fill="url(#s)"/>
<path d="M0 420 L300 380 L520 405 L760 370 L1200 400 V${H} H0z" fill="#D9C7A8"/>
<path d="M260 520 L940 480 L1080 660 L140 700z" fill="#CDB791" stroke="#0B3B2E" stroke-width="4" stroke-dasharray="18 12"/>
${[0, 1, 2, 3].map((i) => `<rect x="${200 + i * 240 + r() * 40}" y="${330 - r() * 50}" width="${40 + r() * 30}" height="${60 + r() * 60}" fill="#BFB3A1" opacity=".7"/>`).join("")}
${label(text)}</svg>`;
}

export function renderPlaceholder(kind: string, seed: string, text?: string): string {
  switch (kind) {
    case "interior": return interior(seed, text);
    case "floor-plan": return floorPlan(seed, text);
    case "land": return land(seed, text);
    case "villa": return exterior(seed, true, text);
    default: return exterior(seed, /r0[59]|r1[1579]|r29|r31|j02|d02|md2/.test(seed), text);
  }
}
