import { writeFile } from 'fs';
import { basename, dirname, join, relative } from 'path';
import { IApi } from 'umi-types';
import { promisify } from 'util';

import findDvaModels from './findDvaModels';
import { types as TargetRelativePath } from '../package.json';
import { PluginDvaConnectOptions } from './types';

const fsWriteFile = promisify(writeFile);

export default class DvaTypesGenerator {
  static TargetAbsolutePath: string = join(__dirname, '..', TargetRelativePath);

  private static ModelSymbolPrefix: string = 'Model';

  private static EndLine: string = process.platform === 'win32' ? '\r\n' : '\n';

  private api: IApi;

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
    const endl = DvaTypesGenerator.EndLine;

    /** update models paths */
    this.paths = await findDvaModels(this.api.paths.absSrcPath, options.singular);
    this.paths = [...new Set(this.paths)].sort();

    /** check paths changed or not */
    if (previousPaths.length === this.paths.length)
      if (!this.paths.some(path => !previousPaths.includes(path))) {
        this.generateTask = null;
        return false;
      }

    const codes = this.generateTypes();

    /** write types into target file */
    if (codes) {
      const fileContent = `\
import { PickDvaModelState } from './utils';${endl}${endl}\
${codes.imports}${endl}${endl}\
${codes.mergedStates}${endl}${endl}\
${codes.exportModelStates}${endl}${endl}\
export interface DvaState extends MergedStates {\
${options.loading ? `${endl}  loading: DvaLoading;${endl}` : ''}\
}${endl}\
`;
      await fsWriteFile(DvaTypesGenerator.TargetAbsolutePath, fileContent, 'utf8');
    }

    this.generateTask = null;
    return true;
  }

  private generateTypes() {
    const endl = DvaTypesGenerator.EndLine;
    const modelSymbolMap = this.getModelSymbolMap();
    const modelSymbols = Object.keys(modelSymbolMap);

    if (!modelSymbols.length) return false;

    const imports = modelSymbols
      .map(symbol => `import ${symbol} from '${this.api.winPath(modelSymbolMap[symbol])}';`)
      .join(endl);

    const exportModelStates = `\
export {${endl}\
  ${modelSymbols.join(','.concat(endl, '  '))},${endl}\
};\
`;

    const mergedStates = `\
interface MergedStates${endl}\
  extends PickDvaModelState<\
${modelSymbols.join('>,'.concat(endl, '    PickDvaModelState<'))}\
> {}${endl}${endl}\
interface DvaLoading {${endl}\
  global: boolean;${endl}\
  effects: { [Key: string]: boolean | undefined };${endl}\
  models: { [Key in keyof MergedStates]?: boolean };${endl}\
}\
`;

    return { imports, exportModelStates, mergedStates };
  }

  /**
   * @returns map the symbols of model files to their absolute paths.
   */
  private getModelSymbolMap(): Record<string, string> {
    const symbolMap: Record<string, string> = {
      [DvaTypesGenerator.ModelSymbolPrefix]: 'place-holder',
    };

    this.paths.forEach(path => {
      let parent: string = path.replace(/.ts$/, '');
      let symbol: string = DvaTypesGenerator.ModelSymbolPrefix;

      while (symbol in symbolMap) {
        symbol = `${pascalcaseBasename(parent)}${symbol}`;

        /** duplicate model symbol */
        if (!relative(path, dirname(path))) {
          symbol = ''.concat(
            DvaTypesGenerator.ModelSymbolPrefix,
            symbol.concat(firstLetterToUpperCase(randomString())),
          );

          this.api.log.warn(`\
[PluginDvaConnect] duplicate model symbol found, replace with random symbol '${symbol}'.
    (${path})\
`);
          break;
        }

        /** get parent directory path  */
        parent = dirname(parent);
      }

      symbolMap[symbol] = path.replace(/.ts$/, '');
    });

    delete symbolMap[DvaTypesGenerator.ModelSymbolPrefix];
    return symbolMap;
  }
}

function pascalcaseBasename(path: string): string {
  return basename(path)
    .split(/[^0-9a-zA-Z$_]/)
    .filter(part => !!part)
    .map(part => firstLetterToUpperCase(part))
    .join('');
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
