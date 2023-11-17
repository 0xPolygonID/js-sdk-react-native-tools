import {
  CircuitData,
  IDataSource,
  // bytesToBase64,
  // base64ToBytes,
  // CircuitId,
  // byteEncoder,
  // byteDecoder,
  // bytesToHex,
  // hexToBytes
} from '@0xpolygonid/js-sdk';
import {appStorage, storage} from './store';
// import { Base64 } from "js-base64";

// function base64ToArrayBuffer(base64) {
//   // var binaryString = atob(base64);
//   var binaryString = base64;
//   var bytes = new Uint8Array(binaryString.length);
//   for (var i = 0; i < binaryString.length; i++) {
//     bytes[i] = binaryString.charCodeAt(i);
//   }
//   return bytes.buffer;
// }
//
// function arrayBufferToBase64( buffer ) {
//   var binary = '';
//   var bytes = new Uint8Array( buffer );
//   var len = bytes.byteLength;
//   for (var i = 0; i < len; i++) {
//     binary += String.fromCharCode( bytes[ i ] );
//   }
//   return binary;
//   // return btoa( binary );
// }
export class AppCircuitsDataSource<Type> implements IDataSource<Type> {
  constructor(private _appStorageKey: string) {
    this.init().then();
  }

  async init() {
    // const data = await appStorage.getItem(this._appStorageKey);
    // if (!data) {
    //   await appStorage.setItem(this._appStorageKey, JSON.stringify([]));
    // }
  }

  async save(key: string, value: Type, keyName = 'id'): Promise<void> {
    // const dataToSave = {...mapToValue, [keyName]: key};
    console.log({key, keyName});
    // console.log(dataToSave);
    // console.log(value);

    const promises = Object.keys(value as CircuitData).map(circuitKey => {
      const storeKey = [this._appStorageKey, key, circuitKey].join('_');
      console.log('storeKey');
      console.log(storeKey);
      // @ts-ignore
      // const data = Base64.fromUint8Array(value[circuitKey] as Uint8Array);
      // const data = arrayBufferToBase64(value[circuitKey] as Uint8Array); //best
      // const data = new TextDecoder().decode(value[circuitKey] as Uint8Array);
      // const data = Buffer.from(value[circuitKey] as Uint8Array).toString();
      // const data = (value[circuitKey] as Uint8Array).toString(); // work
      let data = value[circuitKey];
      if (circuitKey !== 'circuitId') {
        // data = arrayBufferToBase64(value[circuitKey] as Uint8Array); //best
        // data = bytesToBase64(value[circuitKey] as Uint8Array); // work perf
        // data = bytesToHex(value[circuitKey] as Uint8Array); //
        // data = byteDecoder.decode(value[circuitKey] as Uint8Array);
        // data = (value[circuitKey] as Uint8Array).toString();
      }
      // const data = value[circuitKey]; // work
      // console.log(data);
      // Buffer.from()
      // const data2 = JSON.stringify(value[circuitKey] as Uint8Array);
      storage.set(storeKey, data);
      // console.log(data2.length);

      // console.log(data);
      // return appStorage.setItem(storeKey, data);
    });

    await Promise.all(promises);
    return;
  }

  async get(key: string, keyName = 'id'): Promise<Type | undefined> {
    // const storeKey = [this._appStorageKey, key, keyName].join('_');
    console.log({key, keyName});
    // const keys = await AsyncStorage.getAllKeys();
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

  // need to check
  async load(): Promise<Type[]> {
    const data = await appStorage.getItem(this._appStorageKey);
    // const keys = await AsyncStorage.getAllKeys();
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
