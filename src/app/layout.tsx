import './globals.css';

import { cn } from '@/shared/lib';

import { AppHeader } from '@/widgets/layout/app-header';

import { appMetadata, kernFont } from './__init';

export const metadata = appMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body
        className={cn(
          'flex flex-col min-h-screen h-screen',
          kernFont.className,
        )}
      >
        <AppHeader />
        {children}
      </body>
    </html>
  );
}
