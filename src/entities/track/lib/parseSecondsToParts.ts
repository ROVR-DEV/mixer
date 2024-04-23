export const parseSecondsToParts = (totalSeconds: number) => {
  const seconds = Math.floor(totalSeconds);
  const milliseconds = Math.floor((totalSeconds - seconds) * 1000);
  const microseconds = Math.floor(
    (totalSeconds - seconds - milliseconds / 1000) * 1000 * 1000,
  );

  return { seconds, milliseconds, microseconds };
};
