import { cn } from '@/shared/lib/cn';
import { Badge, IconButton } from '@/shared/ui';
import {
  Channel01Icon,
  MuteChannelIcon,
  SingleChannelIcon,
  UndefinedChannelIcon,
} from '@/shared/ui/assets';

import { TrackChannelControlProps } from './interfaces';

export const TrackChannelControl = ({
  className,
  ...props
}: TrackChannelControlProps) => {
  return (
    <div
      className={cn('flex items-center gap-[10px] w-max', className)}
      {...props}
    >
      <Badge>
        <Channel01Icon />
      </Badge>
      <IconButton variant='secondary'>
        <MuteChannelIcon />
      </IconButton>
      <IconButton variant='secondary'>
        <SingleChannelIcon />
      </IconButton>
      <IconButton variant='secondary'>
        <UndefinedChannelIcon />
      </IconButton>
    </div>
  );
};
