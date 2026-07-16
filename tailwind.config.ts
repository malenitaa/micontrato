import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        btnbg: "rgb(var(--color-btn-bg) / <alpha-value>)",
        btnfg: "rgb(var(--color-btn-fg) / <alpha-value>)",
        amber: {
          50: "#fdf8ee",
          100: "#f8ecd0",
          300: "#e8c778",
          500: "#c9922f",
          700: "#8a5f18",
        },
      },
    },
  },
  plugins: [],
};

export default config;
