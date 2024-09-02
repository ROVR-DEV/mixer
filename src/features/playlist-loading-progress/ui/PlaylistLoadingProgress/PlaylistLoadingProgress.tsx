import { useMemo } from 'react';

import { ProgressBar } from '@/shared/ui';

import { PlaylistLoadingProgressProps } from './interfaces';

export const PlaylistLoadingProgress = ({
  tracksCount,
  downloadedTracksCount,
  ...props
}: PlaylistLoadingProgressProps) => {
  const progress = useMemo(
    () => (downloadedTracksCount / tracksCount) * 100,
    [downloadedTracksCount, tracksCount],
  );

  return (
    <div className='flex flex-col gap-2' {...props}>
      <ProgressBar className='border border-third' value={progress} />
      <span className='self-end'>{`${downloadedTracksCount}/${tracksCount}`}</span>
    </div>
  );
};
