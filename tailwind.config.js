/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      sans: ['ui-sans-serif', 'system-ui', 'sans-serif'],
      serif: ['ui-sans-serif', 'system-ui', 'sans-serif'],
    },
    extend: {
      colors: {
        'accent-gold': '#cfa15a',
      },
    },
  },
  plugins: [],
};
