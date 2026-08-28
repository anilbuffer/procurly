import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: {
            DEFAULT: "#ed2025",
            hover: "#d3181d",
            dark: "#b31317",
            light: "#fef2f2",
            subtle: "#fee2e2",
          },
          blue: {
            DEFAULT: "#2b4499",
            hover: "#22377d",
            dark: "#1a2a61",
            navy: "#131d3f",
            light: "#eff6ff",
            subtle: "#dbeafe",
          },
          canvas: "#F8FAFC",
          card: "#FFFFFF",
          text: {
            primary: "#0F172A",
            secondary: "#475569",
            muted: "#64748B",
            light: "#94A3B8",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        heading: ["var(--font-heading)", "Plus Jakarta Sans", "Outfit", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        card: "0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.04)",
        elevated: "0 10px 25px -5px rgba(43, 68, 153, 0.08), 0 8px 10px -6px rgba(43, 68, 153, 0.04)",
        glow: "0 0 25px -5px rgba(237, 32, 37, 0.35)",
        "glow-lg": "0 0 35px -5px rgba(237, 32, 37, 0.5)",
        "glow-blue": "0 0 25px -5px rgba(43, 68, 153, 0.35)",
        "btn-primary": "0 4px 14px 0 rgba(237, 32, 37, 0.39)",
        "btn-primary-hover": "0 6px 20px 0 rgba(237, 32, 37, 0.5)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "radar-scan": "radarScan 4s linear infinite",
        "pulse-glow": "pulseGlow 2.5s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        radarScan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(400%)" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.08)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

