import type { Metadata } from "next";
import { ProfileView } from "@/features/auth/ProfileView";
export const metadata: Metadata = { title: "Your profile", robots: { index: false } };
export default function Page() { return <ProfileView />; }
