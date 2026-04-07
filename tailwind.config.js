/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        compliance: '#FF8C00',
        capture: '#0066CC',
        validation: '#22C55E',
      }
    },
  },
  plugins: [],
}
