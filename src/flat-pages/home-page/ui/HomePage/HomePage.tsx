import { getTrack } from '@/entities/track';

import { Timeline } from '@/widgets/timeline';

import { HomePageProps } from './interfaces';

export const HomePage = async ({ searchParams }: HomePageProps) => {
  const { data: playlist } = await getTrack(searchParams.id);

  // if (playlist) {
  //   playlist.tracks = playlist.tracks.slice(0, 1);
  // }

  return (
    <main className='h-[calc(100%-64px)] max-h-[calc(100%_-_64px)] min-h-[calc(100%-64px)]'>
      {playlist && searchParams.id && (
        <Timeline
          className='h-full max-h-full overflow-hidden'
          playlist={playlist}
        />
      )}
    </main>
  );
};
