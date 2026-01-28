/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      sans: ['ui-sans-serif', 'system-ui', 'sans-serif'],
      serif: ['ui-sans-serif', 'system-ui', 'sans-serif'],
    },
    extend: {
<<<<<<< HEAD
=======
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
>>>>>>> d37b4caaad1d17e72ef4a3f220961c2ff9eec2dd
      colors: {
        sand: '#F6F1E9',
        linen: '#FBF9F5',
        'warm-linen': '#FBF9F5',
        stone: '#E6DFD4',
        driftwood: '#CBBFAF',
        'sea-glass': '#9FBFBB',
        'deep-ocean': '#2F4F4F',
        charcoal: '#1F2933',
        'gold-accent': '#D9C7A1',
        'soft-gold': '#D9C7A1',
      },
    },
  },
  plugins: [],
};
