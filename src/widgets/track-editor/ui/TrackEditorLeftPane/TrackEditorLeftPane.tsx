import { useCallback } from 'react';

import { cn } from '@/shared/lib';
import { IconButton, CrossIcon } from '@/shared/ui';

import { useAudioEditor } from '@/entities/audio-editor';

import { TrackEditorLeftPaneProps } from './interfaces';

export const TrackEditorLeftPane = ({
  className,
  ...props
}: TrackEditorLeftPaneProps) => {
  const audioEditor = useAudioEditor();

  const handleClose = useCallback(() => {
    audioEditor.editableTrack = null;
  }, [audioEditor]);

  return (
    <div className={cn('flex flex-col', className)} {...props}>
      <div className='flex h-16 min-h-16 items-center justify-end border-b border-r border-b-third border-r-secondary px-4'>
        <IconButton variant='primaryFilled' onClick={handleClose}>
          <CrossIcon className='size-4' />
        </IconButton>
      </div>
      <div className='h-full border-r border-r-secondary' />
    </div>
  );
};
