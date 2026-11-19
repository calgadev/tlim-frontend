import animate from 'tailwindcss-animate';

/**
 * TLIM design tokens. Components use these names instead of hard-coded hex values,
 * so the palette lives in one place.
 *
 * Surfaces and borders are translucent white over the dark app background
 * (e.g. `bg-white/[0.03]`, `border-white/10`), so they are not tokens of their own.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        app: '#08101C', // page background
        sidebar: '#111827',
        topbar: '#0B1220',
        overlay: '#0E1726', // modals, dropdowns
        gold: {
          DEFAULT: '#D9B35B',
          light: '#F4D27A',
          ink: '#221607', // text on gold
        },
        fg: {
          DEFAULT: '#FFFFFF',
          secondary: '#94A3B8',
          muted: '#64748B',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#60A5FA',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D9B35B, #F4D27A)',
      },
      boxShadow: {
        card: '0 12px 40px rgba(0,0,0,0.35)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [animate],
};
