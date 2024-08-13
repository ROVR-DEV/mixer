export const checkDragFilesMimeType = (
  items: DataTransferItemList,
  predicate: (mimeType: string) => boolean,
) => {
  if (items.length === 0) {
    return false;
  }

  let isOnlyRightTypeFiles = true;
  for (const item of items) {
    if (!predicate(item.type)) {
      isOnlyRightTypeFiles = false;
      break;
    }
  }

  return isOnlyRightTypeFiles;
};
