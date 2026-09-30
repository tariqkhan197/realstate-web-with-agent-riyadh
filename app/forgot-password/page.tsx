import type { Metadata } from "next";
import { AuthForm } from "@/features/auth/AuthForms";
export const metadata: Metadata = { title: "Reset password" };
export default function Page() { return <AuthForm mode="forgot" />; }
