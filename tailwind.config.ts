import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ln: {
          orange: "#FF8C00",
          purple: "#7C3AED",
          bg: "#0F1419",
          card: "#171C24",
          border: "#232A35",
          success: "#10B981",
          pending: "#F59E0B",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      keyframes: {
        "slide-in": {
          "0%": { opacity: "0", transform: "translateY(-10px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "pop": {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "60%": { transform: "scale(1.15)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "burst": {
          "0%": { transform: "scale(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "scale(1.8) rotate(120deg)", opacity: "0" },
        },
        "shimmer": {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "slide-in": "slide-in 0.35s ease-out",
        "pop": "pop 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28)",
        "burst": "burst 0.8s ease-out forwards",
        "shimmer": "shimmer 1.5s infinite",
      },
      backgroundImage: {
        "ln-gradient": "linear-gradient(135deg, #FF8C00 0%, #7C3AED 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
