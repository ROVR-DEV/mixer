import { getPlaylist } from '@/entities/playlist';

import { AudioEditor } from '@/widgets/audio-editor';
import { TrackEditor } from '@/widgets/track-editor';

import { HomePageProps } from './interfaces';

export const HomePage = async ({ searchParams }: HomePageProps) => {
  const { data: playlist } = await getPlaylist(searchParams.id);

  if (playlist) {
    playlist.tracks = [playlist?.tracks[0]];
  }

  return (
    <main className='h-[calc(100%-64px)] max-h-[calc(100%_-_64px)] min-h-[calc(100%-64px)]'>
      {playlist && searchParams.id && (
        <AudioEditor
          className='h-full max-h-full overflow-hidden'
          playlist={playlist}
          trackEditor={TrackEditor}
        />
      )}
    </main>
  );
};
