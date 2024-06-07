import { cn } from '@/shared/lib';

import { TrackTitleProps } from './interfaces';

export const TrackTitle = ({ track, className, ...props }: TrackTitleProps) => {
  const trackTitleArtist = track
    ? `${track.title} | ${track.artist} `
    : 'No track selected ';

  const trackDuration = track ? `(${track.duration})` : '(00:00:00)';

  return (
    <span
      className={cn(
        'overflow-hidden text-ellipsis text-nowrap text-[12px]',
        className,
      )}
      {...props}
    >
      <span className='font-bold'>{trackTitleArtist}</span>
      <span>{trackDuration}</span>
    </span>
  );
};
