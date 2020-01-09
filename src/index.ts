import { IApi } from 'umi-types';
// import { PluginDvaConnectOptions } from './types';

export * from './model-types';
export * from './types';

export default function pluginDvaConnect(api: IApi) {
  api.addUmiExports([
    {
      exportAll: true,
      source: 'umi-plugin-dva-connect/lib/model-types',
    },
  ]);
}
