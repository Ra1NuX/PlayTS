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
        hover: {
          ancient: {
            dark: '#1f5cb3',
          }
        },
        divider: {
          dark: '#1f1f1f',
        },
        accent: {
          dark: '#2b73da',
        }
      }
    },
  },
  plugins: [require('tailwindcss-aria-attributes')],
}

