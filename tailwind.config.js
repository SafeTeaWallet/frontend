/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#f5f0ff',
          100: '#ede0ff',
          200: '#d9bfff',
          300: '#bf8fff',
          400: '#a855f7',
          500: '#9333ea',
          600: '#7c22ce',
          700: '#6b1ab5',
          800: '#581a93',
          900: '#3b0764',
        },
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          from: { boxShadow: '0 0 20px rgba(147, 51, 234, 0.3)' },
          to:   { boxShadow: '0 0 40px rgba(147, 51, 234, 0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
