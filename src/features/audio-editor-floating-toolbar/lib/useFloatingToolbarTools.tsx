'use client';

import { useMemo } from 'react';

import { capitalize } from '@/shared/lib';
import {
  CursorIcon,
  FitIcon,
  LoopIcon,
  MagnetIcon,
  MagnifierIcon,
  RedoIcon,
  ScissorsIcon,
  UndoIcon,
} from '@/shared/ui/assets';

import {
  AudioEditorTool,
  ToolGroup,
  useAudioEditor,
} from '@/entities/audio-editor';

const TOOL_ICONS: Record<AudioEditorTool, JSX.Element> = {
  cursor: <CursorIcon />,
  scissors: <ScissorsIcon />,
  magnifier: <MagnifierIcon />,
};

export const useFloatingToolbarTools = () => {
  const audioEditor = useAudioEditor();

  return useMemo(
    () =>
      [
        {
          name: 'Tools',
          buttons: audioEditor.options.availableTools.map((tool) => ({
            label: capitalize(tool),
            value: tool,
            icon: TOOL_ICONS[tool],
            isActive: tool == audioEditor.tool,
            onClick: () => {
              audioEditor.tool = tool;
            },
          })),
        },
        {
          name: 'Actions',
          buttons: [
            {
              label: 'Loop',
              value: 'loop',
              icon: <LoopIcon />,
              isActive: audioEditor.player.region.isEnabled,
              onClick: () => audioEditor.player.region.toggle(),
            },
            {
              label: 'Fit',
              value: 'fit',
              icon: <FitIcon />,
              isActive: audioEditor.isFitActivated,
              onClick: () => audioEditor.fit(),
              fillType: 'fill',
            },
            {
              label: 'Magnet',
              value: 'magnet',
              icon: <MagnetIcon />,
              isActive: false,
              onClick: () => {},
            },
          ],
        },
        {
          name: 'Undo/Redo',
          buttons: [
            {
              label: 'Undo',
              value: 'undo',
              icon: <UndoIcon />,
              isActive: false,
              onClick: () => {
                audioEditor.undo();
              },
            },
            {
              label: 'Redo',
              value: 'redo',
              icon: <RedoIcon />,
              isActive: false,
              onClick: () => {
                audioEditor.redo();
              },
            },
          ],
        },
      ] satisfies ToolGroup[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      audioEditor.tool,
      audioEditor.player.region.isEnabled,
      audioEditor.isFitActivated,
    ],
  );
};
