import {
  IObservableArray,
  ObservableMap,
  makeObservable,
  observable,
  runInAction,
} from 'mobx';

import { clamp } from '@/shared/lib';

// eslint-disable-next-line boundaries/element-types
import { Channel } from '@/entities/channel';
// eslint-disable-next-line boundaries/element-types
import { TrackWithMeta } from '@/entities/track';

import { CHANNEL_COLORS } from '../config';

import { channelColorsGenerator } from './channelColorsGenerator';

export type TimeListener = (time: number) => void;

export class AudioEditorManager {
  private _colorsGenerator = channelColorsGenerator(CHANNEL_COLORS);

  channelIds: IObservableArray<string> = observable.array();
  channels: ObservableMap<string, Channel> = observable.map();
  selectedChannelId: string | null = null;
  selectedTrack: TrackWithMeta | null = null;
  editableTrack: TrackWithMeta | null = null;
  isPlaying: boolean = false;

  private _time: number = 0;
  private _listeners: Set<TimeListener> = new Set();

  get time(): number {
    return this._time;
  }

  set time(time: number) {
    this._time = time;
    this._triggerAllListeners();
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
    >(this, {
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
      selectedTrack: true,
      setEditableTrack: true,
      setSelectedChannel: true,
      setSelectedTrack: true,
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
    if (!channel.color) {
      runInAction(() => {
        channel.setColor(this._colorsGenerator.next().value);
      });
    }

    this.channels.set(channel.id, channel);
    this.channelIds.push(channel.id);
    return channel.id;
  };

  removeChannel = (channelId: string) => {
    const channel = this.channels.get(channelId);

    channel?.clearTracks((track) => {
      if (track.uuid === this.editableTrack?.uuid) {
        this.setEditableTrack(null);
      } else if (track.uuid === this.selectedTrack?.uuid) {
        this.setSelectedTrack(null);
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

  setSelectedTrack = (track: TrackWithMeta | null) => {
    if (this.selectedTrack?.uuid === track?.uuid) {
      return;
    }

    this.selectedTrack = track;
  };

  setEditableTrack = (track: TrackWithMeta | null) => {
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

    if (this.isPlaying) {
      this.stop();
      this.play();
    }
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

  private _triggerAllListeners = () => {
    this._listeners.forEach((listener) => listener(this._time));
  };

  private _updateTrackPlayState = (track: TrackWithMeta, time: number) => {
    if (!track.audioBuffer) {
      return;
    }

    const isTimeInTrackRange =
      time >= track.currentStartTime && time < track.currentEndTime;

    if (!isTimeInTrackRange) {
      track.audioBuffer.pause();
      return;
    }

    const isMuted = track.channel.isMuted;

    if (!isMuted && !track.audioBuffer.isPlaying()) {
      const trackTime = time - track.currentStartTime + track.startTimeOffset;
      track.audioBuffer.setTime(trackTime);
      track.audioBuffer.play();
    } else if (isMuted) {
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
