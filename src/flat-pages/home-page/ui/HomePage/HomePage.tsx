import { getTrack } from '@/entities/track';

import { Timeline } from '@/widgets/timeline';

import { HomePageProps } from './interfaces';

export const HomePage = async ({ searchParams }: HomePageProps) => {
  const { data: _track } = await getTrack(searchParams.id);

  return (
    <main className='flex flex-1'>
      {searchParams.id && <Timeline className='flex flex-1 flex-col' />}
    </main>
  );
};
