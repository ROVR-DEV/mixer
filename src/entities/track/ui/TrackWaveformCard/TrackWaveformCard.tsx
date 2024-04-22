import { cn } from '@/shared/lib/cn';

import { TrackWaveformCardProps } from './interfaces';

export const TrackWaveformCard = ({
  track,
  className,
  ...props
}: TrackWaveformCardProps) => {
  return (
    <div
      className={cn(
        'flex flex-col h-[84px] px-2 py-1 border border-third-light rounded-md',
        className,
      )}
      {...props}
      // eslint-disable-next-line no-console
      onClick={() => console.log(track)}
    >
      {track.title}
      <span className='mt-auto overflow-hidden text-ellipsis text-nowrap text-[12px]'>
        <span>{'Track info: '}</span>
        <span>{'No track selected (00:00:00)'}</span>
      </span>
    </div>
  );
};
