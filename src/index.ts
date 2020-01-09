import { IApi } from 'umi-types';
// import { PluginDvaConnectOptions } from './types';

export * from './modelTypes';
export * from './types';

export default function pluginDvaConnect(api: IApi) {
  api.addUmiExports([
    {
      exportAll: true,
      source: 'umi-plugin-dva-connect/lib/model-types',
    },
  ]);
}
