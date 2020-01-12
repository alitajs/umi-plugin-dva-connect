import { join } from 'path';
import { IConfig } from 'umi-types';

export default {
  routes: [{ path: '/', component: './index' }],
  plugins: ['umi-plugin-dva', join(__dirname, '..', require('../package').main || 'index.js')],
} as IConfig;
