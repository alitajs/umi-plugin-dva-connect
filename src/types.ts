export interface PluginDvaConnectOptions {
  /**
   * `dva-loading` enabled or not.
   * @default
   * true
   */
  loading?: boolean;
}

export type PickDvaModelState<T> = T extends { namespace: infer U; state: infer V }
  ? { [Key in U & string]: V }
  : never;
