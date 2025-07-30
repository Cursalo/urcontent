/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Strict grayscale palette - no colors allowed
        transparent: 'transparent',
        current: 'currentColor',
        black: '#000000',
        white: '#ffffff',
        
        // System colors - all mapped to grayscale
        border: "#e5e5e5",
        input: "#e5e5e5",
        ring: "#a3a3a3",
        background: "#ffffff",
        foreground: "#000000",
        
        // Primary - Pure black
        primary: {
          DEFAULT: "#000000",
          foreground: "#ffffff",
        },
        
        // Secondary - Medium gray
        secondary: {
          DEFAULT: "#737373",
          foreground: "#ffffff",
        },
        
        // Destructive - Dark gray
        destructive: {
          DEFAULT: "#525252",
          foreground: "#ffffff",
        },
        
        // Muted - Light gray
        muted: {
          DEFAULT: "#f3f3f3",
          foreground: "#737373",
        },
        
        // Accent - Light gray
        accent: {
          DEFAULT: "#f3f3f3",
          foreground: "#000000",
        },
        
        // Popover - White
        popover: {
          DEFAULT: "#ffffff",
          foreground: "#000000",
        },
        
        // Card - White
        card: {
          DEFAULT: "#ffffff",
          foreground: "#000000",
        },
        
        // Grayscale spectrum
        gray: {
          50: '#f9f9f9',
          100: '#f3f3f3',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        
        // Disable all other colors by mapping them to grayscale
        red: { DEFAULT: '#525252', 500: '#525252' },
        orange: { DEFAULT: '#737373', 500: '#737373' },
        amber: { DEFAULT: '#737373', 500: '#737373' },
        yellow: { DEFAULT: '#a3a3a3', 500: '#a3a3a3' },
        lime: { DEFAULT: '#a3a3a3', 500: '#a3a3a3' },
        green: { DEFAULT: '#737373', 500: '#737373' },
        emerald: { DEFAULT: '#737373', 500: '#737373' },
        teal: { DEFAULT: '#737373', 500: '#737373' },
        cyan: { DEFAULT: '#737373', 500: '#737373' },
        sky: { DEFAULT: '#a3a3a3', 500: '#a3a3a3' },
        blue: { DEFAULT: '#525252', 500: '#525252' },
        indigo: { DEFAULT: '#404040', 500: '#404040' },
        violet: { DEFAULT: '#404040', 500: '#404040' },
        purple: { DEFAULT: '#404040', 500: '#404040' },
        fuchsia: { DEFAULT: '#525252', 500: '#525252' },
        pink: { DEFAULT: '#737373', 500: '#737373' },
        rose: { DEFAULT: '#737373', 500: '#737373' },
      },
      borderRadius: {
        DEFAULT: '4px',
        'none': '0px',
        'sm': '4px',
        'md': '4px',
        'lg': '4px',
        'xl': '4px',
        '2xl': '4px',
        '3xl': '4px',
        'full': '9999px', // Keep for avatar circles only
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}