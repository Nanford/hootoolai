/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0070f3",
        "apple-blue": "#0070f3",
        "apple-cyan": "#5AC8FA",
        "apple-green": "#34C759",
        "apple-orange": "#FF9500",
        "apple-red": "#FF3B30",
        "apple-purple": "#AF52DE",
        "apple-gray-light": "#F2F2F7",
        "apple-gray-medium": "#E5E5EA",
        "apple-gray-dark": "#8E8E93",
      },
    },
  },
  plugins: [],
} 