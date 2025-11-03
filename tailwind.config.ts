import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brutalist black and white color scheme
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
      },
      borderRadius: {
        lg: "0",
        md: "0",
        sm: "0",
      },
      fontFamily: {
        mono: ['"Courier New"', "Monaco", "Consolas", "monospace"],
        doto: ['"Doto"', "sans-serif"],
        pixel: ['"Press Start 2P"', "monospace"],
      },
      animation: {
        pixelPulse: "pixelPulse 1s ease-in-out infinite",
      },
      keyframes: {
        pixelPulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      boxShadow: {
        'brutal': '8px 8px 0 0 rgba(0, 0, 0, 1)',
        'brutal-sm': '4px 4px 0 0 rgba(0, 0, 0, 1)',
      },
    },
  },
  plugins: [],
};

export default config;

