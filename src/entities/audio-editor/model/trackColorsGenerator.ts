export function* trackColorsGenerator(
  colors: string[],
  // eslint-disable-next-line @typescript-eslint/ban-types
): Generator<string, string, string | { reset: boolean }> {
  let currentColorIndex = 0;

  while (true) {
    const color = yield colors[currentColorIndex];

    if (typeof color === 'object' && color.reset === true) {
      currentColorIndex = 0;
      continue;
    }

    currentColorIndex += 1;
    if (currentColorIndex >= colors.length) {
      currentColorIndex = 0;
    }
  }
}
