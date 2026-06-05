/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4ECDC4",
          dark: "#3AAFA9",
        },
        accent: {
          DEFAULT: "#F5A623",
          dark: "#E09010",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          2: "#E8F0EF",
        },
        border: "#D0DEDC",
        background: "#F0F4F8",
        foreground: "#2D3142",
        muted: "#5C6480",
        success: "#22C55E",
        error: "#EF4444",
        warning: "#F5A623",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        heading: ["Syne", "sans-serif"],
      },
    },
  },
  plugins: [],
};
