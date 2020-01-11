import { IApi } from 'umi-types';

export default class DvaTypesGenerator {
  api: IApi;

  paths: Set<string> = new Set();

  private generating: boolean = false;

  constructor(api: IApi) {
    this.api = api;
  }

  setModelsPaths(paths: string[] | Set<string>) {
    if (this.generating) return;
    this.paths = new Set(paths);
  }
}
