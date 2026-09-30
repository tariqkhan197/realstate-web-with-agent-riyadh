import type { MatchResult, SearchCriteria } from "@/types";
import type { Comparison } from "@/services/compare";
import type { MortgageResult } from "@/services/mortgage";
import type { InvestmentAnalysis } from "@/services/investment";
import type { NeighborhoodInfo } from "@/services/neighborhood";

export type ToolName =
  | "searchProperties" | "filterProperties" | "compareProperties" | "calculateMortgage" | "analyzeInvestment"
  | "findSimilarProperties" | "createShortlist" | "saveProperty" | "getNeighborhoodInfo";

export type AgentPhase = "thinking" | "searching" | "analyzing" | "comparing" | "completed";

export interface AgentStep {
  id: string;
  tool?: ToolName | "understand" | "rank";
  label: string;
  detail?: string;
  phase: AgentPhase;
  /** Header status text while this step runs, e.g. "Analyzing 28 matching listings…" */
  status: string;
}

export type AgentBlock =
  | { kind: "criteria"; items: { label: string; value: string }[] }
  | { kind: "results"; scoped: number; found: number; strong: number; results: MatchResult[]; criteria: SearchCriteria; title?: string }
  | { kind: "comparison"; comparison: Comparison }
  | { kind: "mortgage"; propertyId: string; result: MortgageResult }
  | { kind: "investment"; propertyId: string; analysis: InvestmentAnalysis }
  | { kind: "neighborhood"; info: NeighborhoodInfo }
  | { kind: "checklist"; title: string; items: { label: string; ok: boolean | null; note: string }[] }
  | { kind: "action"; action: "save"; propertyId: string };

export interface AgentContext {
  activePropertyId?: string;
  lastCriteria?: SearchCriteria;
  lastResultIds?: string[];
}

export interface ChatMessage { role: "user" | "assistant"; content: string }

export interface AgentReply {
  id: string;
  text: string;
  steps: AgentStep[];
  blocks: AgentBlock[];
  suggestions: string[];
  context: AgentContext;
  provider: string;
}

export type Intent =
  | "search" | "compare" | "mortgage" | "investment" | "similar" | "neighborhood"
  | "family-check" | "considerations" | "save" | "describe" | "help";

export interface ParsedIntent {
  intent: Intent;
  criteria: SearchCriteria;
  /** true when the message carried its own search criteria */
  hasCriteria: boolean;
  propertyId?: string;
  mortgage?: { downPct?: number; years?: number; ratePct?: number };
}
