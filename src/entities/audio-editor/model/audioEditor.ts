import { computed, makeAutoObservable, observable } from 'mobx';

// eslint-disable-next-line boundaries/element-types
import { Channel } from '@/entities/channel';
// eslint-disable-next-line boundaries/element-types
import { AudioEditorTrack } from '@/entities/track';

import { ALL_AUDIO_EDITOR_TOOLS, AudioEditorTool } from './audioEditorTool';
import { Player } from './player';

const AUDIO_EDITOR_DEFAULT_OPTIONS: AudioEditorOptions = {
  availableTools: ALL_AUDIO_EDITOR_TOOLS,
};

export interface AudioEditorOptions {
  availableTools: readonly AudioEditorTool[];
}

export interface AudioEditor {
  readonly options: AudioEditorOptions;

  readonly player: Player;

  readonly selectedTracks: Set<AudioEditorTrack>;

  readonly draggingTracksMinStartTime: number;

  readonly draggingTracksMinChannelIndex: number;
  readonly draggingTracksMaxChannelIndex: number;

  tool: AudioEditorTool;

  selectedChannel: Channel | null;

  editableTrack: AudioEditorTrack | null;
  draggingTracks: AudioEditorTrack[];

  selectTrack: (track: AudioEditorTrack, multiple?: boolean) => void;
  unselectTrack: (track: AudioEditorTrack) => void;
  unselectTracks: () => void;

  isTrackSelected: (track: AudioEditorTrack) => boolean;
}

export class ObservableAudioEditor implements AudioEditor {
  readonly options: AudioEditorOptions;

  readonly selectedTracks = observable.set<AudioEditorTrack>();

  private _player: Player;
  private _tool: AudioEditorTool;

  private _selectedChannel: Channel | null = null;

  private _editableTrack: AudioEditorTrack | null = null;
  private _draggingTracks = observable.array<AudioEditorTrack>();

  get selectedChannel(): Channel | null {
    return this._selectedChannel;
  }
  set selectedChannel(channel: Channel | null) {
    this._selectedChannel = channel;
  }

  get editableTrack(): AudioEditorTrack | null {
    return this._editableTrack;
  }
  set editableTrack(value: AudioEditorTrack) {
    this._editableTrack = value;
  }

  get draggingTracks(): AudioEditorTrack[] {
    return this._draggingTracks;
  }
  set draggingTracks(value: AudioEditorTrack[]) {
    this._draggingTracks.replace(value);
  }

  get draggingTracksMinStartTime(): number {
    return this.draggingTracks.reduce((minStartTime, track) => {
      const startTime = track.dndInfo.startTime;
      return minStartTime < startTime ? minStartTime : startTime;
    }, Infinity);
  }

  get draggingTracksMinChannelIndex(): number {
    return this.draggingTracks.reduce((minChannelIndex, track) => {
      const startChannelIndex = track.dndInfo.startChannelIndex;
      return startChannelIndex === undefined
        ? minChannelIndex
        : Math.min(minChannelIndex, startChannelIndex);
    }, Infinity);
  }
  get draggingTracksMaxChannelIndex(): number {
    return this.draggingTracks.reduce((maxChannelIndex, track) => {
      const startChannelIndex = track.dndInfo.startChannelIndex;
      return startChannelIndex !== undefined
        ? Math.max(maxChannelIndex, startChannelIndex)
        : maxChannelIndex;
    }, 0);
  }

  get player(): Player {
    return this._player;
  }

  get tool(): AudioEditorTool {
    return this._tool;
  }
  set tool(value: AudioEditorTool) {
    if (!this.options.availableTools.includes(value)) {
      return;
    }

    this._tool = value;
  }

  constructor(
    player: Player,
    options: AudioEditorOptions = AUDIO_EDITOR_DEFAULT_OPTIONS,
  ) {
    this.options = options;
    this._tool = options.availableTools[0];

    this._player = player;

    makeAutoObservable(this, {
      tool: computed,
    });
  }

  selectTrack = (track: AudioEditorTrack, multiple: boolean = false) => {
    if (this.isTrackSelected(track)) {
      if (multiple) {
        this.unselectTrack(track);
      }
      return;
    }

    if (!multiple) {
      this.unselectTracks();
    }

    this.selectedTracks.add(track);
  };

  unselectTrack = (track: AudioEditorTrack) => {
    this.selectedTracks.delete(track);
  };

  unselectTracks = () => {
    if (this.selectedTracks.size === 0) {
      return;
    }

    this.selectedTracks.clear();
  };

  isTrackSelected = (track: AudioEditorTrack) => {
    return this.selectedTracks.has(track);
  };
}
