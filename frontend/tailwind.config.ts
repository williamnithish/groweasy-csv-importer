import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        canvas: "#0B0E11",
        surface: {
          DEFAULT: "#12161B",
          raised: "#181D24",
          hover: "#1E242C",
        },
        border: {
          DEFAULT: "#242A32",
          strong: "#323944",
        },
        ink: {
          DEFAULT: "#E7EAEE",
          muted: "#9198A6",
          faint: "#5D6472",
        },
        amber: {
          DEFAULT: "#E8A33D",
          soft: "#F0BE72",
          dim: "#5A431F",
        },
        signal: {
          blue: "#5B8DEF",
          green: "#4ADE80",
          red: "#F0665A",
        },
      },
      borderRadius: {
        card: "10px",
      },
      keyframes: {
        "flow-dash": {
          to: { strokeDashoffset: "-24" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "flow-dash": "flow-dash 1.2s linear infinite",
        "fade-up": "fade-up 0.35s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
