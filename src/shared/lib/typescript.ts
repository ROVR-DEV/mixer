export type DropFirstParameter<T extends unknown[]> = T extends [
  unknown,
  ...infer U,
]
  ? U
  : never;
