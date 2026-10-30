/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Field green: navigation, primary actions, and brand accents
        field: {
          50: '#f2f8f0',
          100: '#e0efdb',
          200: '#bfe0b4',
          500: '#3f8f3a',
          600: '#2f7a2c',
          700: '#26612a',
          800: '#1e4d22',
          900: '#14331a',
          950: '#0b1e0f',
        },
        // Soil and paper tones for backgrounds and borders
        soil: {
          50: '#fbf9f3',
          100: '#f4f0e3',
          200: '#e4dcc4',
          700: '#5b4a2f',
          800: '#3f3320',
          900: '#2a2216',
        },
      },
    },
  },
  plugins: [],
}
