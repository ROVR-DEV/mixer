'use client';

import { observer } from 'mobx-react-lite';
import { useState } from 'react';

import { cn } from '@/shared/lib';

import {
  ObservableAudioEditor,
  AudioEditorContext,
  PlayerContext,
  ObservablePlayer,
} from '@/entities/audio-editor';
import { TracksManagerContext } from '@/entities/track';

import { useAudioEditorGlobalControls, usePlayerSetup } from '../../lib';
import { AudioEditorBody } from '../AudioEditorBody';
import { AudioEditorHeaderMemoized } from '../AudioEditorHeader';

import { AudioEditorViewProps } from './interfaces';

export const AudioEditorView = observer(function AudioEditorView({
  playlist,
  trackEditor: TrackEditor,
  className,
  ...props
}: AudioEditorViewProps) {
  const [player] = useState(() => new ObservablePlayer(playlist));
  const [audioEditor] = useState(() => new ObservableAudioEditor(player));

  const { tracksManager } = usePlayerSetup(playlist, audioEditor.player);

  useAudioEditorGlobalControls(audioEditor);

  return (
    <AudioEditorContext.Provider value={audioEditor}>
      <PlayerContext.Provider value={player}>
        <div className={cn('flex flex-col relative', className)} {...props}>
          <AudioEditorHeaderMemoized />
          <TracksManagerContext.Provider value={tracksManager}>
            <AudioEditorBody playlist={playlist} />
            {!audioEditor.editableTrack ? null : (
              <TrackEditor className='absolute bottom-[100px] z-50 h-[43%] max-h-[466px] min-h-[161px] w-full' />
            )}
          </TracksManagerContext.Provider>
        </div>
      </PlayerContext.Provider>
    </AudioEditorContext.Provider>
  );
});
