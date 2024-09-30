import { computed, makeAutoObservable, observable, runInAction } from 'mobx';

import { HistoryManager, IS_DEBUG_LEVEL_INFO, Rect } from '@/shared/model';

// eslint-disable-next-line boundaries/element-types
import { Channel } from '@/entities/channel';
// eslint-disable-next-line boundaries/element-types
import { Playlist } from '@/entities/playlist';
// eslint-disable-next-line boundaries/element-types
import { AudioEditorTrack, Track } from '@/entities/track';

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
  readonly draggingTracksMaxEndTime: number;

  readonly draggingTracksMaxDuration: number;

  readonly draggingTracksMinChannelIndex: number;
  readonly draggingTracksMaxChannelIndex: number;

  readonly isFitActivated: boolean;

  timeline: Timeline | null;

  tool: AudioEditorTool;

  selectedChannel: Channel | null;

  editableTrack: AudioEditorTrack | null;
  draggingTracks: AudioEditorTrack[];

  importPlaylist: (playlist: Playlist) => Promise<void>;
  importTrack(track: Track, channelIndex?: number): Promise<void>;

  removeTrack(track: AudioEditorTrack, dispose?: boolean): void;

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

  hydration(playlist: Playlist): void;
}

export interface AudioEditorState {
  player: PlayerState;
}

export class ObservableAudioEditor implements AudioEditor {
  readonly options: AudioEditorOptions;

  readonly selectedTracks = observable.set<AudioEditorTrack>();

  private _zoomBeforeFit: number | null = null;
  private _scrollBeforeFit: number | null = null;

  private _history = new HistoryManager<AudioEditorState>();

  private _player: Player;
  private _timeline: Timeline | null = null;
  private _tool: AudioEditorTool;

  private _selectedChannel: Channel | null = null;

  private _editableTrack: AudioEditorTrack | null = null;
  private _draggingTracks = observable.array<AudioEditorTrack>();

  private _isSaveStatePaused: boolean = false;

  isDraggingSomething: boolean = false;

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

  get draggingTracksMaxEndTime(): number {
    return this.draggingTracks.reduce((maxEndTime, track) => {
      const endTime = track.dndInfo.endTime;
      return maxEndTime > endTime ? maxEndTime : endTime;
    }, 0);
  }

  get draggingTracksMaxDuration(): number {
    return this.draggingTracks.reduce((maxDuration, track) => {
      const duration = track.dndInfo.duration;
      return maxDuration > duration ? maxDuration : duration;
    }, 0);
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

  get isFitActivated(): boolean {
    return this._zoomBeforeFit !== null && this._scrollBeforeFit !== null;
  }

  constructor(options: AudioEditorOptions = AUDIO_EDITOR_DEFAULT_OPTIONS) {
    this.options = options;
    this._tool = options.availableTools[0];
    this._player = new ObservablePlayer();

    makeAutoObservable(this, {
      tool: computed,
      isFitActivated: computed,
      draggingTracksMaxChannelIndex: computed,
      draggingTracksMaxDuration: computed,
      draggingTracksMaxEndTime: computed,
      draggingTracksMinChannelIndex: computed,
      draggingTracksMinStartTime: computed,
    });
  }

  importPlaylist = async (playlist: Playlist): Promise<void> => {
    this.clearState();

    this.player.importPlaylist(playlist);
    await this.player.loadTracks(true);

    this.saveState();
  };

  importTrack = async (track: Track, channelIndex?: number): Promise<void> => {
    this.player.importTrack(track, channelIndex);
    this.saveState();
  };

  removeTrack = (track: AudioEditorTrack, dispose: boolean = false) => {
    this.player.removeTrack(track, dispose);
    this.saveState();
  };

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

    if (this._zoomBeforeFit !== null && this._scrollBeforeFit !== null) {
      this._timeline.zoom = this._zoomBeforeFit;
      this._timeline.zoomController.min = 1;

      this._timeline.hScroll = this._scrollBeforeFit;

      this._zoomBeforeFit = null;
      this._scrollBeforeFit = null;
      return;
    }

    this._zoomBeforeFit = this._timeline.zoom;
    this._scrollBeforeFit = this._timeline.hScroll;

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
      this._timeline.timeToPixels(minMax.min),
      this._timeline.timeToPixels(minMax.max),
    );
  };

  magnify = (virtualRect: Rect) => {
    if (!this._timeline) {
      return;
    }

    if (this.isFitActivated) {
      const prevTimeStart = this._timeline.pixelsToTime(virtualRect.left);
      const prevTimeWidth = this._timeline.pixelsToTime(virtualRect.width);
      this.fit();
      virtualRect.x = this._timeline.timeToPixels(prevTimeStart);
      virtualRect.width = this._timeline.timeToPixels(prevTimeWidth);
    }

    this._timeline.setViewBoundsInPixels(virtualRect.left, virtualRect.right);
  };

  unMagnify = () => {
    if (!this._timeline) {
      return;
    }

    const prevScrollTime = this._timeline.pixelsToTime(this._timeline.hScroll);

    if (this.isFitActivated) {
      this.fit();
    }
    this._timeline.zoom = 1;

    const newScroll = this._timeline.timeToPixels(prevScrollTime);
    this._timeline.hScroll = newScroll;
  };

  clearState(): void {
    this._history.clear();
  }

  saveState(): void {
    if (this._isSaveStatePaused) {
      return;
    }

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

  hydration = async (playlist: Playlist): Promise<void> => {
    if (playlist.hash === this.player.playlist?.hash) {
      return;
    }

    this._isSaveStatePaused = true;

    this.player.events.once(
      'ready',
      () => {
        runInAction(() => {
          this._isSaveStatePaused = false;
          this.saveState();
          if (IS_DEBUG_LEVEL_INFO) {
            // eslint-disable-next-line no-console
            console.info('AudioEditor: hydrated');
          }
        });
      },
      this,
    );

    // Update playlist in player
    await this.player.hydration(playlist);
  };
}
