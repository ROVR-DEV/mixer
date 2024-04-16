import { cn } from '@/shared/lib/cn';
import { Badge, IconButton } from '@/shared/ui';
import { PlayIcon, StopIcon } from '@/shared/ui/assets';

import { TrackInfo } from '@/entities/track';

import { TrackInfoPanelProps } from './interfaces';

export const TrackInfoPanel = ({
  className,
  ...props
}: TrackInfoPanelProps) => {
  return (
    <div
      className={cn(
        'grid grid-rows-1 grid-cols-[1fr_auto_1fr] gap-4 justify-center',
        className,
      )}
      {...props}
    >
      <div className='col-start-2 flex flex-1 items-center justify-center gap-4'>
        <IconButton variant='secondaryFilled'>
          <StopIcon />
        </IconButton>
        <IconButton className='pl-[2px]' variant='primaryFilled'>
          <PlayIcon />
        </IconButton>
        <Badge variant='filled'>{'005:01:40'}</Badge>
      </div>
      <div className='flex justify-end'>
        <TrackInfo className='w-max' />
      </div>
    </div>
  );
};
