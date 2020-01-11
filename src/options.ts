import { PluginDvaConnectOptions as OptionsType } from './types';

const DefaultPluginDvaConnectOptions: OptionsType = {
  loading: true,
  singular: false,
};

type OptionObservers = {
  [T in keyof OptionsType]?: (next: OptionsType[T], prev: OptionsType[T]) => void;
};

export default function createOptions(
  options: OptionsType = { ...DefaultPluginDvaConnectOptions },
  observers: OptionObservers = {},
) {
  return new Proxy(options, {
    set<T extends keyof OptionsType>(target: OptionsType, property: T, nextValue: OptionsType[T]) {
      if (target[property] !== nextValue) {
        const oldValue = target[property];
        Reflect.set(target, property, nextValue);
        observers[property]?.(nextValue, oldValue);
      }
      return true;
    },
  });
}
