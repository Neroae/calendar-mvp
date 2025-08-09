/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f2f7ff',
          100: '#e5efff',
          200: '#bfd7ff',
          300: '#99beff',
          400: '#4d8cff',
          500: '#004bff',
          600: '#0044e6',
          700: '#0038bf',
          800: '#002c99',
          900: '#00247d'
        }
      }
    }
  },
  plugins: []
};