/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Primary: Rose Pink #F57799 ────────────────────────────────
        primary: {
          50:  '#FDE7EE',   // lightest tint
          100: '#FCD0DC',
          200: '#F9C7D6',   // specified secondary
          300: '#F9A5BB',   // specified secondary
          400: '#F78AAA',
          500: '#F57799',   // ← base primary
          600: '#F24E80',
          700: '#DC2D63',
          800: '#B51F4E',
          900: '#8B1238',
          950: '#5C0B24',
        },
        // ── Surface: Clean neutral grays ─────────────────────────────
        surface: {
          50:  '#FFFFFF',
          100: '#FAFAFA',
          200: '#F5F5F5',
          300: '#EAEAEA',   // ← border
          400: '#CCCCCC',
          500: '#888888',   // ← meta text
          600: '#555555',   // ← secondary text
          700: '#333333',
          800: '#1A1A1A',   // ← primary text
          900: '#0D0D0D',
          950: '#050505',
        },
        // ── Accent: same as primary ────────────────────────────────────
        accent: {
          50:  '#FDE7EE',
          100: '#FCD0DC',
          200: '#F9C7D6',
          300: '#F9A5BB',
          400: '#F78AAA',
          500: '#F57799',
          600: '#F24E80',
          700: '#DC2D63',
          800: '#B51F4E',
          900: '#8B1238',
        },
        // ── Dark alias (neutral) ───────────────────────────────────────
        dark: {
          50:  '#FAFAFA',
          100: '#F5F5F5',
          200: '#EAEAEA',
          300: '#CCCCCC',
          400: '#888888',
          500: '#555555',
          600: '#333333',
          700: '#1A1A1A',
          800: '#0D0D0D',
          900: '#050505',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out both',
        'slide-up':   'slideUp 0.4s ease-out both',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float':      'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideUp:   { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        slideDown: { '0%': { transform: 'translateY(-20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        float:     { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
      },
      boxShadow: {
        card:         '0 6px 20px rgba(0,0,0,0.05)',
        'card-hover': '0 10px 30px rgba(0,0,0,0.08)',
        pink:         '0 4px 24px rgba(245,119,153,0.30)',
        'inner-sm':   'inset 0 1px 3px rgba(0,0,0,0.06)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero':       'linear-gradient(135deg, #F57799 0%, #F24E80 45%, #DC2D63 100%)',
        'hero-pink':  'linear-gradient(135deg, #FDE7EE 0%, #F9C7D6 50%, #F9A5BB 100%)',
        'card-shine': 'linear-gradient(135deg, rgba(245,119,153,0.04) 0%, transparent 60%)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.75rem',
      },
      letterSpacing: {
        heading: '0.02em',
      },
    },
  },
  plugins: [],
};
