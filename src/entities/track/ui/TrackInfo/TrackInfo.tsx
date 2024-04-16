import { cn } from '@/shared/lib/cn';

import { TrackInfoProps } from './interfaces';

export const TrackInfo = ({ className, ...props }: TrackInfoProps) => {
  return (
    <div
      className={cn(
        'border border-secondary-light px-2 py-1 rounded-md',
        className,
      )}
      {...props}
    >
      <p className='w-[334px]'>
        <span className='font-bold text-third-light'>{'Track Info: '}</span>
        <span className='font-bold text-secondary-light'>
          {'No track selected (00:00:00)'}
        </span>
        <br />
        <span className='text-secondary-light'>
          {'BPM 000 | Key: 00001 | Volume: 000%'}
        </span>
      </p>
    </div>
  );
};
