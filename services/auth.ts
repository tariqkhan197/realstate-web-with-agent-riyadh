// Mock authentication service. Replace with Supabase / Firebase / Auth.js by
// implementing the same AuthService interface.
export interface User { id: string; name: string; email: string; role: "buyer" | "agent" | "admin"; initials: string }
export interface AuthService {
  signIn(email: string, password: string): Promise<User>;
  signUp(name: string, email: string, password: string): Promise<User>;
  signInWithGoogle(): Promise<User>;
  requestPasswordReset(email: string): Promise<void>;
  signOut(): Promise<void>;
}

const initials = (n: string) => n.split(/\s+/).map((x) => x[0]).join("").slice(0, 2).toUpperCase();
const delay = () => new Promise((r) => setTimeout(r, 650));

export const mockAuth: AuthService = {
  async signIn(email, password) {
    await delay();
    if (!email.includes("@") || password.length < 6) throw new Error("Enter a valid email and a password of at least 6 characters.");
    const name = email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return { id: "u-demo", name, email, role: email.startsWith("admin") ? "admin" : email.startsWith("agent") ? "agent" : "buyer", initials: initials(name) };
  },
  async signUp(name, email, password) {
    await delay();
    if (name.trim().length < 2) throw new Error("Enter your full name.");
    if (!email.includes("@") || password.length < 6) throw new Error("Enter a valid email and a password of at least 6 characters.");
    return { id: "u-demo", name, email, role: "buyer", initials: initials(name) };
  },
  async signInWithGoogle() { await delay(); return { id: "u-google", name: "Sara Al-Mutairi", email: "sara@example.com", role: "buyer", initials: "SM" }; },
  async requestPasswordReset(email) { await delay(); if (!email.includes("@")) throw new Error("Enter the email you signed up with."); },
  async signOut() { await delay(); },
};
