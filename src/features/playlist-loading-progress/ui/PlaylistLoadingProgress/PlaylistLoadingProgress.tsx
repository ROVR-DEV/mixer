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
    <div className='flex w-full flex-col gap-2' {...props}>
      <ProgressBar
        className='!min-w-full border border-accent'
        value={progress}
      />
      <span className='self-end text-[13px] text-accent'>{`${downloadedTracksCount}/${tracksCount}`}</span>
    </div>
  );
};
