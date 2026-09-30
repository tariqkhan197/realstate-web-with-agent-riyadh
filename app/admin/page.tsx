import type { Metadata } from "next";
import { AdminConsole } from "@/features/admin/AdminConsole";
export const metadata: Metadata = { title: "Admin", robots: { index: false } };
export default function Page() { return <AdminConsole />; }
