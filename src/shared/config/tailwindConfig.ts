import type { Config } from 'tailwindcss';

export const tailwindConfig: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: '#FFF057',
        primary: '#161616',
        secondary: { DEFAULT: '#2D2D2D', light: '#494949' },
        third: { DEFAULT: '#9B9B9B', light: '#7C7C7C' },
      },
    },
  },
  plugins: [],
};
