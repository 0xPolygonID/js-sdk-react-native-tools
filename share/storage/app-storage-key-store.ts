import {AbstractPrivateKeyStore} from '@0xpolygonid/js-sdk';
import {appStorage} from './store';

export class AppStoragePrivateKeyStore implements AbstractPrivateKeyStore {
  static readonly storageKey = 'keystore';

  async get(args: {alias: string}): Promise<string> {
    console.log('AppStoragePrivateKeyStore get');
    const dataStr = await appStorage.getItem(
      AppStoragePrivateKeyStore.storageKey,
    );
    if (!dataStr) {
      throw new Error('no key under given alias');
    }
    const data = JSON.parse(dataStr);
    const privateKey = data.find((d: {id: string}) => d.id === args.alias);
    if (!privateKey) {
      throw new Error('no key under given alias');
    }
    return privateKey.value;
  }

  async importKey(args: {alias: string; key: string}): Promise<void> {
    console.log('AppStoragePrivateKeyStore importKey');

    const dataStr = await appStorage.getItem(
      AppStoragePrivateKeyStore.storageKey,
    );
    let data = [];
    if (dataStr) {
      data = JSON.parse(dataStr);
    }

    const index = data.findIndex((d: { id: string }) => d.id === args.alias);
    if (index > -1) {
      data[index].value = args.key;
    } else {
      data.push({ id: args.alias, value: args.key });
    }

    await appStorage.setItem(
      AppStoragePrivateKeyStore.storageKey,
      JSON.stringify(data),
    );
  }
}
