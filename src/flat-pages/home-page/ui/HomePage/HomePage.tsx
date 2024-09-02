import MurmurHash3 from 'imurmurhash';

import { getPlaylist } from '@/entities/playlist';

import { AudioEditorView } from '@/widgets/audio-editor';
import { PlaylistLoadingProgressDialog } from '@/widgets/playlist-loading-progress-dialog';
import { TrackEditor } from '@/widgets/track-editor';

import { HomePageProps } from './interfaces';

export const HomePage = async ({ searchParams }: HomePageProps) => {
  const { data: playlist, error } = await getPlaylist(searchParams.id);

  if (error) {
    // eslint-disable-next-line no-console
    console.error(`Unable to get playlist with id: ${searchParams.id}`);
    // eslint-disable-next-line no-console
    console.error(error);
  }

  if (process.env.NEXT_PUBLIC_DEBUG_TRACKS_MAX_COUNT && !!playlist) {
    playlist.tracks = playlist.tracks.slice(
      0,
      process.env.NEXT_PUBLIC_DEBUG_TRACKS_MAX_COUNT,
    );
  }

  const playlistKey = !playlist
    ? null
    : MurmurHash3(JSON.stringify(playlist)).result().toString();

  return (
    <main className='h-[calc(100%-64px)] max-h-[calc(100%_-_64px)] min-h-[calc(100%-64px)]'>
      {!!searchParams.id && playlist && playlistKey ? (
        <AudioEditorView
          className='h-full max-h-full overflow-hidden'
          playlist={playlist}
          playlistKey={playlistKey}
          trackEditor={TrackEditor}
          playlistLoadingProgressDialog={PlaylistLoadingProgressDialog}
        />
      ) : (
        <div className='flex size-full items-center justify-center text-2xl font-bold text-third'>
          <span>{'Playlist not found'}</span>
        </div>
      )}
    </main>
  );
};
