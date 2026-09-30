// LLM providers (server-side only). Each asks the model to return a ParsedIntent via
// a single structured tool call, then the shared agent runtime executes Riyah tools.
// If a key is missing or a call fails, the runtime falls back to the mock provider.
import { TOOL_DEFINITIONS } from "../tools";
import { parseIntent } from "../intent";
import type { AgentContext, ChatMessage, ParsedIntent } from "../types";
import type { AgentProvider } from "./types";

const SYSTEM = `You are Raed, the Riyah AI real estate agent for Saudi Arabia. Convert the user's latest message into a plan.
Return ONLY by calling the "plan" tool. Intents: search, compare, mortgage, investment, similar, neighborhood, family-check, considerations, save, describe, help.
Available runtime tools: ${TOOL_DEFINITIONS.map((t) => t.name).join(", ")}. Prices are in SAR.`;

const PLAN_SCHEMA = {
  type: "object",
  properties: {
    intent: { type: "string" },
    criteria: TOOL_DEFINITIONS.find((t) => t.name === "searchProperties")!.parameters,
    propertyId: { type: "string" },
    mortgage: { type: "object", properties: { downPct: { type: "number" }, years: { type: "number" }, ratePct: { type: "number" } } },
  },
  required: ["intent", "criteria"],
};

function withFallback(p: Partial<ParsedIntent> | undefined, messages: ChatMessage[], ctx: AgentContext): ParsedIntent {
  const fallback = parseIntent(messages.at(-1)?.content ?? "", ctx);
  if (!p?.intent) return fallback;
  return { ...fallback, ...p, criteria: { ...(p.criteria ?? {}) }, hasCriteria: !!p.criteria && Object.keys(p.criteria).length > 0, propertyId: p.propertyId ?? fallback.propertyId } as ParsedIntent;
}

export const anthropicProvider: AgentProvider = {
  id: "anthropic",
  async interpret(messages, ctx) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY!, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5", max_tokens: 800, system: `${SYSTEM}\nContext: ${JSON.stringify(ctx)}`,
        tools: [{ name: "plan", description: "Structured plan", input_schema: PLAN_SCHEMA }], tool_choice: { type: "tool", name: "plan" },
        messages: messages.slice(-10),
      }),
    });
    const data = await res.json();
    const block = data?.content?.find((b: { type: string }) => b.type === "tool_use");
    return withFallback(block?.input, messages, ctx);
  },
};

export const openaiProvider: AgentProvider = {
  id: "openai",
  async interpret(messages, ctx) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        messages: [{ role: "system", content: `${SYSTEM}\nContext: ${JSON.stringify(ctx)}` }, ...messages.slice(-10)],
        tools: [{ type: "function", function: { name: "plan", parameters: PLAN_SCHEMA } }], tool_choice: { type: "function", function: { name: "plan" } },
      }),
    });
    const data = await res.json();
    const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    return withFallback(args ? JSON.parse(args) : undefined, messages, ctx);
  },
};

export const geminiProvider: AgentProvider = {
  id: "gemini",
  async interpret(messages, ctx) {
    const model = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: `${SYSTEM}\nContext: ${JSON.stringify(ctx)}` }] },
        contents: messages.slice(-10).map((m) => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.content }] })),
        tools: [{ functionDeclarations: [{ name: "plan", parameters: PLAN_SCHEMA }] }],
        toolConfig: { functionCallingConfig: { mode: "ANY", allowedFunctionNames: ["plan"] } },
      }),
    });
    const data = await res.json();
    const call = data?.candidates?.[0]?.content?.parts?.find((p: { functionCall?: unknown }) => p.functionCall)?.functionCall;
    return withFallback(call?.args, messages, ctx);
  },
};
