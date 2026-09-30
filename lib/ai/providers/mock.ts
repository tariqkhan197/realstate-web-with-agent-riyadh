import { parseIntent } from "../intent";
import type { AgentProvider } from "./types";

/** Offline provider: deterministic rule-based understanding. No API keys needed. */
export const mockProvider: AgentProvider = {
  id: "mock",
  async interpret(messages, context) {
    const last = [...messages].reverse().find((m) => m.role === "user");
    return parseIntent(last?.content ?? "", context);
  },
};
