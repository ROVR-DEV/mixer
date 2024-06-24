'use client';

import { observer } from 'mobx-react-lite';
import { useState } from 'react';

import { cn } from '@/shared/lib';

import {
  AudioEditor,
  AudioEditorContext,
  PlayerContext,
} from '@/entities/audio-editor';
import { TracksManagerContext } from '@/entities/track';

import { useAudioEditorGlobalControls, usePlayer } from '../../lib';
import { AudioEditorHeaderMemoized } from '../AudioEditorHeader';
import { TimelineView } from '../TimelineView';

import { AudioEditorViewProps } from './interfaces';

export const AudioEditorView = observer(function AudioEditorView({
  playlist,
  trackEditor: TrackEditor,
  className,
  ...props
}: AudioEditorViewProps) {
  const [audioEditor] = useState(() => new AudioEditor());

  const { player, tracksManager } = usePlayer(playlist);

  useAudioEditorGlobalControls(player);

  return (
    <AudioEditorContext.Provider value={audioEditor}>
      <PlayerContext.Provider value={player}>
        <div className={cn('flex flex-col relative', className)} {...props}>
          <AudioEditorHeaderMemoized />
          <TracksManagerContext.Provider value={tracksManager}>
            <TimelineView playlist={playlist} />
            {!player.editableTrack ? null : (
              <TrackEditor className='absolute bottom-[100px] z-10 h-[43%] max-h-[466px] min-h-[161px] w-full' />
            )}
          </TracksManagerContext.Provider>
        </div>
      </PlayerContext.Provider>
    </AudioEditorContext.Provider>
  );
});
