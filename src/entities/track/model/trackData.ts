import { makeAutoObservable } from 'mobx';

import { arrayBufferToBlob } from '@/shared/lib';

export type TrackDataStatus = 'empty' | 'loading' | 'fulfilled';

export class TrackData {
  uuid: string;
  status: TrackDataStatus = 'empty';

  arrayBuffer: ArrayBuffer | null = null;

  blob: Blob | null = null;
  objectUrl: string | null = null;

  constructor(uuid: string) {
    this.uuid = uuid;

    makeAutoObservable(this);
  }

  setDataAsBlob = async (data: Blob) => {
    this.status = 'fulfilled';

    this.blob = data;
    this.arrayBuffer = await data.arrayBuffer();
    this.objectUrl = URL.createObjectURL(data);
  };

  setDataAsArrayBuffer = (data: ArrayBuffer) => {
    this.status = 'fulfilled';

    this.arrayBuffer = data;

    this.blob = arrayBufferToBlob(data);
    this.objectUrl = URL.createObjectURL(this.blob);
  };
}
