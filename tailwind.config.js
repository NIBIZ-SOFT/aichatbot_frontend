/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        mint: {
          DEFAULT: '#00C978',
          50: '#EAFAF2',
          100: '#D5F5E6',
          200: '#AAEBCC',
          300: '#80E2B3',
          400: '#2BD893',
          500: '#00C978',
          600: '#00A864',
          700: '#008750',
          800: '#00663C',
          900: '#004528',
          950: '#002616',
        },
        forest: {
          DEFAULT: '#080D0A',
          50: '#F4F7F5',
          100: '#E4ECE7',
          200: '#C9D9CF',
          300: '#A4BFB0',
          400: '#759B87',
          500: '#4F7863',
          600: '#385747',
          700: '#263D31',
          800: '#17271F',
          900: '#0F1713',
          950: '#080D0A',
        }
      }
    },
  },
  plugins: [],
};
