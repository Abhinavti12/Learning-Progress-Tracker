/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#132A2A',
          hover: '#0c1b1b',
          surface: '#1b3a3a',
          dark: '#0a1616',
        },
        botanical: {
          DEFAULT: '#245B52',
          hover: '#1b4740',
          light: '#e9f2f0',
          border: '#387c71',
        },
        sage: {
          DEFAULT: '#B7D6A5',
          light: '#f2f8ed',
          dark: '#3f5d2f',
          border: '#a2c78d',
        },
        copper: {
          DEFAULT: '#E6A66A',
          light: '#fdf4ec',
          dark: '#8b521c',
          border: '#dd9652',
        },
        parchment: {
          DEFAULT: '#F0E9D8',
          light: '#FAF7F0',
          card: '#FFFFFF',
          dark: '#E2D7C2',
          border: '#DDD1B8',
        }
      }
    },
  },
  plugins: [],
}
