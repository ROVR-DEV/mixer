import { cn } from '@/shared/lib';

import { TrackTitle } from '../TrackTitle';

import { TrackInfoProps } from './interfaces';

export const TrackInfo = ({ track, className, ...props }: TrackInfoProps) => {
  return (
    <div
      className={cn(
        'border border-secondary-light px-[10px] py-[6px] h-12 text-[14px] leading-4 rounded-md overflow-hidden',
        className,
        { 'border-accent': !!track },
      )}
      {...props}
    >
      <p className='inline-flex h-full flex-col justify-between'>
        <span
          className={cn(
            'flex text-nowrap gap-1 font-bold text-secondary-light',
            {
              'text-third': !!track,
            },
          )}
        >
          <span
            className={cn('font-bold text-third-dark', {
              'text-accent': !!track,
            })}
          >
            {'Track Info:'}
          </span>
          <TrackTitle className='text-[14px]' track={track} />
        </span>
        <span
          className={cn(
            'divide-x divide-secondary-light text-secondary-light',
            { 'text-third divide-third': !!track },
          )}
        >
          <span className='pr-1'>{`BMP: ${track?.bpm ?? '000'}`}</span>
          <span className='px-1'>{`Key: ${track?.key?.value ?? '00001'}`}</span>
        </span>
      </p>
    </div>
  );
};
