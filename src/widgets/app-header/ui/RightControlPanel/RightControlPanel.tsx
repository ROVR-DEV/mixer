'use client';

import { observer } from 'mobx-react-lite';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';

import { cn } from '@/shared/lib';
import { Button, IconButton } from '@/shared/ui';
import { PersonIcon } from '@/shared/ui/assets';

import { initializeAudioEditor } from '@/entities/audio-editor';
import { updateTracksInfo } from '@/entities/playlist';

import { RightControlPanelProps } from './interfaces';

export const RightControlPanel = observer(function RightControlPanel({
  className,
  ...props
}: RightControlPanelProps) {
  const audioEditor = useMemo(() => initializeAudioEditor(), []);
  const [isRequestSending, setIsRequestSending] = useState(false);

  const onPublish = useCallback(() => {
    (async () => {
      if (audioEditor.player.playlist?.id === undefined) {
        return;
      }
      setIsRequestSending(true);
      await updateTracksInfo(
        audioEditor.player.playlist.id,
        audioEditor.player.tracks,
      );
      setIsRequestSending(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={cn(
        'flex items-center justify-between justify-self-end',
        className,
      )}
      {...props}
    >
      <Button
        aria-label='Publish'
        title='Publish'
        className='h-7 text-[13px] uppercase italic'
        disabled={isRequestSending}
        onClick={onPublish}
      >
        <span className='font-fix'>{'Publish'}</span>
      </Button>
      <div className='flex items-center gap-5'>
        <Link className='text-accent' href='#'>
          <span className='font-fix'>{'Hello '}</span>
          <span className='font-bold'>{'LeFto'}</span>
        </Link>
        <IconButton
          className='size-7'
          variant='primaryFilled'
          aria-label='Profile'
          title='Profile'
        >
          <PersonIcon height={14} />
        </IconButton>
      </div>
    </div>
  );
});
