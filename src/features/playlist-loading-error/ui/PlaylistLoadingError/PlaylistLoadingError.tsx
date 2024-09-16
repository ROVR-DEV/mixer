import { observer } from 'mobx-react-lite';
import { useCallback, useMemo } from 'react';

import { cn } from '@/shared/lib';
import { RemoveButton } from '@/shared/ui';

import { usePlayer } from '@/entities/audio-editor';
import { removeTrack } from '@/entities/playlist';
import { AudioEditorTrack, TrackData, TrackTitle } from '@/entities/track';

import { PlaylistLoadingErrorProps } from './interfaces';

export const PlaylistLoadingError = observer(function PlaylistLoadingError({
  className,
  ...props
}: PlaylistLoadingErrorProps) {
  const player = usePlayer();

  const errorTracks = useMemo(() => {
    if (player.loadingStatus !== 'fulfilled') {
      return [];
    }

    const tracksData = [
      ...player.trackLoader.tracksData.values(),
    ] as TrackData[];

    return tracksData
      .filter((trackData) => trackData.status === 'error')
      .map((trackData) => trackData.uuid)
      .map((uuid) => player.tracksByAudioUuid.get(uuid))
      .filter((track) => track !== undefined);
  }, [
    player.loadingStatus,
    player.trackLoader.tracksData,
    player.tracksByAudioUuid,
  ]);

  const onRemove = useCallback(
    (track: AudioEditorTrack) => {
      if (player.playlist?.id === undefined) {
        return;
      }

      removeTrack(player.playlist.id, track.meta.uuid);
    },
    [player.playlist?.id],
  );

  return player.loadingStatus === 'fulfilled' && errorTracks.length > 0 ? (
    <div className={cn('flex flex-col gap-2', className)} {...props}>
      <p className='inline-flex flex-col'>
        <span className='font-bold text-error'>
          {'Some tracks cannot be downloaded'}
        </span>
        <span>
          {'You can try again and refresh the page or delete these tracks'}
        </span>
      </p>
      <div className='flex flex-col'>
        {errorTracks.map((track) => (
          <div
            key={`error-loading-track-${track.meta.uuid}`}
            className='flex items-center gap-4'
          >
            <TrackTitle className='w-full' track={track.meta} />
            <RemoveButton
              aria-label='Remove track'
              onClick={() => onRemove(track)}
            />
          </div>
        ))}
      </div>
    </div>
  ) : null;
});
