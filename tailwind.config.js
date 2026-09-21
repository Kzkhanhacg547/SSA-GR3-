/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        sakura: {
          50: "#fff1f4",
          100: "#ffe4e9",
          200: "#fecdd7",
          300: "#fda4b9",
          400: "#fb7193",
          500: "#f43f6e",
          600: "#e11d53",
          700: "#be1241",
          800: "#9f123a",
          900: "#831435",
        },
        torii: {
          500: "#dc2626",
          600: "#b91c1c",
          700: "#991b1b",
        },
        sumi: {
          800: "#1e293b",
          900: "#0f172a",
          950: "#090d16",
        },
        fuji: {
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
        },
        matcha: {
          500: "#10b981",
          600: "#059669",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "Hiragino Kaku Gothic ProN", "Noto Sans JP", "system-ui", "sans-serif"],
        jp: ["var(--font-jp)", "Noto Sans JP", "Hiragino Kaku Gothic ProN", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)",
        "card-hover": "0 10px 25px -3px rgba(0, 0, 0, 0.08), 0 4px 10px -2px rgba(0, 0, 0, 0.04)",
        glow: "0 0 20px -3px rgba(244, 63, 110, 0.35)",
        "glow-gold": "0 0 20px -3px rgba(245, 158, 11, 0.35)",
      },
      keyframes: {
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        float: "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
