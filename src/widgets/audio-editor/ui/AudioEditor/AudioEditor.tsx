'use client';

import { observer } from 'mobx-react-lite';

import { cn } from '@/shared/lib';

import { AudioEditorManagerContext } from '@/entities/audio-editor';
import { TracksManagerContext } from '@/entities/track';

import { useAudioEditor } from '../../lib';
import { AudioEditorHeaderMemoized } from '../AudioEditorHeader';
import { TimelineView } from '../TimelineView';

import { AudioEditorProps } from './interfaces';

export const AudioEditor = observer(function AudioEditor({
  playlist,
  trackEditor: TrackEditor,
  className,
  ...props
}: AudioEditorProps) {
  const { audioEditorManager, tracksManager } = useAudioEditor(playlist);

  return (
    <AudioEditorManagerContext.Provider value={audioEditorManager}>
      <div className={cn('flex flex-col relative', className)} {...props}>
        <AudioEditorHeaderMemoized />
        <TracksManagerContext.Provider value={tracksManager}>
          <TimelineView playlist={playlist} />
          {!audioEditorManager.editableTrack ? null : (
            <TrackEditor className='absolute bottom-[100px] z-10 h-[43%] max-h-[466px] min-h-[161px] w-full' />
          )}
        </TracksManagerContext.Provider>
      </div>
    </AudioEditorManagerContext.Provider>
  );
});
