import { renderPlaceholder } from "@/lib/placeholder";

// Serves generated SVG placeholders for demo listings (see lib/placeholder.ts).
export async function GET(req: Request, ctx: { params: Promise<{ kind: string; seed: string }> }) {
  const { kind, seed } = await ctx.params;
  const label = new URL(req.url).searchParams.get("label") ?? undefined;
  const svg = renderPlaceholder(kind, seed, label?.slice(0, 60));
  return new Response(svg, {
    headers: { "Content-Type": "image/svg+xml; charset=utf-8", "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
