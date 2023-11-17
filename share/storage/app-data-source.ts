import {IDataSource} from '@0xpolygonid/js-sdk';
import {appStorage} from './store';
export class AppDataSource<Type> implements IDataSource<Type> {
  constructor(private _appStorageKey: string) {
    this.init().then();
  }

  async init() {
    const data = await appStorage.getItem(this._appStorageKey);
    if (!data) {
      await appStorage.setItem(this._appStorageKey, JSON.stringify([]));
    }
  }

  async save(key: string, value: Type, keyName = 'id'): Promise<void> {
    console.log("AppDataSource save", this._appStorageKey, key, keyName);
    if (appStorage) {
      const data = await appStorage.getItem(this._appStorageKey);
      const items = JSON.parse(data) || [];
      const itemIndex = items.findIndex(
        (i: {[x: string]: string}) => i[keyName] === key,
      );
      if (itemIndex === -1) {
        items.push(value);
      } else {
        items[itemIndex] = value;
      }
      await appStorage.setItem(this._appStorageKey, JSON.stringify(items));
    }
  }

  async get(key: string, keyName = 'id'): Promise<Type | undefined> {
    console.log('AppDataSource get: ', {key, keyName});
    const data = await appStorage.getItem(this._appStorageKey);
    const parsedData = data ? (JSON.parse(data) as Type[]) : [];
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return parsedData.find(t => t[keyName] === key);
  }

  async load(): Promise<Type[]> {
    console.log('AppDataSource load');

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
