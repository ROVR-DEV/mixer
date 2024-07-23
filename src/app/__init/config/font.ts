import localFont from 'next/font/local';

export const kernFont = localFont({
  src: [
    {
      path: '../ui/fonts/kern-standard-regular.otf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../ui/fonts/kern-standard-bold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../ui/fonts/kern-standard-bold-italic.otf',
      weight: '700',
      style: 'italic',
    },
  ],
  adjustFontFallback: false,
  fallback: [
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Oxygen',
    'Ubuntu',
    'Cantarell',
    'Open Sans',
    'Helvetica Neue',
    'sans-serif',
  ],
  display: 'swap',
  variable: '--font-kern',
});
