import './globals.css';

import { cn } from '@/shared/lib';

import { AppHeader } from '@/widgets/app-header';

import { appMetadata, kernFont, PolyfillProvider } from './__init';

export const metadata = appMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className={cn('font-sans', kernFont.variable)}>
      <body className='flex h-screen min-h-screen flex-col font-sans'>
        <PolyfillProvider>
          <AppHeader />
          {children}
        </PolyfillProvider>
      </body>
    </html>
  );
}
