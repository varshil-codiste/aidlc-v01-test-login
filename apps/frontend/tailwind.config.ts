import type { Config } from 'tailwindcss';

// Tokens derived from `aidlc-docs/inception/design/design-tokens.md`
// with Stage 8 Q1=A subtitle darken applied (#908d8d → #737272).

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#016097',
          accent: '#ef8022',
        },
        neutral: {
          0: '#ffffff',
          50: '#f9f9f9',
          300: '#d1d0d0',
          500: '#737272',  // darkened per NFR-A11Y-004 / Stage 8 Q1
          700: '#5a5959',
          900: '#2c2b2b',
        },
        danger: '#dc2626',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'], // Stage 8 Q5: Avenir → Inter fallback
      },
      borderRadius: {
        md: '6px',
        pill: '9999px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
export default config;
