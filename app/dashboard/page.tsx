import type { Metadata } from "next";
import { AgentDashboard } from "@/features/dashboard/AgentDashboard";
export const metadata: Metadata = { title: "Agent dashboard", robots: { index: false } };
export default function Page() { return <AgentDashboard />; }
