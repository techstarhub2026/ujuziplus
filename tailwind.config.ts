import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";
import { UJUZI } from "./src/lib/ujuzi-brand";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Values shared with `UJUZI` (src/lib/ujuzi-brand.ts, consumed directly by MUI `sx`
        // props) are derived from it so the two never drift out of sync. Values with no
        // UJUZI equivalent (tints/shades unique to Tailwind usage) stay as literals.
        brand: {
          DEFAULT: UJUZI.orange,
          light: UJUZI.orangeLight,
          dark: UJUZI.orangeDark,
          muted: "#f5b366",
          glow: "#ffb347",
        },
        navy: {
          DEFAULT: UJUZI.navy,
          light: UJUZI.navyLight,
          dark: UJUZI.navyDark,
          muted: UJUZI.navyMuted,
        },
        accent: {
          DEFAULT: UJUZI.accent,
          light: UJUZI.orangeLight,
          dark: UJUZI.orangeDark,
        },
        wazi: {
          sidebar: UJUZI.sidebar,
          "sidebar-hover": UJUZI.sidebarHover,
          link: UJUZI.link,
          surface: UJUZI.surface,
          border: UJUZI.border,
          muted: UJUZI.textMuted,
        },
        surface: {
          DEFAULT: UJUZI.white,
          muted: "#F9FAFB",
          border: "#E5E7EB",
          elevated: UJUZI.white,
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-poppins)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      borderRadius: {
        card: "12px",
        "2xl": "1rem",
        "3xl": "1.25rem",
        "4xl": "1.5rem",
      },
      boxShadow: {
        card: "0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)",
        "card-hover":
          "0 20px 40px -8px rgb(243 146 35 / 0.2), 0 8px 20px -4px rgb(0 0 0 / 0.08)",
        glow: "0 0 40px -4px rgb(243 146 35 / 0.55)",
        "glow-sm": "0 0 20px -2px rgb(243 146 35 / 0.4)",
        soft: "0 2px 12px rgb(0 0 0 / 0.05), 0 1px 3px rgb(0 0 0 / 0.03)",
        inset: "inset 0 1px 2px rgb(0 0 0 / 0.04)",
        toast: "0 12px 40px -8px rgb(0 0 0 / 0.22), 0 4px 16px -2px rgb(0 0 0 / 0.1)",
        hero: "0 25px 50px -12px rgb(243 146 35 / 0.45)",
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #ffb347 0%, #f39223 50%, #d97f12 100%)",
        "gradient-brand-soft": "linear-gradient(135deg, #fef3e6 0%, #fff7ed 50%, #ffffff 100%)",
        "gradient-navy": "linear-gradient(135deg, #00004D 0%, #000033 100%)",
        "gradient-navy-soft": "linear-gradient(135deg, #e8e8f5 0%, #f4f4fa 50%, #ffffff 100%)",
        "gradient-radial-warm":
          "radial-gradient(ellipse at top, rgb(255 183 77 / 0.15), transparent 60%)",
      },
      transitionDuration: {
        DEFAULT: "200ms",
      },
      animation: {
        "fade-in": "fadeIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        "slide-up": "slideUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards",
        shimmer: "shimmer 2s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-12px) scale(1.03)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px -4px rgb(243 146 35 / 0.3)" },
          "50%": { boxShadow: "0 0 32px -2px rgb(243 146 35 / 0.55)" },
        },
      },
    },
  },
  plugins: [typography],
};

export default config;
