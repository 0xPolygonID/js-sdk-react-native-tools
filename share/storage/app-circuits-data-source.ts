import {CircuitData, IDataSource} from '@0xpolygonid/js-sdk';
import {appStorage, storage} from './store';

export class AppCircuitsDataSource<Type> implements IDataSource<Type> {
  constructor(private _appStorageKey: string) {}

  async save(key: string, value: Type, keyName = 'id'): Promise<void> {
    console.log({key, keyName});

    const promises = Object.keys(value as CircuitData).map(circuitKey => {
      const storeKey = [this._appStorageKey, key, circuitKey].join('_');
      console.log(storeKey);
      // @ts-ignore
      let data = value[circuitKey];

      storage.set(storeKey, data);
    });

    await Promise.all(promises);
    return;
  }

  async get(key: string, keyName = 'id'): Promise<Type | undefined> {
    console.log({key, keyName});
    const keys = storage.getAllKeys();
    const needKeys = keys.filter(inKey => inKey.includes(key));
    if (!needKeys.length) {
      throw Error(' key ' + keys + 'not found');
    }
    const promises = needKeys.map(async inKey => {
      const [keyName] = inKey.split('_').reverse();
      let value = null;
      if (keyName !== 'circuitId') {
        value = storage.getBuffer(inKey);
      } else {
        value = storage.getString(inKey);
      }

      if (!value) {
        throw Error(' key ' + inKey + 'not found');
      }
      let data = value;
      return {
        [keyName]: data,
      };
    });
    const result = await Promise.all(promises);
    const finish = result.reduce((acc, result) => {
      let [[key, val]] = Object.entries(result);
      acc[key] = val;
      return acc;
    }, {});
    return finish as Type;
  }

  async load(): Promise<Type[]> {
    const data = await appStorage.getItem(this._appStorageKey);
    return data && JSON.parse(data);
  }

  async delete(key: string, keyName = 'id'): Promise<void> {
    const dataStr = await appStorage.getItem(this._appStorageKey);
    const data = JSON.parse(dataStr) as Type[];
    // @ts-ignore
    const items = data.filter(i => i[keyName] !== key);
    if (data.length === items.length) {
      throw new Error(`Error to delete: ${key}`);
    }
    await appStorage.setItem(this._appStorageKey, JSON.stringify(items));
  }
}
