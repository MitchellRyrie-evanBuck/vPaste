/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/renderer/**/*.{js,jsx,ts,tsx}',
    './src/main/**/*.{js,jsx,ts,tsx}',
    './src/preload/**/*.{js,jsx,ts,tsx}',
    './src/renderer/index.html'
  ],
  theme: {
    extend: {}
  },
  plugins: []
}
