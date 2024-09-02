import { getTrack } from '../api';

interface TrackLoadData {
  uuid: string;
  cache: boolean;
}

self.onmessage = async (event: MessageEvent<TrackLoadData>) => {
  const data = await getTrack(event.data.uuid, event.data.cache);

  let transfer = {};
  if (!data.data) {
    data.data = null;
  } else {
    transfer = { transfer: [data.data] };
  }

  await new Promise((resolve) => setTimeout(resolve, 1000));

  self.postMessage({ data: data.data, error: data.error }, transfer);
};
