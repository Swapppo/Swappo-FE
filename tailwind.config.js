/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,ts,tsx}',
    './components/**/*.{js,ts,tsx}',
    './screens/**/*.{js,ts,tsx}',
    './context/**/*.{js,ts,tsx}',
  ],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        cream: '#F5F2EA',
        primary: {
          DEFAULT: '#4B4DED',
          dark: '#3b3ec7',
        },
        accent: {
          red: '#D94F35',
          green: '#3BAE58',
          yellow: '#F2A93B',
        },
        dark: '#1A1A1A',
      },
      fontFamily: {
        'young-serif': ['Young Serif', 'serif'],
        'manrope': ['Manrope', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '32px',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};
