import { observable } from 'mobx';

export const toOwnedObservable = <T extends object>(obj: T) =>
  observable.object({ ...obj });
