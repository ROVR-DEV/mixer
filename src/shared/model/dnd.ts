import { DraggableEventHandler } from 'react-draggable';

import { AddParameters } from './interfaces';

export interface Point {
  x: number;
  y: number;
}

export interface DnDInfo {
  isDragging: boolean;
  startX: number;
  startY: number;
}

export type CustomData<
  T extends Record<string, unknown> = Record<string, unknown>,
> = Partial<T>;

export interface DnDData<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  isDragging: boolean;
  offsetFromContainer: Point;
  startPosition: Point;
  currentPosition: Point;
  customProperties: CustomData<T>;
}

export type CustomDragEventHandler<
  T extends Record<string, unknown> = Record<string, unknown>,
> = AddParameters<DraggableEventHandler, [customData: CustomData<T>]>;
