'use client';

import { observer } from 'mobx-react-lite';

import {
  AUDIO_EDITOR_TOOL_GROUPS,
  AudioEditorFloatingToolbarMemoized,
  useAudioEditor,
} from '@/entities/audio-editor';

import { AudioEditorFloatingToolbarViewProps } from './interfaces';

export const AudioEditorFloatingToolbarView = observer(
  function AudioEditorFloatingToolbarView({
    ...props
  }: AudioEditorFloatingToolbarViewProps) {
    const audioEditor = useAudioEditor();

    return (
      <AudioEditorFloatingToolbarMemoized
        tools={AUDIO_EDITOR_TOOL_GROUPS}
        currentTool={audioEditor.tool}
        onToolChange={audioEditor.useTool}
        {...props}
      />
    );
  },
);

// switch (tool) {
//   case 'cursor':
//     break;
//   case 'scissors':
//     player.selectedTracks.forEach((track: AudioEditorTrack) => {
//       if (player.isTrackIntersectsWithTime(track, player.time)) {
//         track.cut(player.time);
//       }
//     });
//     break;
//   // case 'magnifier':
//   // break;
//   // case 'repeat':
//   // break;
//   // case 'fit':
//   // break;
//   // case 'magnet':
//   // break;
//   // case 'undo':
//   // break;
//   // case 'redo':
//   // break;
//   default:
//     break;
// }
