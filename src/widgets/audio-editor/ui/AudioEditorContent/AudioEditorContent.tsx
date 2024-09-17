'use client';

import { observer } from 'mobx-react-lite';
import { useEffect, useRef } from 'react';

import { cn } from '@/shared/lib';

import { TimelineContext, useAudioEditor } from '@/entities/audio-editor';

import { useTimelineInitialize } from '@/features/timeline';

import { AudioEditorContentBody } from '../AudioEditorContentBody';
import { AudioEditorContentHeader } from '../AudioEditorContentHeader';

import { TimelineViewProps } from './interfaces';

export const AudioEditorContent = observer(function AudioEditorBody({
  playlist,
  className,
  ...props
}: TimelineViewProps) {
  const audioEditor = useAudioEditor();

  const timelineRef = useRef<HTMLDivElement | null>(null);

  const timeline = useTimelineInitialize(`${playlist.id}-timeline`, {
    timelineRef,
    endTime: audioEditor.player.duration || playlist.duration_in_seconds,
  });

  useEffect(() => {
    audioEditor.timeline = timeline;
  }, [audioEditor, timeline]);

  useEffect(() => {
    if (audioEditor.player.isPlaying) {
      timeline.interactedBefore = false;
    }
  }, [audioEditor.player.isPlaying, timeline]);

  return (
    <TimelineContext.Provider value={timeline}>
      <div
        className={cn(
          'relative flex h-full grow flex-col overflow-hidden divide-y divide-secondary',
          className,
        )}
        {...props}
      >
        <AudioEditorContentHeader
          playlist={audioEditor.player.playlist ?? playlist}
        />
        <AudioEditorContentBody timelineRef={timelineRef} />
      </div>
    </TimelineContext.Provider>
  );
});
