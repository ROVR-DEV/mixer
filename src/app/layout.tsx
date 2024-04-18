import './globals.css';

import type { Metadata } from 'next';
import { Advent_Pro } from 'next/font/google';

import { cn } from '@/shared/lib/cn';

import { AppHeader } from '@/widgets/layout/app-header';

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
      <body
        className={cn('flex flex-col min-h-screen h-screen', advent.className)}
      >
        <AppHeader />
        {children}
      </body>
    </html>
  );
}
