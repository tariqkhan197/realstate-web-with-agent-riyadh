import { mockProvider } from "./providers/mock";
import { anthropicProvider, geminiProvider, openaiProvider } from "./providers/llm";
import type { AgentProvider } from "./providers/types";

/** Selects the provider from AI_PROVIDER (server env). Defaults to the offline mock. */
export function getProvider(): AgentProvider {
  const id = (process.env.AI_PROVIDER ?? "mock").toLowerCase();
  if (id === "anthropic" && process.env.ANTHROPIC_API_KEY) return anthropicProvider;
  if (id === "openai" && process.env.OPENAI_API_KEY) return openaiProvider;
  if (id === "gemini" && process.env.GEMINI_API_KEY) return geminiProvider;
  return mockProvider;
}
export { mockProvider };
export * from "./types";
