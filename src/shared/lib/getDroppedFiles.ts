export const getDroppedFiles = (e: React.DragEvent): File[] => {
  if (e.dataTransfer.items) {
    return Array.from(e.dataTransfer.items)
      .filter((item) => item.kind === 'file')
      .map((item) => item.getAsFile())
      .filter((item) => item !== null) as File[];
  } else {
    return Array.from(e.dataTransfer.files).filter((file) => file !== null);
  }
};
