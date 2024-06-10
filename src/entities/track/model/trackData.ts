import { makeAutoObservable } from 'mobx';

export type TrackDataStatus = 'empty' | 'loading' | 'fulfilled';

export class TrackData {
  uuid: string;
  status: TrackDataStatus = 'empty';

  blob: Blob | null = null;
  objectUrl: string | null = null;

  constructor(uuid: string) {
    this.uuid = uuid;

    makeAutoObservable(this);
  }

  setData = (data: Blob) => {
    this.status = 'fulfilled';

    this.blob = data;
    this.objectUrl = URL.createObjectURL(data);
  };
}
