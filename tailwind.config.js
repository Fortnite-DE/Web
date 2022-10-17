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
      'verify-confirm': 'background-image: radial-gradient(\n' +
          '                 circle at 50% -50%,\n' +
          '                     hsl(87.86, 96.08%, 60%) 0%,\n' +
          '                     hsla(87.86, 96.08%, 60%, 0.935) 0.4%,\n' +
          '                     hsla(87.86, 96.08%, 60%, 0.861) 1.6%,\n' +
          '                     hsla(87.86, 96.08%, 60%, 0.781) 3.7%,\n' +
          '                     hsla(87.86, 96.08%, 60%, 0.607) 10.4%,\n' +
          '                     hsla(87.86, 96.08%, 60%, 0.518) 15%,\n' +
          '                     hsla(87.86, 96.08%, 60%, 0.43) 20.6%,\n' +
          '                     hsla(87.86, 96.08%, 60%, 0.346) 27.1%,\n' +
          '                     hsla(87.86, 96.08%, 60%, 0.266) 34.6%,\n' +
          '                     hsla(87.86, 96.08%, 60%, 0.193) 43%,\n' +
          '                     hsla(87.86, 96.08%, 60%, 0.128) 52.3%,\n' +
          '                     hsla(87.86, 96.08%, 60%, 0.075) 62.7%,\n' +
          '                     hsla(87.86, 96.08%, 60%, 0.035) 74.1%,\n' +
          '                     hsla(87.86, 96.08%, 60%, 0.009) 86.5%,\n' +
          '                     hsla(87.86, 96.08%, 60%, 0) 100%\n' +
          '                 ),' +
          '                 url(/images/verify-success.webp)',
      'verify-error': 'background-image: radial-gradient(\n' +
          '               circle at 50% -50%,\n' +
          '                   hsl(87.86, 96.08%, 60%) 0%,\n' +
          '                   hsla(87.86, 96.08%, 60%, 0.935) 0.4%,\n' +
          '                   hsla(87.86, 96.08%, 60%, 0.861) 1.6%,\n' +
          '                   hsla(87.86, 96.08%, 60%, 0.781) 3.7%,\n' +
          '                   hsla(87.86, 96.08%, 60%, 0.607) 10.4%,\n' +
          '                   hsla(87.86, 96.08%, 60%, 0.518) 15%,\n' +
          '                   hsla(87.86, 96.08%, 60%, 0.43) 20.6%,\n' +
          '                   hsla(87.86, 96.08%, 60%, 0.346) 27.1%,\n' +
          '                   hsla(87.86, 96.08%, 60%, 0.266) 34.6%,\n' +
          '                   hsla(87.86, 96.08%, 60%, 0.193) 43%,\n' +
          '                   hsla(87.86, 96.08%, 60%, 0.128) 52.3%,\n' +
          '                   hsla(87.86, 96.08%, 60%, 0.075) 62.7%,\n' +
          '                   hsla(87.86, 96.08%, 60%, 0.035) 74.1%,\n' +
          '                   hsla(87.86, 96.08%, 60%, 0.009) 86.5%,\n' +
          '                   hsla(87.86, 96.08%, 60%, 0) 100%\n' +
          '               ),' +
          '               url(/images/verify-error.webp)',
      'fortnite': "url('/images/fortnite.webp')",
      'fortnite-responsive': "url('/images/fortnite_responsive.webp')",
      'elements': "url('/images/elements.svg')"
    },
    animation: {
      'arrow-colors-1': 'color_anim 1s infinite 0.6s',
      'arrow-colors-2': 'color_anim 1s infinite 0.4s',
      'arrow-colors-3': 'color_anim 1s infinite 0.2s',
      'verified-scale': 'scale 3s ease-in-out'
    },
    keyframes: {
        color_anim: {
          '0%, 100%': { fill: 'white' },
          '50%': { fill: 'black' },
        },
        scale: {
          '0%, 35%': { transform: 'scale(0.0)', opacity: '0%' },
          '100%': { transform: 'scale(1.0)', opacity: '100%' }
        }
    },
    extend: {},
  },
  plugins: [],
}
