import { getTrack } from '@/entities/track';

import { Timeline } from '@/widgets/timeline';

import { HomePageProps } from './interfaces';

export const HomePage = async ({ searchParams }: HomePageProps) => {
  const { data: _track } = await getTrack(searchParams.id);

  return (
    <main className='h-[calc(100%-64px)] max-h-[calc(100%_-_64px)] min-h-[calc(100%-64px)]'>
      {searchParams.id && (
        <Timeline className='h-full max-h-full overflow-hidden' />
      )}
    </main>
  );
};
