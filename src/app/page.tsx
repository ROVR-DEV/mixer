import { PageProps } from '@/shared/model';

// eslint-disable-next-line import/no-internal-modules
import { HomePage } from '@/flat-pages/home-page';

export default function Home({ searchParams }: PageProps) {
  return <HomePage searchParams={searchParams} />;
}

export const dynamic = 'force-dynamic';
