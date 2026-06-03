/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // We can define custom MERN project theme colors if we want,
        // e.g., the primary #305457 color from the index.css.
        primary: {
          DEFAULT: '#305457',
          dark: '#233d40',
          light: '#427579',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
