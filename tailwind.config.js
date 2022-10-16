/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      'poppins': ['Poppins', 'sans-serif'],
    },
    backgroundImage: {
      'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      'fortnite': "url('/images/fortnite.webp')",
      'fortnite-responsive': "url('/images/fortnite_responsive.webp')",
    },
    animation: {
      'arrow-colors-1': 'color_anim 1s infinite 0.6s',
      'arrow-colors-2': 'color_anim 1s infinite 0.4s',
      'arrow-colors-3': 'color_anim 1s infinite 0.2s',
    },
    keyframes: {
        color_anim: {
          '0%, 100%': { fill: 'white' },
          '50%': { fill: 'black' },
        }
    },
    extend: {},
  },
  plugins: [],
}
