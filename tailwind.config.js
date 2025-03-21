/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
        colors: {
          forest: {
            light: '#63c663',
            DEFAULT: '#2c932c',
            dark: '#096309',
          }
        },
    },
},
  plugins: [],
}

