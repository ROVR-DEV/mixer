import { computed, makeAutoObservable, observable } from 'mobx';

// eslint-disable-next-line boundaries/element-types
import { Rect } from '@/shared/lib';
import { HistoryManager } from '@/shared/model';

// eslint-disable-next-line boundaries/element-types
import { Channel } from '@/entities/channel';
// eslint-disable-next-line boundaries/element-types
import { AudioEditorTrack } from '@/entities/track';

import { ALL_AUDIO_EDITOR_TOOLS, AudioEditorTool } from './audioEditorTool';
import { ObservablePlayer, Player, PlayerState } from './player';
import { Timeline } from './timeline';

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

  timeline: Timeline | null;

  tool: AudioEditorTool;

  selectedChannel: Channel | null;

  editableTrack: AudioEditorTrack | null;
  draggingTracks: AudioEditorTrack[];

  selectTrack: (track: AudioEditorTrack, multiple?: boolean) => void;
  unselectTrack: (track: AudioEditorTrack) => void;
  unselectTracks: () => void;

  isTrackSelected: (track: AudioEditorTrack) => boolean;

  fit(): void;
  magnify(virtualRect: Rect): void;
  unMagnify(): void;

  saveState(): void;
  undo: () => void;
  redo: () => void;
}

export interface AudioEditorState {
  player: PlayerState;
}

export class ObservableAudioEditor implements AudioEditor {
  readonly options: AudioEditorOptions;

  readonly selectedTracks = observable.set<AudioEditorTrack>();

  private _zoomBeforeMagnifier: number | null = null;
  private _zoomBeforeFit: number | null = null;

  private _history = new HistoryManager<AudioEditorState>();

  private _player: Player;
  private _timeline: Timeline | null = null;
  private _tool: AudioEditorTool;

  private _selectedChannel: Channel | null = null;

  private _editableTrack: AudioEditorTrack | null = null;
  private _draggingTracks = observable.array<AudioEditorTrack>();

  get timeline(): Timeline | null {
    return this._timeline;
  }
  set timeline(value: Timeline | null) {
    this._timeline = value;
  }

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
    player: Player = new ObservablePlayer(),
    options: AudioEditorOptions = AUDIO_EDITOR_DEFAULT_OPTIONS,
  ) {
    this.options = options;
    this._tool = options.availableTools[0];

    this._player = player;

    this.saveState();

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

  fit = () => {
    if (!this._timeline) {
      return;
    }

    if (this._zoomBeforeFit) {
      this._timeline.zoom = this._zoomBeforeFit;
      this._timeline.zoomController.min = 1;
      this._zoomBeforeFit = null;
      return;
    }

    this._zoomBeforeFit = this._timeline.zoom;

    const minMax = this.player.tracks.reduce(
      (acc, track) => {
        if (acc.min > track.startTime) {
          acc.min = track.startTime;
        }
        if (acc.max < track.endTime) {
          acc.max = track.endTime;
        }
        return acc;
      },
      { min: Infinity, max: -Infinity },
    );

    this._timeline.zoomController.min = 0.1;

    this._timeline.setViewBoundsInPixels(
      this._timeline.timeToVirtualPixels(minMax.min),
      this._timeline.timeToVirtualPixels(minMax.max),
    );
  };

  magnify = (virtualRect: Rect) => {
    if (!this._timeline) {
      return;
    }

    this._zoomBeforeMagnifier = this._timeline.zoom;

    this._timeline.setViewBoundsInPixels(virtualRect.left, virtualRect.right);
  };

  unMagnify = () => {
    if (!this._timeline || !this._zoomBeforeMagnifier) {
      return;
    }

    this._timeline.zoom = this._zoomBeforeMagnifier;
    this._zoomBeforeMagnifier = null;
  };

  clearState(): void {
    this._history.clear();
  }

  saveState(): void {
    this._history.addState({ player: this._player.getState() });
  }

  undo = () => {
    const state = this._history.undo();

    if (!state) {
      return;
    }

    this._restoreState(state);
  };

  redo = () => {
    const state = this._history.redo();

    if (!state) {
      return;
    }

    this._restoreState(state);
  };

  private _restoreState = (state: AudioEditorState) => {
    this._draggingTracks.clear();

    this.player.restoreState(state.player);
  };
}
