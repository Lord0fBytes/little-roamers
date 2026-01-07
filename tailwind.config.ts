import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        sage: {
          light: 'var(--sage-green-light)',
          DEFAULT: 'var(--sage-green)',
          dark: 'var(--sage-green-dark)',
        },
        sky: {
          light: 'var(--sky-blue-light)',
          DEFAULT: 'var(--sky-blue)',
          dark: 'var(--sky-blue-dark)',
        },
        clay: {
          light: 'var(--clay-light)',
          DEFAULT: 'var(--clay)',
          dark: 'var(--clay-dark)',
        },
        sand: 'var(--warm-sand)',
        cream: 'var(--cream)',
        sunshine: 'var(--sunshine-yellow)',
        warm: {
          50: 'var(--warm-gray-50)',
          100: 'var(--warm-gray-100)',
          200: 'var(--warm-gray-200)',
          300: 'var(--warm-gray-300)',
          400: 'var(--warm-gray-400)',
          500: 'var(--warm-gray-500)',
          600: 'var(--warm-gray-600)',
          700: 'var(--warm-gray-700)',
          800: 'var(--warm-gray-800)',
          900: 'var(--warm-gray-900)',
        },
      },
      borderRadius: {
        'card': '16px',
        'soft': '12px',
      },
      boxShadow: {
        'soft': 'var(--shadow-soft)',
        'card': 'var(--shadow-medium)',
        'hover': 'var(--shadow-hover)',
      },
    },
  },
  plugins: [],
};

export default config;
