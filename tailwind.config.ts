import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./features/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: { DEFAULT: "1.25rem", lg: "2rem" }, screens: { "2xl": "1360px" } },
    extend: {
      colors: {
        canvas: "#F7F7F4",
        surface: "#FFFFFF",
        ink: { DEFAULT: "#1B211F", 2: "#434B48", 3: "#737B78", 4: "#A3A9A6" },
        line: { DEFAULT: "#E5E6E1", strong: "#D3D5CF" },
        palm: {
          950: "#07261E", 900: "#0B3B2E", 800: "#0F4A39", 700: "#145C45", 600: "#1A7355",
          500: "#2A8A67", 200: "#C7DDD2", 100: "#E4EFE9", 50: "#F1F7F3",
        },
        gold: { 700: "#8A6A2E", 600: "#A8843F", 400: "#C9A962", 200: "#E9DCBE", 100: "#F5EEDF", 50: "#FBF8F0" },
        danger: { DEFAULT: "#B4432F", 50: "#FBEFEC" },
      },
      fontFamily: {
        sans: ["var(--font-manrope)", "var(--font-arabic)", "system-ui", "sans-serif"],
        arabic: ["var(--font-arabic)", "var(--font-manrope)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["clamp(2.6rem, 5.2vw, 4.4rem)", { lineHeight: "1.02", letterSpacing: "-0.035em", fontWeight: "700" }],
        "display": ["clamp(2rem, 3.6vw, 3rem)", { lineHeight: "1.08", letterSpacing: "-0.03em", fontWeight: "700" }],
        "title": ["1.5rem", { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" }],
      },
      borderRadius: { xl: "14px", "2xl": "18px", "3xl": "26px" },
      boxShadow: {
        card: "0 1px 2px rgba(16,28,22,0.04), 0 10px 30px -18px rgba(16,28,22,0.18)",
        lift: "0 2px 4px rgba(16,28,22,0.05), 0 24px 48px -24px rgba(16,28,22,0.28)",
        ring: "0 0 0 1px rgba(16,28,22,0.06)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0", transform: "translateY(4px)" }, to: { opacity: "1", transform: "none" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        pulseDot: { "0%,100%": { opacity: "0.35" }, "50%": { opacity: "1" } },
      },
      animation: {
        "fade-in": "fade-in .35s ease-out both",
        shimmer: "shimmer 1.6s infinite",
        "pulse-dot": "pulseDot 1.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
