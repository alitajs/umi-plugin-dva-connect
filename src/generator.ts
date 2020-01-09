import { IApi } from 'umi-types';

export default class DvaTypesGenerator {
  api: IApi;

  paths: Set<string> = new Set();

  constructor(api: IApi) {
    this.api = api;
  }

  updateModelsPaths(paths: string[] | Set<string>) {
    this.paths = new Set(paths);
  }
}
