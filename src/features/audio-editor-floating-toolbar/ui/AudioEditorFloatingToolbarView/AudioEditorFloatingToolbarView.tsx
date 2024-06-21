import { useCallback } from 'react';

import {
  AudioEditorFloatingToolbarMemoized,
  AudioEditorTool,
} from '@/entities/audio-editor';
import { AudioEditorTrack } from '@/entities/track';

import { AudioEditorFloatingToolbarViewProps } from './interfaces';

export const AudioEditorFloatingToolbarView = ({
  audioEditorManager,
  ...props
}: AudioEditorFloatingToolbarViewProps) => {
  const handleToolChange = useCallback(
    (tool: AudioEditorTool) => {
      switch (tool) {
        case 'cursor':
          break;
        case 'scissors':
          audioEditorManager.selectedTracks.forEach(
            (track: AudioEditorTrack) => {
              if (
                audioEditorManager.isTrackIntersectsWithTime(
                  track,
                  audioEditorManager.time,
                )
              ) {
                track.cut(audioEditorManager.time);
              }
            },
          );
          break;
        // case 'magnifier':
        // break;
        // case 'repeat':
        // break;
        // case 'fit':
        // break;
        // case 'magnet':
        // break;
        // case 'undo':
        // break;
        // case 'redo':
        // break;
        default:
          break;
      }
    },
    [audioEditorManager],
  );

  return (
    <AudioEditorFloatingToolbarMemoized
      onToolChange={handleToolChange}
      {...props}
    />
  );
};
