import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#faf9f6",
        ink: "#1f2320",
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
