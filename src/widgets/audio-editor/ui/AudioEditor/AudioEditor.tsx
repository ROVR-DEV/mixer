'use client';

import { observer } from 'mobx-react-lite';

import { cn } from '@/shared/lib';

import { TracksManagerContext } from '@/entities/track';

import { TrackEditor } from '@/features/track-editor';

import { useAudioEditor } from '../../lib';
import { AudioEditorHeaderMemoized } from '../AudioEditorHeader';
import { TimelineView } from '../TimelineView';

import { AudioEditorProps } from './interfaces';

export const AudioEditor = observer(function AudioEditor({
  playlist,
  className,
  ...props
}: AudioEditorProps) {
  const { audioEditorManager, tracksManager } = useAudioEditor(playlist);

  return (
    <div className={cn('flex flex-col relative', className)} {...props}>
      <AudioEditorHeaderMemoized audioEditorManager={audioEditorManager} />
      <TracksManagerContext.Provider value={tracksManager}>
        <TimelineView
          playlist={playlist}
          audioEditorManager={audioEditorManager}
        />
        {!audioEditorManager.editableTrack ? null : (
          <TrackEditor
            className='absolute bottom-[100px] z-10 h-[43%] max-h-[466px] min-h-[161px] w-full'
            audioEditorManager={audioEditorManager}
          />
        )}
      </TracksManagerContext.Provider>
    </div>
  );
});
