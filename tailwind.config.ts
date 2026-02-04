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
        // VAIIYA-inspired colors
        vaiiya: {
          orange: "#FF5C16", // Primary orange
          purple: "#3D065F", // Secondary purple
          gray: "#4B5563", // Body text
          light: "#F7F9FC", // Light background
          white: "#FFFFFF",
          border: "#E9EDF6", // Card border
        },
        primary: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#FF5C16", // VAIIYA orange
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        secondary: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#3D065F", // VAIIYA purple
          600: "#4c1d95",
          700: "#371b78", // darker
          800: "#2e1065",
          900: "#1e1b4b",
        },
        // Dark theme colors (keeping for compatibility but will default to light)
        background: {
          primary: "#FFFFFF",
          secondary: "#F7F9FC",
          tertiary: "#E9EDF6",
        },
        text: {
          primary: "#3D065F", // Purple for headings
          secondary: "#4B5563", // Gray for body
          tertiary: "#9CA3AF",
        },
      },
      fontFamily: {
        serif: ["Poly", "Georgia", "serif"],
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        "3xl": "32px",
      },
    },
  },
  plugins: [],
};
export default config;
