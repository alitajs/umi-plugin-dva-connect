export interface PluginDvaConnectOptions {
  /**
   * `dva-loading` enabled or not.
   * @default
   * true
   */
  loading?: boolean;
  /**
   * name directory in singular.
   * @default
   * false
   */
  singular?: boolean;
}

export type PickDvaModelState<T> = T extends { namespace: infer U; state: infer V }
  ? { [Key in U & string]: V }
  : never;

export interface UmiInternalRoute {
  component?: string;
  routes?: UmiInternalRoute[];
}
