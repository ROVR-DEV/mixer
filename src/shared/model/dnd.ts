export interface DnDInfo {
  isDragging: boolean;
  startX: number;
  startY: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface DnDData<T = any> {
  isDragging: boolean;
  startPosition: Point;
  currentPosition: Point;
  customProperties: T;
}

export interface Point {
  x: number;
  y: number;
}
