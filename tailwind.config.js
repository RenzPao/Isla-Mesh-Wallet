/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        'neu-bg': '#e0e5ec',
        'neu-light': '#ffffff',
        'neu-shadow': '#a3b1c6',
      },
      boxShadow: {
        'neu-flat': '9px 9px 16px rgba(163, 177, 198, 0.6), -9px -9px 16px rgba(255, 255, 255, 0.5)',
        'neu-pressed': 'inset 9px 9px 16px rgba(163, 177, 198, 0.6), inset -9px -9px 16px rgba(255, 255, 255, 0.5)',
      }
    },
  },
  plugins: [],
};
