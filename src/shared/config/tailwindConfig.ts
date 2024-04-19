import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

export const tailwindConfig: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: '#FFF057',
        primary: '#161616',
        secondary: { DEFAULT: '#2D2D2D', light: '#494949' },
        third: { DEFAULT: '#9B9B9B', light: '#7C7C7C' },
        ruler: '#9B9B9B',
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        '.font-fix': {
          paddingTop: '4px',
        },
      });
    }),
  ],
};
