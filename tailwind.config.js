/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'space': ['Space Grotesk', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      colors: {
        primary: '#000000',
        secondary: '#FF5733',
        accent: '#00FF00',
        background: '#FFFFFF',
        'brutal-shadow': '#000000',
      },
      spacing: {
        'brutal': '24px',
      },
      boxShadow: {
        'brutal': '8px 8px 0px #000000',
        'brutal-hover': '12px 12px 0px #000000',
        'brutal-sm': '4px 4px 0px #000000',
      },
      borderRadius: {
        'brutal': '0px',
      },
      screens: {
        'xs': '320px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        'mobile': '320px',
        'tablet': '481px',
        'desktop': '769px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite alternate',
        'slide-up': 'slide-up 0.5s ease-out',
        'glitch': 'glitch 0.3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%': { boxShadow: '0 0 5px rgba(255, 87, 51, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(255, 87, 51, 0.8), 0 0 30px rgba(255, 87, 51, 0.6)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};