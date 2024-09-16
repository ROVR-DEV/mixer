'use client';

import { observer } from 'mobx-react-lite';

import { cn } from '@/shared/lib';

import { useAudioEditor } from '@/entities/audio-editor';

import { TrackEditor } from '@/features/track-editor';

import { AudioEditorContent } from '../AudioEditorContent';
import { AudioEditorHeaderMemoized } from '../AudioEditorHeader';
import { AudioEditorLayoutMemoized } from '../AudioEditorLayout';

import { AudioEditorViewProps } from './interfaces';

export const AudioEditorView = observer(function AudioEditorView({
  playlist,
  className,
  ...props
}: AudioEditorViewProps) {
  const audioEditor = useAudioEditor();

  return (
    <AudioEditorLayoutMemoized className={className} {...props}>
      <AudioEditorHeaderMemoized />
      <AudioEditorContent playlist={playlist} />
      {!audioEditor.editableTrack ? null : (
        <TrackEditor
          className={cn(
            'absolute bottom-[100px] z-40 h-[43%] max-h-[466px] min-h-[161px] w-full',
          )}
        />
      )}
    </AudioEditorLayoutMemoized>
  );
});
