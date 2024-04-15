import type { Metadata } from 'next';
import { Advent_Pro } from 'next/font/google';
import './globals.css';

const advent = Advent_Pro({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mixer',
  description: '',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={advent.className}>{children}</body>
    </html>
  );
}
