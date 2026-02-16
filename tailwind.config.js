/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#0a0e14',
          900: '#0f1621',
          800: '#1a2234',
          700: '#243047',
          600: '#3a4d6b',
          400: '#7a90b0',
          300: '#a8bcd4',
          100: '#e8eef6',
        },
        amber: {
          400: '#f5a623',
          300: '#f7c06e',
          200: '#fad9a0',
          100: '#fef3dc',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
