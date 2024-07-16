import containerQueries from '@tailwindcss/container-queries';
import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';
import resolveConfig from 'tailwindcss/resolveConfig';

export const tailwindConfig: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: { DEFAULT: '#FFF057', light: '#FFED24', inverse: '#3E5DAB' },
        primary: { dark: '#101010', DEFAULT: '#161616', light: '#222222' },
        secondary: { DEFAULT: '#2D2D2D', light: '#494949' },
        third: {
          darker: '#646464',
          dark: '#7C7C7C',
          DEFAULT: '#9B9B9B',
          light: '#D9D9D9',
        },
        error: { DEFAULT: '#D64848' },
        ruler: '#9B9B9B',
        grid: { DEFAULT: '#2D2D2D', light: '#555555' },
      },
      cursor: {
        'trim-left':
          'url(/icons/trim-icon-left.svg) 16 16,\
           url(/icons/trim-icon-left.png) 16 16,\
           col-resize',
        'trim-right':
          'url(/icons/trim-icon-right.svg) 16 16,\
          url(/icons/trim-icon-right.png) 16 16,\
          col-resize',
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
