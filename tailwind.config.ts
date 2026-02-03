import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "gradient-move": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "gradient-move": "gradient-move 14s ease infinite",
        shimmer: "shimmer 1.8s linear infinite",
      },
      boxShadow: {
        soft: "0 18px 50px -26px rgba(15, 23, 42, 0.35)",
        glow: "0 0 0 1px rgba(255,255,255,0.15), 0 20px 80px -40px rgba(16, 185, 129, 0.45)",
      },
      backgroundImage: {
        "glass-grid":
          "linear-gradient(120deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%), radial-gradient(circle at 10% 20%, rgba(79, 70, 229, 0.12), transparent 25%), radial-gradient(circle at 90% 10%, rgba(16, 185, 129, 0.18), transparent 30%)",
      },
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-space-mono)", "ui-monospace", "SFMono-Regular"],
      },
    },
  },
  plugins: [animate],
};

export default config;
