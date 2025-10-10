/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      transitionProperty: {
        width: 'width',
      },
      colors: {
        main: {
          dark: '#181818',
          contrast: '#171717',
          light: '#1c1c1e'
        },
        divider: {
          dark: '#1f1f1f',
        },
        accent: {
          dark: '#0D73FF',
        }
      }
    },
  },
  plugins: [require('tailwindcss-aria-attributes')],
}

