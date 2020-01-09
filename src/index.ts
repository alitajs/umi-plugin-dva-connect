import { IApi } from 'umi-types';
// import { PluginDvaConnectOptions } from './types';

export * from './types';

export default function pluginDvaConnect(api: IApi) {
  api.addUmiExports([{ exportAll: true, source: './pluginDvaConnect' }]);
}
