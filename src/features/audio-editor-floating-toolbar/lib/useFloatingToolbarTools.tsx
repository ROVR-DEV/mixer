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
  AudioEditorEvent,
  AudioEditorTool,
  KEY_BINDING_REVERSE_TO_OBJECT,
  ToolButton,
  ToolGroup,
  useAudioEditor,
} from '@/entities/audio-editor';
import { KeyBind } from '@/entities/event';

const TOOL_ICONS: Record<AudioEditorTool, JSX.Element> = {
  cursor: <CursorIcon />,
  scissors: <ScissorsIcon />,
  magnifier: <MagnifierIcon />,
};

const AUDIO_EDITOR_TOOL_TO_EVENT: Record<AudioEditorTool, AudioEditorEvent> = {
  cursor: 'Cursor',
  scissors: 'Cut',
  magnifier: 'Magnifier',
};

const AUDIO_EDITOR_ACTION_TO_EVENT: Record<string, AudioEditorEvent> = {
  loop: 'Loop',
  fit: 'Fit',
};

// TODO: move to audio editor
const AUDIO_EDITOR_ACTIONS = ['loop', 'fit', 'magnet'] as const;

type AudioEditorAction = (typeof AUDIO_EDITOR_ACTIONS)[number];

const ACTION_ICONS: Record<AudioEditorAction, JSX.Element> = {
  loop: <LoopIcon />,
  fit: <FitIcon />,
  magnet: <MagnetIcon />,
};

const getLabelWithKeyBindHint = (label: string, keyBind: KeyBind): string => {
  const newLabel = [label];

  if (keyBind) {
    newLabel.push(`(${keyBind.toHumanString()})`);
  }

  return newLabel.join(' ');
};

// TODO: move to separate components
export const useFloatingToolbarTools = () => {
  const audioEditor = useAudioEditor();

  const tools = useMemo(
    () => ({
      name: 'Tools',
      buttons: audioEditor.options.availableTools.map((tool) => ({
        label: getLabelWithKeyBindHint(
          capitalize(tool),
          KEY_BINDING_REVERSE_TO_OBJECT[AUDIO_EDITOR_TOOL_TO_EVENT[tool]],
        ),
        value: tool,
        icon: TOOL_ICONS[tool],
        isActive: tool == audioEditor.tool,
        onClick: () => {
          audioEditor.tool = tool;
        },
      })),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [audioEditor, audioEditor.tool],
  );

  const actions = useMemo(
    () => ({
      name: 'Actions',
      buttons: AUDIO_EDITOR_ACTIONS.map<ToolButton>((action) => {
        let isActive = false;
        let onClick = undefined;

        switch (action) {
          case 'loop':
            isActive = audioEditor.player.region.isEnabled;
            onClick = () => audioEditor.player.region.toggle();
            break;
          case 'fit':
            isActive = audioEditor.isFitActivated;
            onClick = () => audioEditor.fit();
            break;
          case 'magnet':
            isActive = false;
            onClick = () => {};
            break;
          default:
            onClick = () => {};
            break;
        }

        return {
          label: getLabelWithKeyBindHint(
            capitalize(action),
            KEY_BINDING_REVERSE_TO_OBJECT[AUDIO_EDITOR_ACTION_TO_EVENT[action]],
          ),
          value: action,
          icon: ACTION_ICONS[action],
          isActive: isActive,
          onClick: onClick,
          fillType: action === 'fit' ? 'fill' : undefined,
        };
      }),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      audioEditor,
      audioEditor.player.region.isEnabled,
      audioEditor.isFitActivated,
    ],
  );

  const undoRedo = useMemo(
    () => ({
      name: 'Undo/Redo',
      buttons: [
        {
          label: getLabelWithKeyBindHint(
            'Undo',
            KEY_BINDING_REVERSE_TO_OBJECT['Undo'],
          ),
          value: 'undo',
          icon: <UndoIcon />,
          isActive: false,
          onClick: () => {
            audioEditor.undo();
          },
        },
        {
          label: getLabelWithKeyBindHint(
            'Redo',
            KEY_BINDING_REVERSE_TO_OBJECT['Redo'],
          ),
          value: 'redo',
          icon: <RedoIcon />,
          isActive: false,
          onClick: () => {
            audioEditor.redo();
          },
        },
      ],
    }),
    [audioEditor],
  );

  return useMemo(
    () => [tools, actions, undoRedo] satisfies ToolGroup[],
    [actions, tools, undoRedo],
  );
};
