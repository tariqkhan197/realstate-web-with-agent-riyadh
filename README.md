# Riyah — Your AI Real Estate Agent for Saudi Arabia

A production-style prototype of a Saudi PropTech platform built around an AI real estate agent ("Raed") that searches, filters, ranks, compares and finance-checks listings — and shows every tool step it runs.

Next.js 15 (App Router) · TypeScript · Tailwind CSS · shadcn-style UI primitives · Lucide icons. Runs locally with **no paid APIs**.

> **All listings, brokers, dashboard figures, neighbourhood prices and investment numbers are demo data.** They are labelled "Demo", "Demo Estimate" or "AI Estimate" throughout the UI. Nothing here is verified market or government data.

---

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
# or
npm run build && npm start
```

Requires Node 18.18+ (tested on Node 22).

## Pages

| Route | What it is |
|---|---|
| `/` | Home: hero with live agent preview, tool ledger, featured listings, neighbourhoods |
| `/agent` | AI agent workspace — history sidebar, conversation with animated tool execution, property intelligence panel. Accepts `?q=` and `?property=<id>` |
| `/buy`, `/rent` | Search with natural-language query, full filters, list + map views, saved searches |
| `/property/[slug]` | Listing detail: gallery (thumbnails, fullscreen, keyboard/swipe), licence panel, amenities, location, floor plan, mortgage calculator, AI investment analysis, similar properties, "Ask AI About This Property" |
| `/compare` | Property Comparison (2–4 listings, objective differences, no winner) |
| `/match` | AI Property Matching wizard → "Your Property Shortlist" with reasons |
| `/investment` | Investment explorer (low / base / high scenarios) |
| `/map` | City overview + simulated district map with price markers |
| `/neighborhoods`, `/neighborhoods/[slug]` | Neighbourhood guides (demo price bands, lifestyle, transport, AI summary) |
| `/projects` | Off-plan projects |
| `/for-agents` | Agent marketing page |
| `/dashboard`, `/dashboard/new` | Agent/seller dashboard + 8-step create-listing flow with AI listing tools |
| `/admin` | Admin console (users, properties, agents, verification, reports, analytics, AI agent, settings) |
| `/sign-in`, `/sign-up`, `/forgot-password`, `/profile` | Mock authentication |
| `/saved` | Saved properties, saved searches, recently viewed |

English is the default; the header switch toggles Arabic with full RTL layout.

## Adding the real property photos

No images were supplied with the brief, so the primary listing (Dhahrat Laban, SAR 730,000) has **12 labelled photo slots** rendered as placeholders.

1. Put the files in `public/properties/dhahrat-laban/` using the names in `data/demoPropertyImages.ts` (`01-exterior-facade.jpg` … `12-floor-plan.jpg`).
2. Set `PHOTOS_READY = true` in `data/demoPropertyImages.ts`.

The floor plan slot is shown in the Floor plan section, not mixed into interiors. Other listings use generated architectural placeholders served by `app/placeholder/[kind]/[seed]/route.ts`; replace `images` on each record in `data/properties.ts` with real URLs when available.

## Architecture

```
app/                 routes (server components + metadata, JSON-LD, sitemap, robots)
  api/agent/route.ts POST {messages, context} → AgentReply
features/            page-level client experiences (agent, search, compare, dashboard, admin, …)
components/          UI primitives, brand, layout, property, finance, map, dashboard
services/            business logic — the agent's tools
  propertySearch.ts  searchProperties, filterProperties, findSimilarProperties
  matching.ts        weighted match scoring (budget, location, bedrooms, type, goal, features, space, quality)
  shortlist.ts       createShortlist
  compare.ts         compareProperties (neutral differences, no winner)
  mortgage.ts        calculateMortgage
  investment.ts      analyzeInvestment
  neighborhood.ts    getNeighborhoodInfo
  listingAI.ts       seller-side AI tools
  auth.ts            AuthService interface + mock implementation
  aiAgent.ts         runAgent — orchestrates intent → tools → reply blocks
lib/ai/              intent parsing (EN + AR), tool JSON schemas, providers
data/                demo data (properties, locations, brokers, dashboards)
lib/store.tsx        client state (language, saved, compare, recent, searches, user) persisted to localStorage
```

Match percentages are computed from real factors in `services/matching.ts` — never random.

## Connecting a real AI model

Copy `.env.example` to `.env.local`:

```
AI_PROVIDER=anthropic        # mock | anthropic | openai | gemini
ANTHROPIC_API_KEY=...
```

Tool definitions (JSON schema) live in `lib/ai/tools.ts` and map 1:1 to the functions in `services/`. Provider adapters are in `lib/ai/providers/`. Keys are only read on the server, and the agent falls back to the mock provider if a call fails.

## Replacing mock services

- **Auth:** implement `AuthService` in `services/auth.ts` with Supabase, Firebase or Auth.js.
- **Listings DB:** swap the array reads in `services/propertySearch.ts` for your database queries; the rest of the app only talks to the service functions.
- **Saved items:** `lib/store.tsx` persists through a small storage adapter — point it at a user API.
- **Maps:** `components/map/DistrictMap.tsx` is a stylised map; replace with Mapbox/Google Maps using real coordinates.
- **Verification:** licence display is taken from listing data. Connect the official REGA verification service before showing any listing as verified in production.

## Disclaimers

Mortgage and investment figures are estimates for demonstration purposes and should not be treated as financial advice or verified market data. Brokers, licence numbers (other than those supplied for the primary listing) and dashboard metrics are fictional.
