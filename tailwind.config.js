/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./docs/.vitepress/**/*.{vue,js,ts,jsx,tsx,md}", 
    "./docs/src/**/*.{vue,js,ts,jsx,tsx,md}",
    "./docs/src/zh/**/*.{vue,js,ts,jsx,tsx,md}",
    "./docs/**/*.md"
  ],
  theme: {
    extend: {
      colors: {
        VPLight: "#3451b2",
        VPDark: "#a8b1ff",
      },
    },
  },
  plugins: [],
  darkMode: "class",
};
