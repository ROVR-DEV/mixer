export const responseToBlobData = async (res: Response) => ({
  data: new Blob([await res.arrayBuffer()], {
    type: res.headers.get('content-type') ?? '',
  }),
  error: undefined,
});

export const responseToJsonData = async (res: Response) => ({
  data: await res.json(),
  error: undefined,
});

export const responseErrorToData = async (error: Error) => ({
  data: undefined,
  error: error,
});
