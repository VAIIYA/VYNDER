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
        // MetaMask-inspired colors
        metamask: {
          orange: "#FF6B35", // Primary orange
          blue: "#03E1FF", // Secondary blue
          purple: "#9945FF", // Accent purple
          green: "#14F195", // Success green
          black: "#000000",
          "dark-gray": "#121212",
          "medium-gray": "#2A2A2A",
          "light-gray": "#404040",
        },
        twitter: {
          blue: "#1DA1F2",
        },
        primary: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#FF6B35", // MetaMask orange
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        secondary: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#03E1FF", // MetaMask blue
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
        },
        accent: {
          purple: "#9945FF", // MetaMask purple
          green: "#14F195", // MetaMask green
        },
        // Dark theme colors
        background: {
          primary: "#000000",
          secondary: "#121212",
          tertiary: "#2A2A2A",
        },
        text: {
          primary: "#FFFFFF",
          secondary: "#CCCCCC",
          tertiary: "#888888",
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
