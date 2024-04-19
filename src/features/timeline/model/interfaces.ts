export interface Tick {
  x: number;
  number: number;
}

export interface ResultRange<T = void> {
  start: number;
  end: number;
  result: T;
}
