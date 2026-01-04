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
        // Solana-inspired colors (matching Solana.com)
        solana: {
          green: "#14F195", // Solana green
          blue: "#03E1FF", // Ocean Blue (keeping)
          purple: "#9945FF", // Solana purple
          black: "#000000",
        },
        primary: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#9945FF", // Solana purple
          600: "#a855f7",
          700: "#9333ea",
          800: "#7e22ce",
          900: "#6b21a8",
        },
        accent: {
          green: "#14F195", // Solana green
          blue: "#03E1FF",
        },
        // Badoo & Bumble Hybrid Palette
        brand: {
          red: "#C8001A",
          lavender: "#E9D8FF",
          "near-black": "#121212",
          yellow: "#FFDB5B",
          "yellow-light": "#FFF386",
          black: "#202020",
        },
      },
      fontFamily: {
        serif: ["Beausite Classic", "Playfair Display", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
