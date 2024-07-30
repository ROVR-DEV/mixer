'use client';

import { observer } from 'mobx-react-lite';
import { forwardRef, useCallback } from 'react';

import { cn } from '@/shared/lib';

import { useAudioEditor, useTimeline } from '@/entities/audio-editor';
import {
  AddNewChannelButtonMemoized,
  ChannelListItemMemoized,
  ChannelListMemoized,
} from '@/entities/channel';

import { AudioEditorChannelsListView } from '../AudioEditorChannelsListView';

import { AudioEditorChannelsListProps } from './interfaces';

const _AudioEditorChannelsList = forwardRef<
  HTMLDivElement,
  AudioEditorChannelsListProps
>(function AudioEditorChannelsList({ className, ...props }, ref) {
  const audioEditor = useAudioEditor();
  const timeline = useTimeline();

  const handleAddChannel = useCallback(() => {
    audioEditor.player.addChannel();
    audioEditor.saveState();
  }, [audioEditor]);

  return (
    <ChannelListMemoized
      className={cn('border-r border-r-secondary', className)}
      ref={ref}
      {...props}
    >
      <AudioEditorChannelsListView itemClassName='border-b border-b-secondary' />

      <ChannelListItemMemoized
        className='justify-center'
        style={{ height: timeline.trackHeight }}
      >
        <AddNewChannelButtonMemoized onClick={handleAddChannel} />
      </ChannelListItemMemoized>
    </ChannelListMemoized>
  );
});

export const AudioEditorChannelsList = observer(_AudioEditorChannelsList);
