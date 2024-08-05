'use client';

import { observer } from 'mobx-react-lite';
import { useEffect, useRef } from 'react';

import { cn } from '@/shared/lib';

import { TimelineContext, useAudioEditor } from '@/entities/audio-editor';

import { useTimelineZoomScroll } from '../../lib';
import { AudioEditorContentBody } from '../AudioEditorContentBody';
import { AudioEditorContentHeader } from '../AudioEditorContentHeader';

import { TimelineViewProps } from './interfaces';

export const AudioEditorContent = observer(function AudioEditorBody({
  playlist,
  className,
  ...props
}: TimelineViewProps) {
  const audioEditor = useAudioEditor();

  const rulerWrapperRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  const timeline = useTimelineZoomScroll({
    timelineRef,
    timelineRulerRef: rulerWrapperRef,
    duration: playlist.duration_in_seconds + 2,
  });

  useEffect(() => {
    audioEditor.timeline = timeline;
  }, [audioEditor, timeline]);

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
          playlist={playlist}
          rulerWrapperRef={rulerWrapperRef}
        />
        <AudioEditorContentBody
          rulerWrapperRef={rulerWrapperRef}
          timelineRef={timelineRef}
        />
      </div>
    </TimelineContext.Provider>
  );
});
