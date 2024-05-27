import {
  IObservableArray,
  ObservableMap,
  makeObservable,
  observable,
} from 'mobx';

// eslint-disable-next-line boundaries/element-types
import { Channel } from '@/entities/channel';
// eslint-disable-next-line boundaries/element-types
import { TrackWithMeta } from '@/entities/track';

export class AudioEditorManager {
  channelIds: IObservableArray<string> = observable.array();
  channels: ObservableMap<string, Channel> = observable.map();
  selectedChannelId: string | null = null;
  selectedTrack: TrackWithMeta | null = null;

  time: number = 0;
  isPlaying: boolean = false;

  constructor(channels?: Channel[]) {
    channels?.forEach((channel) => this.addChannel(channel));

    makeObservable<
      AudioEditorManager,
      | '_prepareForPlay'
      | '_prepareForStop'
      | '_performOnTracks'
      | '_updateTrackPlayState'
    >(this, {
      channelIds: true,
      updateAudioBuffer: true,
      _performOnTracks: false,
      _updateTrackPlayState: false,
      _prepareForStop: false,
      _prepareForPlay: false,
      seekTo: true,
      setSelectedTrack: true,
      selectedTrack: true,
      addChannel: true,
      channels: true,
      clearTracks: true,
      isPlaying: true,
      play: true,
      removeChannel: true,
      selectedChannelId: true,
      setSelectedChannel: true,
      stop: true,
      time: false,
    });
  }

  addChannel = (channel: Channel = new Channel()) => {
    this.channels.set(channel.id, channel);
    this.channelIds.push(channel.id);
    return channel.id;
  };

  removeChannel = (channelId: string) => {
    this.channels.delete(channelId);
    this.channelIds.remove(channelId);
  };

  setSelectedChannel = (channelId: string) => {
    this.selectedChannelId = channelId;
  };

  setSelectedTrack = (track: TrackWithMeta | null) => {
    if (this.selectedTrack?.uuid === track?.uuid) {
      return;
    }

    this.selectedTrack = track;
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
    this.time = time;

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
