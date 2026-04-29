/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'forest-green': '#15803d',
        'ocean-blue': '#1e40af',
      },
    },
  },
  plugins: [],
}
