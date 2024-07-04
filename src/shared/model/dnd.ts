export interface Point {
  x: number;
  y: number;
}

export interface DnDInfo {
  isDragging: boolean;
  startX: number;
  startY: number;
}

export interface DnDData<
  CustomData extends Record<string, unknown> = Record<string, unknown>,
> {
  isDragging: boolean;
  startPosition: Point;
  currentPosition: Point;
  customProperties: Partial<CustomData>;
}
