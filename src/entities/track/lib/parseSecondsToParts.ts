export const parseSecondsToParts = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds - minutes * 60);
  const milliseconds = Math.floor(
    (totalSeconds - minutes * 60 - seconds) * 1000,
  );
  const microseconds = Math.floor(
    (totalSeconds - minutes * 60 - seconds - milliseconds / 1000) * 1000 * 1000,
  );

  return { minutes, seconds, milliseconds, microseconds };
};
