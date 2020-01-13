import { basename, dirname, relative } from 'path';
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
      if (!this.paths.some(path => !previousPaths.includes(path))) {
        this.generateTask = null;
        return false;
      }

    this.generateModelsImports(); // TODO

    this.generateTask = null;
    return true;
  }

  private generateModelsImports() {
    const symbolMap = this.getModelSymbolMap();
    return Object.entries(symbolMap)
      .map(([symbol, path]) => `import Model${symbol} from '${path}';`)
      .join('\r\n');
  }

  /**
   * @returns map the symbols of model files to their absolute paths.
   */
  private getModelSymbolMap(): Record<string, string> {
    const symbolMap: Record<string, string> = {};
    this.paths.forEach(path => {
      let symbol: string = '';
      let parent: string = path;

      while (!symbol || symbol in symbolMap) {
        symbol = `${firstLetterToUpperCase(basename(parent))}${symbol}`;

        /** duplicate model symbol */
        if (!relative(path, dirname(path))) {
          symbol = firstLetterToUpperCase(randomString());
          this.api.log.warn(`\
[PluginDvaConnect] duplicate model symbol found, replace with random symbol '${symbol}'.
    (${path})\
`);
          break;
        }

        /** get parent directory path  */
        parent = dirname(parent);
      }

      symbolMap[symbol] = path;
    });

    return symbolMap;
  }
}

/**
 * @returns random string with fixed length (10).
 */
function randomString() {
  return Math.random()
    .toString(36)
    .slice(2, 12)
    .padEnd(10, '0');
}

function firstLetterToUpperCase(word: string) {
  if (!word.length) return word;
  return `${word[0].toUpperCase()}${word.slice(1)}`;
}
