/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue, js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#131517',
        secondary: '#212329'
      }
    }
  },
  plugins: []
}
