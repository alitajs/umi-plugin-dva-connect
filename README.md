# umi-plugin-dva-connect

[![NPM version](https://img.shields.io/npm/v/umi-plugin-dva-connect.svg?style=flat)](https://npmjs.org/package/umi-plugin-dva-connect) [![NPM downloads](http://img.shields.io/npm/dm/umi-plugin-dva-connect.svg?style=flat)](https://npmjs.org/package/umi-plugin-dva-connect)

generate types definitions of dvajs models automatically

## Install

```bash
# or yarn
$ npm install
```

```bash
$ npm run build --watch
$ npm run start
```

## Usage

Configure in `.umirc.js`,

```js
export default {
  plugins: [['umi-plugin-dva-connect', options]],
};
```

### Model

#### with `as const`

```ts
const exampleModel = {
  namespace: 'example',
  state: {
    count: 0,
  },
} as const;

export default exampleModel;
```

#### with `interface`

```ts
interface ExampleModel = {
  namespace: 'example';
  state: {
    count: number;
  },
};

const exampleModel: ExampleModel = {
  namespace: 'example',
  state: {
    count: 0,
  },
};

export default exampleModel;
```

### Import from plugin

```ts
import { DvaState } from 'umi-plugin-dva-connect';
```

## Options

```ts
interface PluginDvaConnectOptions {
  /**
   * `dva-loading` enabled or not.
   * @default
   * true
   */
  loading?: boolean;
  /**
   * name directory in singular.
   * @default
   * false
   */
  singular?: boolean;
}
```

## LICENSE

MIT
