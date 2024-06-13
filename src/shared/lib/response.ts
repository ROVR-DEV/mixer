export const responseToBlobData = async (res: Response) => ({
  data: new Blob([await res.arrayBuffer()], {
    type: res.headers.get('content-type') ?? '',
  }),
  error: undefined,
});

export const responseToJsonData = async (res: Response) => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: (await res.json()) as unknown as any,
  error: undefined,
});

export const responseErrorToData = async (error: Error) => ({
  data: undefined,
  error: error,
});
