import { Rect } from '.';

export const checkHorizontalCollision = (
  aXStart: number,
  aXEnd: number,
  bXStart: number,
  bXEnd: number,
) => {
  return aXStart < bXEnd && aXEnd > bXStart;
};

export const checkVerticalCollision = (
  aYStart: number,
  aYEnd: number,
  bYStart: number,
  bYEnd: number,
) => {
  return aYStart < bYEnd && aYEnd > bYStart;
};

export const checkCollision = (a: Rect, b: Rect) => {
  return (
    checkHorizontalCollision(a.x, a.x + a.width, b.x, b.x + b.width) &&
    checkVerticalCollision(a.y, a.y + a.height, b.y, b.y + b.height)
  );
};
