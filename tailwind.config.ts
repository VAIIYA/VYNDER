import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Solana-inspired colors
        solana: {
          green: "#00FFA3", // Surge Green
          blue: "#03E1FF", // Ocean Blue
          purple: "#DC1FFF", // Purple Dino
          black: "#000000",
        },
        primary: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#DC1FFF", // Purple Dino
          600: "#a855f7",
          700: "#9333ea",
          800: "#7e22ce",
          900: "#6b21a8",
        },
        accent: {
          green: "#00FFA3", // Surge Green
          blue: "#03E1FF", // Ocean Blue
        },
      },
    },
  },
  plugins: [],
};
export default config;




