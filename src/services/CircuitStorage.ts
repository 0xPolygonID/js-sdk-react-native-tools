import {CircuitId, CircuitStorage} from '@0xpolygonid/js-sdk';
import {AppCircuitsDataSource} from '../../share/storage';

export class CircuitStorageInstance {
  private static instanceCS: CircuitStorage;
  static baseUrl: string;

  static customFetch = async (url: string) => {
    const u = `${this.baseUrl}${url}`;
    console.log(u);
    return fetch(u)
      .then(response => {
        return response.arrayBuffer();
      })
      .then(buffer => new Uint8Array(buffer));
  };

  static checkCircuits = async (): Promise<boolean> => {
    if (this.instanceCS) {
      try {
        const data = await this.instanceCS.loadCircuitData(CircuitId.AuthV2);
        return true;
      } catch (e) {
        console.log('No data in storage');
        return false;
      }
    } else {
      console.log('Not inited CircuitStorageInstance');
      return false;
    }
  };
  static loadCircuits = async () => {
    console.log('loading circuits');
    console.time('CircuitStorageInstance.init');
    const customFetch = CircuitStorageInstance.customFetch;
    const auth_w = customFetch('/authV3-8-32/circuit.wasm');
    const auth_z = customFetch('/authV3-8-32/circuit_final.zkey');
    const v3_z = customFetch('/credentialAtomicQueryV3/circuit_final.zkey');
    const v3_w = customFetch('/credentialAtomicQueryV3/circuit.wasm');

    const auth_v = customFetch('/authV3-8-32/verification_key.json');
    const v3_v = customFetch(
      '/credentialAtomicQueryV3/verification_key.json',
    );
   
    return Promise.all([
      auth_w,
      v3_w,
      auth_z,
      v3_z,
      auth_v,
      v3_v,
    ]).then(
      async ([
         auth_w,
          v3_w,
          auth_z,
          v3_z,
          auth_v,
          v3_v,
      ]) => {
        await this.instanceCS.saveCircuitData(CircuitId.AuthV2, {
          circuitId: 'authV2'.toString(),
          wasm: auth_w,
          provingKey: auth_z,
          verificationKey: auth_v,
        });
        await this.instanceCS.saveCircuitData(CircuitId.AtomicQueryV3Stable, {
          circuitId: 'credentialAtomicQueryV3Stable'.toString(),
          wasm: v3_w,
          provingKey: v3_z,
          verificationKey: v3_v,
        });

        console.timeEnd('CircuitStorageInstance.init');
      },
    );
  };
  static async init(baseUrl: string) {
    this.baseUrl = baseUrl;

    if (!this.instanceCS) {
      this.instanceCS = new CircuitStorage(
        new AppCircuitsDataSource('circuits'),
      );
    } else {
      console.log('present CircuitStorageInstance');
    }
  }

  static getCircuitStorageInstance() {
    return this.instanceCS;
  }
}
