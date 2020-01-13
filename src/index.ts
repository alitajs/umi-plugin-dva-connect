import { IApi } from 'umi-types';

import DvaTypesGenerator from './generator';
import { PluginDvaConnectOptions as OptionsType } from './types';

const DefaultPluginDvaConnectOptions: Required<OptionsType> = {
  loading: true,
  singular: false,
};

export * from './types';

export default function pluginDvaConnect(api: IApi, initialOptions: OptionsType = {}) {
  const generator = new DvaTypesGenerator(api);

  const options: Required<OptionsType> = {
    ...DefaultPluginDvaConnectOptions,
    ...initialOptions,
  };

  // api.onDevCompileDone(() => generator.generate(options));

  api.onGenerateFiles(() => generator.generate(options));

  api.onOptionChange((nextOptions: OptionsType = {}) => {
    generator.generate(Object.assign(options, nextOptions));
  });

  api.addUmiExports([
    {
      exportAll: true,
      source: 'umi-plugin-dva-connect/fixtures/index',
    },
    {
      specifiers: [], // TODO
      source: 'umi-plugin-dva-connect/fixtures/mock',
    },
  ]);
}
