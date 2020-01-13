export type PickDvaModelState<T> = T extends { namespace: infer U; state: infer V }
  ? { [Key in U & string]: V }
  : never;
