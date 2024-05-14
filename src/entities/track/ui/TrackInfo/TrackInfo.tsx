import { cn } from '@/shared/lib';

import { TrackInfoProps } from './interfaces';

export const TrackInfo = ({ track, className, ...props }: TrackInfoProps) => {
  return (
    <div
      className={cn(
        'border border-secondary-light px-2 py-1 rounded-md overflow-hidden',
        className,
        { 'border-accent': !!track },
      )}
      {...props}
    >
      <p>
        <span
          className={cn(
            'flex text-nowrap gap-1 font-bold text-secondary-light',
            {
              'text-third': !!track,
            },
          )}
        >
          <span
            className={cn('font-bold text-third-light', {
              'text-accent': !!track,
            })}
          >
            {'Track Info:'}
          </span>
          <span className='inline-block overflow-hidden text-ellipsis'>
            {track ? `${track.title} | ${track.artist}` : 'No track selected '}
          </span>
          <span>{track ? `(${track.duration})` : '(00:00:00)'}</span>
        </span>
        <span
          className={cn(
            'divide-x divide-secondary-light text-secondary-light',
            { 'text-third divide-third': !!track },
          )}
        >
          <span className='pr-1'>{`BMP: ${track?.bpm ?? '000'}`}</span>
          <span className='px-1'>{`Key: ${track?.key?.value ?? '00001'}`}</span>
          <span className='pl-1'>{`Volume: ${track ? '100%' : '000%'}`}</span>
        </span>
      </p>
    </div>
  );
};
