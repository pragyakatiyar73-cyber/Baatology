/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        'aura-bg':      '#070b12',
        'aura-panel':   '#090e17',
        'aura-border':  '#1e2a3a',
        'aura-teal':    '#0dd9b8',
        'aura-emerald': '#10b981',
        'aura-gold':    '#f59e0b',
        'aura-cyan':    '#00e5ff',
      },
    },
  },
  plugins: [],
}
