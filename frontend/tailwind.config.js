/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Alluxi Signature Palette
        ablue: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB', // Alluxi Royal Electric Blue
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#172554',
        },
        nblue: {
          500: '#1E3A8A',
          600: '#172554',
          800: '#0F172A',
          900: '#08102B', // Alluxi Deep Midnight Obsidian Navy
          950: '#040817',
        },
        agray: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E40AF',
          800: '#1E3A8A',
          900: '#172554',
          950: '#08102B',
        },
        emerald: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        amber: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
        rose: {
          50: '#FFF1F2',
          100: '#FFE4E6',
          200: '#FECDD3',
          300: '#FDA4AF',
          400: '#FB7185',
          500: '#F43F5E',
          600: '#E11D48',
        }
      },
      fontFamily: {
        sans: ['"Manrope"', '"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        manrope: ['"Manrope"', 'sans-serif'],
        display: ['"Manrope"', '"Outfit"', '"Plus Jakarta Sans"', 'sans-serif'],
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'SFMono-Regular', 'Menlo', 'monospace'],
        heading: ['"Manrope"', '"Space Grotesk"', '"Outfit"', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(8, 16, 43, 0.04), 0 1px 2px -1px rgba(8, 16, 43, 0.04)',
        '3xl': '0 20px 40px -15px rgba(8, 16, 43, 0.07), 0 0 1px 1px rgba(8, 16, 43, 0.03)',
        '4xl': '0 30px 60px -15px rgba(8, 16, 43, 0.12), 0 0 1px 1px rgba(8, 16, 43, 0.04)',
        'glow-blue': '0 0 30px -5px rgba(37, 99, 235, 0.35)',
        'elevated': '0 20px 35px -10px rgba(8, 16, 43, 0.07), 0 8px 15px -5px rgba(8, 16, 43, 0.03)',
        'hover-lift': '0 14px 28px -6px rgba(8, 16, 43, 0.09), 0 4px 10px -2px rgba(8, 16, 43, 0.04)',
      },
      animation: {
        'carousel-left': 'carouselLeft 30s linear infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        carouselLeft: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.02)' },
        }
      }
    },
  },
  plugins: [],
}
