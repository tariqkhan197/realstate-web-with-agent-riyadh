import { NextResponse } from "next/server";
import { runAgent } from "@/services/aiAgent";
import type { AgentContext, ChatMessage } from "@/lib/ai/types";

// Agent endpoint. Runs server-side so real provider keys never reach the browser.
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { messages?: ChatMessage[]; context?: AgentContext };
    const messages = (body.messages ?? []).filter((m) => typeof m?.content === "string").slice(-20).map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
    if (!messages.length) return NextResponse.json({ error: "Send at least one message." }, { status: 400 });
    const reply = await runAgent(messages, body.context ?? {});
    return NextResponse.json(reply);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "The agent couldn't process that request. Try rephrasing it." }, { status: 500 });
  }
}
