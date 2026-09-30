import type { Metadata } from "next";
import { AuthForm } from "@/features/auth/AuthForms";
export const metadata: Metadata = { title: "Create account" };
export default function Page() { return <AuthForm mode="sign-up" />; }
