import { IApi } from 'umi-types';

import findDvaModels from './findDvaModels';
import { PluginDvaConnectOptions } from './types';

export default class DvaTypesGenerator {
  api: IApi;

  private paths: string[] = [];

  private generateTask: ReturnType<
    InstanceType<typeof DvaTypesGenerator>['generate']
  > | null = null;

  constructor(api: IApi) {
    this.api = api;
  }

  generate(options: Required<PluginDvaConnectOptions>): Promise<boolean> {
    this.generateTask = this.generateTask ?? this.createGenerateTask(options);
    return this.generateTask;
  }

  private async createGenerateTask(options: Required<PluginDvaConnectOptions>): Promise<boolean> {
    const previousPaths = this.paths;

    /** update models paths */
    this.paths = await findDvaModels(this.api.paths.absSrcPath, options.singular);
    this.paths = [...new Set(this.paths)].sort();

    /** check paths changed or not */
    if (previousPaths.length === this.paths.length)
      if (!this.paths.some(path => !previousPaths.includes(path))) return false;
    return true;
  }
}
