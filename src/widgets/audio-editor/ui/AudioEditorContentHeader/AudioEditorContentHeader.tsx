import { cn } from '@/shared/lib';

import { SIDEBAR_WIDTH } from '@/entities/audio-editor';

import { ChannelsListHeaderMemoized } from '../ChannelsListHeader';
import { TimelineHeader } from '../TimelineHeader';

import { AudioEditorContentHeaderProps } from './interfaces';

export const AudioEditorContentHeader = ({
  className,
  playlist,
  ...props
}: AudioEditorContentHeaderProps) => {
  return (
    <div className={cn('flex', className)} {...props}>
      <ChannelsListHeaderMemoized
        playlist={playlist}
        style={{ minWidth: SIDEBAR_WIDTH }}
      />
      <TimelineHeader className='mb-[9px]' endBorder />
    </div>
  );
};
