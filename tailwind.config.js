/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,tsx,ts,jsx}",
    "./src/components/**/*.{js,tsx,ts,jsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        '3xs': '0.5rem',  // 8px
        '2xs': '0.625rem', // 10px
      },
      colors: {
        richer_black: {
          DEFAULT: "#020912",
          100: "#000204",
          200: "#010407",
          300: "#01050b",
          400: "#02070f",
          500: "#020912",
          600: "#0c356a",
          700: "#1661c3",
          800: "#4f93eb",
          900: "#a7c9f5",
        },
        rich_black: {
          DEFAULT: "#041225",
          100: "#010407",
          200: "#02070f",
          300: "#020b16",
          400: "#030e1d",
          500: "#041225",
          600: "#0d3a79",
          700: "#1763ce",
          800: "#5695ec",
          900: "#abcaf6",
        },
        oxforder_blue: {
          DEFAULT: "#071932",
          100: "#01050a",
          200: "#030a14",
          300: "#040f1d",
          400: "#061427",
          500: "#071932",
          600: "#124081",
          700: "#1e68d0",
          800: "#6099e8",
          900: "#b0ccf4",
        },
        oxford_blue: {
          DEFAULT: "#082540",
          100: "#02070d",
          200: "#030f19",
          300: "#051626",
          400: "#061d33",
          500: "#082540",
          600: "#12528e",
          700: "#1b7fdc",
          800: "#63aaec",
          900: "#b1d4f5",
        },
        midnight_green: {
          DEFAULT: "#023c4d",
          100: "#000c0f",
          200: "#01171e",
          300: "#01232d",
          400: "#022e3c",
          500: "#023c4d",
          600: "#047b9f",
          700: "#06bcf4",
          800: "#56d4fb",
          900: "#aaeafd",
        },
        'blue_munsell': { DEFAULT: '#5b95a5', 100: '#121e21', 200: '#243b42', 300: '#365963', 400: '#487784', 500: '#5b95a5', 600: '#7baab7', 700: '#9cbfc9', 800: '#bdd4db', 900: '#deeaed' }, 'prussian_blue': { DEFAULT: '#1e3350', 100: '#060a10', 200: '#0c1521', 300: '#131f31', 400: '#192a41', 500: '#1e3350', 600: '#35598b', 700: '#527fbd', 800: '#8ca9d3', 900: '#c5d4e9' }, 
        powder_blue: {
          DEFAULT: "#b4c5e4",
          100: "#16233c",
          200: "#2b4678",
          300: "#4169b4",
          400: "#7896ce",
          500: "#b4c5e4",
          600: "#c3d0e9",
          700: "#d2dcef",
          800: "#e1e8f4",
          900: "#f0f3fa",
        },
        ivory: {
          DEFAULT: "#fbfff1",
          100: "#476300",
          200: "#8ec600",
          300: "#c3ff2a",
          400: "#dfff8d",
          500: "#fbfff1",
          600: "#fcfff3",
          700: "#fcfff6",
          800: "#fdfff9",
          900: "#fefffc",
        },
      },
      backgroundImage: {
        "background-texture": "url('/assets/images/background.png')",
      },
      show: {
        "0%": { opacity: "0", visibility: "visible" },
        "100%": { opacity: "100", zIndex: "50" },
      },
      hide: {
        "0%": { opacity: "100" },
        "100%": { opacity: "0", display: "none", zIndex: "-50" },
      },
      travelFade: {
        '0%': {
          opacity: 0,
          'stroke-dashoffset': 100
        },
        '20%': {
          opacity: 1
        },
        '55%': {
          opacity: 1
        },
    
        '75%': {
          'stroke-dashoffset': 0
        },
        '100%': {
          opacity: 0
        }
      },
      animation: {
        show: "show 500ms ease forwards",
        hide: "hide 500ms ease forwards",
        animatedLetters: "lettersAnimation 25s linear infinite",
        travelFade: 'travelFade 1 ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
