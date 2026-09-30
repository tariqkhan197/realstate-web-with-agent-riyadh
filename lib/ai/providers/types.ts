import type { AgentContext, ChatMessage, ParsedIntent } from "../types";

/**
 * An AgentProvider turns the conversation into a structured plan (intent + tool
 * arguments). The agent runtime (services/aiAgent.ts) executes the tools, so any
 * provider — rule-based, OpenAI, Anthropic or Gemini — drives the same tools.
 */
export interface AgentProvider {
  id: "mock" | "openai" | "anthropic" | "gemini";
  interpret(messages: ChatMessage[], context: AgentContext): Promise<ParsedIntent>;
  /** Optional: rewrite the templated reply in a more natural voice. */
  compose?(draft: string, messages: ChatMessage[]): Promise<string>;
}
