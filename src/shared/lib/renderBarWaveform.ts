const options = {
  barWidth: 1.5,
  barGap: 2.8,
  barRadius: 0,
  barAlign: '',
};

// eslint-disable-next-line complexity
export const renderBarWaveform = (
  ctx: CanvasRenderingContext2D,
  channelData: Array<Float32Array | number[]>,
  waveColor: string,
  // eslint-disable-next-line sonarjs/cognitive-complexity
) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = waveColor;

  const vScale = 1;

  if (channelData.length === 0) {
    return;
  }

  const topChannel = channelData[0];
  const bottomChannel = channelData[1] || channelData[0];
  const length = topChannel.length;

  const { width, height } = ctx.canvas;
  const halfHeight = height / 2;
  const pixelRatio = 1;

  const barWidth = options.barWidth ? options.barWidth * pixelRatio : 1;
  const barGap = options.barGap
    ? options.barGap * pixelRatio
    : options.barWidth
      ? barWidth / 2
      : 0;
  const barRadius = options.barRadius || 0;
  const barIndexScale = width / (barWidth + barGap) / length;

  const rectFn = barRadius && 'roundRect' in ctx ? 'roundRect' : 'rect';

  ctx.beginPath();
  ctx.imageSmoothingEnabled = false;

  let prevX = 0;
  let maxTop = 0;
  let maxBottom = 0;
  for (let i = 0; i <= length; i++) {
    const x = Math.round(i * barIndexScale);

    if (x > prevX) {
      const topBarHeight = Math.round(maxTop * halfHeight * vScale);
      const bottomBarHeight = Math.round(maxBottom * halfHeight * vScale);
      const barHeight = topBarHeight + bottomBarHeight || 1;

      // Vertical alignment
      let y = halfHeight - topBarHeight;
      if (options.barAlign === 'top') {
        y = 0;
      } else if (options.barAlign === 'bottom') {
        y = height - barHeight;
      }

      ctx[rectFn](
        prevX * (barWidth + barGap),
        y,
        barWidth,
        barHeight,
        barRadius,
      );

      prevX = x;
      maxTop = 0;
      maxBottom = 0;
    }

    const magnitudeTop = Math.abs(topChannel[i] || 0);
    const magnitudeBottom = Math.abs(bottomChannel[i] || 0);
    if (magnitudeTop > maxTop) {
      maxTop = magnitudeTop;
    }
    if (magnitudeBottom > maxBottom) {
      maxBottom = magnitudeBottom;
    }
  }

  ctx.fill();
  ctx.closePath();
};
