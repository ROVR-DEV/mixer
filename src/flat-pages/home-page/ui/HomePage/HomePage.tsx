import { notFound } from 'next/navigation';

import { getPlaylist } from '@/entities/playlist';

import { AudioEditorView } from '@/widgets/audio-editor';
import { PlaylistLoadingProgressDialog } from '@/widgets/playlist-loading-progress-dialog';

import { AudioEditorProvider } from '@/app';

import { HomePageProps } from './interfaces';

export const HomePage = async ({ searchParams }: HomePageProps) => {
  if (!searchParams.id) {
    notFound();
  }

  const { data: playlist, error } = await getPlaylist(searchParams.id);

  if (!playlist || error) {
    // eslint-disable-next-line no-console
    console.error(
      `Unable to get playlist with id: ${searchParams.id}\n${error}`,
    );
    notFound();
  }

  // Reduce tracks to DEBUG_TRACKS_MAX_COUNT amount if it's defined
  if (process.env.NEXT_PUBLIC_DEBUG_TRACKS_MAX_COUNT && !!playlist) {
    playlist.tracks = playlist.tracks.slice(
      0,
      process.env.NEXT_PUBLIC_DEBUG_TRACKS_MAX_COUNT,
    );
  }

  return (
    <main className='h-[calc(100%-64px)] max-h-[calc(100%-64px)] min-h-[calc(100%-64px)]'>
      <AudioEditorProvider playlist={playlist}>
        <AudioEditorView
          className='h-full max-h-full overflow-hidden'
          playlist={playlist}
        />
        <PlaylistLoadingProgressDialog />
      </AudioEditorProvider>
    </main>
  );
};
