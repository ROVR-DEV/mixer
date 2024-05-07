import { getPlaylist } from '@/entities/track';

import { Timeline } from '@/widgets/timeline';

import { HomePageProps } from './interfaces';

export const HomePage = async ({ searchParams }: HomePageProps) => {
  const { data: playlist } = await getPlaylist(searchParams.id);

  // console.log(
  //   playlist?.tracks.reduce((acc, track) =>
  //     acc.duration > track.duration ? track : acc,
  //   ),
  // );

  if (playlist) {
    // playlist.tracks = [];
    // playlist.tracks = playlist.tracks.slice(0, 1);
    // playlist.tracks[0].start += 1000;
    // playlist.tracks[0].end += 1000;
    // const tr = playlist.tracks.find(
    //   (track) => track.uuid === 'cbd3f74f-88e9-47d9-900f-7fedfa321820',
    // )!;
    // tr.end = tr.end - tr.start;
    // tr.start = 0;
    // playlist.tracks = [tr];
    // console.log(playlist.tracks);
  }

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
