import containerQueries from '@tailwindcss/container-queries';
import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';
import resolveConfig from 'tailwindcss/resolveConfig';

export const tailwindConfig: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: { DEFAULT: '#FFF057', light: '#FFED24' },
        primary: { dark: '#101010', DEFAULT: '#161616' },
        error: { DEFAULT: '#D64848' },
        secondary: { DEFAULT: '#2D2D2D', light: '#494949' },
        third: { dark: '#7C7C7C', DEFAULT: '#9B9B9B', light: '#D9D9D9' },
        ruler: '#9B9B9B',
        grid: { DEFAULT: '#2D2D2D', light: '#555555' },
      },
      fontFamily: {
        sans: ['var(--font-kern)'],
      },
    },
  },
  safelist: ['content-auto', 'content-hidden'],
  plugins: [
    containerQueries,
    plugin(({ addUtilities }) => {
      addUtilities({
        'content-auto': {
          contentVisibility: 'auto',
        },
        'content-hidden': {
          contentVisibility: 'hidden',
        },
        '.font-fix': {
          paddingTop: '4px',
        },
      });
    }),
  ],
};

export const resolvedTailwindConfig = resolveConfig(tailwindConfig);
