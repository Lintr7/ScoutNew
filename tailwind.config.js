/** @type {import('tailwindcss').Config} */
export default {
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