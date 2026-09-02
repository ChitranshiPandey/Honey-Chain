import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#231A10",
        paper: "#FDFCFA",
        primary: {
          DEFAULT: "#8C5A1E",
          tint: "#F1E4D2",
          dark: "#6B4416",
        },
        gold: {
          DEFAULT: "#F2A93B",
          tint: "#FCEEDA",
          dark: "#B8860B",
        },
        trust: {
          DEFAULT: "#0F6E56",
          tint: "#DCEFE9",
          dark: "#0A4D3D",
        },
        alert: {
          DEFAULT: "#A94438",
          tint: "#F7E4E0",
        },
        muted: "#6B5B47",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-manrope)", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
