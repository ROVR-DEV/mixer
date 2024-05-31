import { makeAutoObservable } from 'mobx';

export type TrackDataStatus = 'empty' | 'loading' | 'fulfilled';

export class TrackData {
  uuid: string;
  status: TrackDataStatus;
  blob: Blob | null;

  constructor(uuid: string) {
    this.uuid = uuid;
    this.status = 'empty';
    this.blob = null;

    makeAutoObservable(this);
  }
}
