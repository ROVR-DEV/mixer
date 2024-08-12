export type FetchResult<D, E = Error> =
  | {
      data: D;
      error: undefined;
      response: Response;
    }
  | {
      data: undefined;
      error: E;
      response: Response | null;
    };

export const responseToData = async (
  res: Response,
): Promise<FetchResult<Response>> => ({
  data: res,
  error: undefined,
  response: res,
});

export const responseToArrayBufferData = async (
  res: Response,
): Promise<FetchResult<ArrayBuffer>> => ({
  data: await res.arrayBuffer(),
  error: undefined,
  response: res,
});

export const responseToBlobData = async (
  res: Response,
): Promise<FetchResult<Blob>> => ({
  data: new Blob([await res.arrayBuffer()], {
    type: res.headers.get('content-type') ?? '',
  }),
  error: undefined,
  response: res,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const responseToJsonData = async <T = any>(
  res: Response,
): Promise<FetchResult<T>> => ({
  data: (await res.json()) as T,
  error: undefined,
  response: res,
});

export const responseErrorToData = async (
  res: Response | null,
  error: Error,
) => ({
  data: undefined,
  error: error,
  response: res,
});

export const customFetch = async (
  input: string | URL | Request,
  init?: RequestInit,
): Promise<FetchResult<Response>> => {
  let res: Response | null = null;

  try {
    res = await fetch(input, init);

    if (!res.ok) {
      throw new Error(`Response status: ${res.status}`, { cause: res });
    }

    return responseToData(res);
  } catch (error) {
    return responseErrorToData(res, error as Error);
  }
};

export const fetchJson = async <T>(
  input: string | URL | globalThis.Request,
  init?: RequestInit,
): Promise<FetchResult<T>> => {
  const response = await customFetch(input, init);

  if (response.data) {
    return await responseToJsonData<T>(response.data);
  } else {
    return response;
  }
};

export const fetchArrayBuffer = async (
  input: string | URL | globalThis.Request,
  init?: RequestInit,
): Promise<FetchResult<ArrayBuffer>> => {
  const response = await customFetch(input, init);

  if (response.data) {
    return await responseToArrayBufferData(response.data);
  } else {
    return response;
  }
};
