import { ReactNode } from 'react';

export interface PageProps {
  params: { locale: string } & Record<string, string | string[]>;
  searchParams: Record<string, string>;
}

export interface LayoutProps extends Pick<PageProps, 'params'> {
  children: ReactNode;
}
