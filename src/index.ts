import { IApi } from 'umi-types';
import { PluginDvaConnectOptions } from './types';

import DvaTypesGenerator from './generator';
import ModelPaths from './modelPaths';

export * from './modelTypes';
export * from './types';

export default function pluginDvaConnect(api: IApi, options: PluginDvaConnectOptions = {}) {
  const generator = new DvaTypesGenerator(api);
  const modelPaths = new ModelPaths(api.paths.absSrcPath, options.singular);

  api.onDevCompileDone(regenDvaTypes);

  api.onOptionChange(async (nextOptions: PluginDvaConnectOptions = {}) => {
    Object.assign(options, nextOptions);
    if (await modelPaths.setSingular(options.singular)) {
      regenDvaTypes();
    }
  });

  api.addUmiExports([
    {
      exportAll: true,
      source: 'umi-plugin-dva-connect/lib/model-types',
    },
  ]);

  async function regenDvaTypes() {
    generator.updateModelsPaths(modelPaths.paths);
  }
}
