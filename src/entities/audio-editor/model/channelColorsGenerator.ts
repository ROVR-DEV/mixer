export function* trackColorsGenerator(
  colors: string[],
): Generator<string, string, string> {
  let currentColorIndex = 0;

  while (true) {
    yield colors[currentColorIndex];

    currentColorIndex += 1;
    if (currentColorIndex >= colors.length) {
      currentColorIndex = 0;
    }
  }
}
