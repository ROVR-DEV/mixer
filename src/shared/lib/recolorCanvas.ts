import { CSSProperties } from 'react';

export const recolorCanvas = (
  ctx: CanvasRenderingContext2D,
  color: CSSProperties['color'],
  from: number = -Infinity,
  width: number = Infinity,
) => {
  if (!color) {
    return;
  }

  // Сохраняем состояние холста
  ctx.save();

  const prevCompositeOperation = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = 'source-in';

  // Создаем маску с учетом возможного смещения волны
  ctx.beginPath();
  ctx.rect(from, 0, width, ctx.canvas.height); // Пример с учетом смещения
  ctx.clip();

  // Заполняем область маски новым цветом
  ctx.fillStyle = color;
  ctx.fill();

  ctx.globalCompositeOperation = prevCompositeOperation;
  ctx.restore();
};
