import { IApi } from 'umi-types';
import { PluginDvaConnectOptions as OptionsType } from './types';

import DvaTypesGenerator from './generator';
import createOptions from './options';

export * from './modelTypes';
export * from './types';

export default function pluginDvaConnect(api: IApi, initialOptions: OptionsType = {}) {
  const generator = new DvaTypesGenerator(api);

  const options = createOptions(initialOptions, {
    // async loading(next) {},
    // async singular(next) {},
  });

  api.onDevCompileDone(regenerateDvaTypes);

  api.onGenerateFiles(regenerateDvaTypes);

  api.onOptionChange((nextOptions: OptionsType = {}) => Object.assign(options, nextOptions));

  api.addUmiExports([
    {
      exportAll: true,
      source: 'umi-plugin-dva-connect/lib/model-types',
    },
  ]);

  function regenerateDvaTypes() {
    generator.setModelsPaths([]);
  }
}
