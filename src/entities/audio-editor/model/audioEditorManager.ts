import {
  IObservableArray,
  ObservableMap,
  makeObservable,
  observable,
  values,
} from 'mobx';

import { clamp } from '@/shared/lib';

// eslint-disable-next-line boundaries/element-types
import { Channel, TRACK_COLORS } from '@/entities/channel';
// eslint-disable-next-line boundaries/element-types
import { AudioEditorTrack } from '@/entities/track';

import { trackColorsGenerator } from './trackColorsGenerator';

export type TimeListener = (time: number) => void;

export class AudioEditorManager {
  channelIds: IObservableArray<string> = observable.array();
  channels: ObservableMap<string, Channel> = observable.map();
  selectedChannelId: string | null = null;
  selectedTracks: ObservableMap<string, AudioEditorTrack> = observable.map();
  editableTrack: AudioEditorTrack | null = null;
  isPlaying: boolean = false;

  private _colorsGenerator = trackColorsGenerator(TRACK_COLORS);

  private _time: number = 0;
  private _listeners: Set<TimeListener> = new Set();

  get time(): number {
    return this._time;
  }

  set time(time: number) {
    this._time = time;
    this._triggerAllListeners();
  }

  get firstSelectedTrack(): AudioEditorTrack | null {
    return values(this.selectedTracks)[0];
  }

  constructor(channels?: Channel[]) {
    channels?.forEach((channel) => this.addChannel(channel));

    makeObservable<
      AudioEditorManager,
      | '_prepareForPlay'
      | '_prepareForStop'
      | '_performOnTracks'
      | '_updateTrackPlayState'
      | '_time'
      | '_listeners'
      | '_triggerAllListeners'
      | '_colorsGenerator'
      | '_updateTracksTime'
    >(this, {
      isTrackIntersectsWithTime: true,
      firstSelectedTrack: true,
      isTrackSelected: true,
      unselectTrack: true,
      unselectAllTracks: true,
      selectTrack: true,
      selectedTracks: true,
      _updateTracksTime: true,
      _colorsGenerator: false,
      _listeners: false,
      _performOnTracks: false,
      _prepareForPlay: false,
      _prepareForStop: false,
      _time: false,
      _triggerAllListeners: false,
      _updateTrackPlayState: false,
      addChannel: true,
      addListener: true,
      channelIds: true,
      channels: true,
      clearTracks: true,
      editableTrack: true,
      isPlaying: true,
      play: true,
      removeChannel: true,
      removeListener: true,
      seekTo: true,
      selectedChannelId: true,
      setEditableTrack: true,
      setSelectedChannel: true,
      stop: true,
      time: false,
      updateAudioBuffer: true,
    });
  }

  addListener = (listener: TimeListener) => {
    this._listeners.add(listener);
  };

  removeListener = (listener: TimeListener) => {
    this._listeners.delete(listener);
  };

  addChannel = (channel: Channel = new Channel()) => {
    channel.colorsGenerator = this._colorsGenerator;
    this.channels.set(channel.id, channel);
    this.channelIds.push(channel.id);
    return channel.id;
  };

  removeChannel = (channelId: string) => {
    const channel = this.channels.get(channelId);

    channel?.clearTracks((track) => {
      if (track.uuid === this.editableTrack?.uuid) {
        this.setEditableTrack(null);
      } else if (this.isTrackSelected(track)) {
        this.unselectTrack(track);
      }
    });

    if (this.selectedChannelId === channelId) {
      this.setSelectedChannel(null);
    }

    this.channels.delete(channelId);
    this.channelIds.remove(channelId);
  };

  setSelectedChannel = (channelId: string | null) => {
    this.selectedChannelId = channelId;
  };

  selectTrack = (track: AudioEditorTrack, multiple: boolean = false) => {
    if (this.isTrackSelected(track)) {
      if (multiple) {
        this.unselectTrack(track);
      }
      return;
    }

    if (!multiple) {
      this.unselectAllTracks();
    }

    this.selectedTracks.set(track.uuid, track);
  };

  unselectTrack = (track: AudioEditorTrack) => {
    this.selectedTracks.delete(track.uuid);
  };

  unselectAllTracks = () => {
    if (this.selectedTracks.size === 0) {
      return;
    }

    this.selectedTracks.clear();
  };

  isTrackSelected = (track: AudioEditorTrack) => {
    return this.selectedTracks.has(track.uuid);
  };

  setEditableTrack = (track: AudioEditorTrack | null) => {
    if (this.editableTrack?.uuid === track?.uuid) {
      return;
    }

    this.editableTrack = track;
  };

  clearTracks = () => {
    this.channels.forEach((channel) => channel.clearTracks());
  };

  play = () => {
    if (this.isPlaying) {
      return;
    }

    this.isPlaying = true;
    this._prepareForPlay();
  };

  stop = () => {
    if (!this.isPlaying) {
      return;
    }

    this.isPlaying = false;
    this._prepareForStop();
  };

  seekTo = (time: number) => {
    this.time = clamp(time, 0);
    this._updateTracksTime(this.time);
  };

  updateAudioBuffer = () => {
    if (!this.isPlaying) {
      return;
    }

    this.channels.forEach((channel) => {
      channel.tracks.forEach((track) =>
        this._updateTrackPlayState(track, this.time),
      );
    });
  };

  isTrackIntersectsWithTime = (track: AudioEditorTrack, time: number) => {
    return time >= track.trimStartTime && time < track.trimEndTime;
  };

  private _updateTracksTime = (time: number) => {
    this.channels.forEach((channel) => {
      channel.tracks.forEach((track) => {
        if (!track.audioBuffer) {
          return;
        }

        if (this.isTrackIntersectsWithTime(track, time)) {
          const trackTime = time - track.startTime;
          track.audioBuffer.setTime(trackTime);
        }
      });
    });
  };

  private _triggerAllListeners = () => {
    this._listeners.forEach((listener) => listener(this._time));
  };

  private _updateTrackPlayState = (track: AudioEditorTrack, time: number) => {
    if (!track.audioBuffer) {
      return;
    }

    if (!this.isTrackIntersectsWithTime(track, time)) {
      if (track.audioBuffer.isPlaying()) {
        track.audioBuffer.pause();
      }
      return;
    }

    const isMuted = track.channel.isMuted;
    const isPlaying = track.audioBuffer.isPlaying();

    if (!isMuted && !isPlaying) {
      const trackTime = time - track.startTime;
      track.audioBuffer.setTime(trackTime);
      track.audioBuffer.play();
    } else if (isMuted && isPlaying) {
      track.audioBuffer.pause();
    }
  };

  private _prepareForPlay = () => {
    this.channels.forEach((channel) => {
      channel.tracks.forEach((track) =>
        this._updateTrackPlayState(track, this.time),
      );
    });
  };

  private _prepareForStop = () => {
    this.channels.forEach((channel) => {
      channel.tracks.forEach((track) => {
        track.audioBuffer?.pause();
      });
    });
  };
}
