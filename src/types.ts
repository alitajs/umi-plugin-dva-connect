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

export interface UmiInternalRoute {
  component?: string;
  routes?: UmiInternalRoute[];
}
