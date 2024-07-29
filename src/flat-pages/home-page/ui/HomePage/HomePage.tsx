import { getPlaylist } from '@/entities/playlist';

import { AudioEditorView } from '@/widgets/audio-editor';
import { TrackEditor } from '@/widgets/track-editor';

import { HomePageProps } from './interfaces';

export const HomePage = async ({ searchParams }: HomePageProps) => {
  const { data: playlist } = await getPlaylist(searchParams.id);

  if (process.env.NEXT_PUBLIC_DEBUG_TRACKS_MAX_COUNT && !!playlist) {
    playlist.tracks = playlist.tracks.slice(
      0,
      process.env.NEXT_PUBLIC_DEBUG_TRACKS_MAX_COUNT,
    );
  }

  return (
    <main className='h-[calc(100%-64px)] max-h-[calc(100%_-_64px)] min-h-[calc(100%-64px)]'>
      {!!searchParams.id && playlist ? (
        <AudioEditorView
          className='h-full max-h-full overflow-hidden'
          playlist={playlist}
          trackEditor={TrackEditor}
        />
      ) : (
        <div className='flex size-full items-center justify-center text-2xl font-bold text-third'>
          <span>{'Playlist not found'}</span>
        </div>
      )}
    </main>
  );
};
