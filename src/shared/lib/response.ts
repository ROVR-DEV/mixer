export type FetchResult<D, E = Error> =
  | {
      data: D;
      error: undefined;
    }
  | {
      data: undefined;
      error: E;
    };

export const responseToBlobData = async (res: Response) => ({
  data: new Blob([await res.arrayBuffer()], {
    type: res.headers.get('content-type') ?? '',
  }),
  error: undefined,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const responseToJsonData = async <T = any>(res: Response) => ({
  data: (await res.json()) as T,
  error: undefined,
});

export const responseErrorToData = async (error: Error) => ({
  data: undefined,
  error: error,
});

export const fetchJson = async <T>(
  input: string | URL | globalThis.Request,
  init?: RequestInit,
): Promise<FetchResult<T>> => {
  const res = await fetch(input, init);

  try {
    return await responseToJsonData<T>(res);
  } catch (error) {
    return responseErrorToData(error as Error);
  }
};
