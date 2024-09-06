import { ReactNode } from 'react';

export interface PageProps {
  params: { locale: string } & Record<string, string | string[]>;
  searchParams: Record<string, string>;
}

export interface LayoutProps extends Pick<PageProps, 'params'> {
  children: ReactNode;
}

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequireBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

export interface SliderAriaAttributes {
  role: string;
  'aria-label': string;
  'aria-valuemax': number;
  'aria-valuenow': number;
  'aria-valuetext': string;
}

export type AddParameters<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TFunction extends (...args: any) => any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TParameters extends [...args: any],
> = (
  ...args: [...Parameters<TFunction>, ...TParameters]
) => ReturnType<TFunction>;
