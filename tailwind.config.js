/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Add this line
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          925: '#0a0e1a',
        }
      }
    },
  },
  plugins: [],
}