import { IApi } from 'umi-types';

export default class DvaTypesGenerator {
  umi: IApi;

  protected constructor(api: IApi) {
    this.umi = api;
  }
}
