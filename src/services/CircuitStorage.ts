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

        const data = await this.instanceCS.loadCircuitData(
            CircuitId.AuthV2,
        );
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
    const auth_w = customFetch('/AuthV2/circuit.wasm');
    const mtp_w = customFetch(
        '/credentialAtomicQueryMTPV2/circuit.wasm',
    );
    const sig_w = customFetch(
      '/credentialAtomicQuerySigV2/circuit.wasm',
    );
    const auth_z = customFetch('/AuthV2/circuit_final.zkey');
    const mtp_z = customFetch(
        '/credentialAtomicQueryMTPV2/circuit_final.zkey',
    );
    const sig_z = customFetch(
      '/credentialAtomicQuerySigV2/circuit_final.zkey',
    );

    const auth_j = customFetch('/AuthV2/verification_key.json');
    const mtp_j = customFetch(
        '/credentialAtomicQueryMTPV2/verification_key.json',
    );
    const sig_j = customFetch(
      '/credentialAtomicQuerySigV2/verification_key.json',
    );

    return Promise.all([auth_w, mtp_w, sig_w, auth_z, mtp_z, sig_z, auth_j, mtp_j,sig_j ]).then( async ([auth_w, mtp_w, sig_w, auth_z, mtp_z, sig_z, auth_j, mtp_j,sig_j ]) => {
      await this.instanceCS.saveCircuitData(CircuitId.AuthV2, {
        circuitId: 'authV2'.toString(),
        wasm: auth_w,
        provingKey: auth_z,
        verificationKey: auth_j,
      });
      await this.instanceCS.saveCircuitData(CircuitId.AtomicQueryMTPV2, {
        circuitId: 'credentialAtomicQueryMTPV2'.toString(),
        wasm: mtp_w,
        provingKey: mtp_z,
        verificationKey: mtp_j,
      });
      await this.instanceCS.saveCircuitData(CircuitId.AtomicQuerySigV2, {
        circuitId: 'credentialAtomicQuerySigV2'.toString(),
        wasm: sig_w,
        provingKey: sig_z,
        verificationKey: sig_j,
      });
      console.timeEnd('CircuitStorageInstance.init');

    })

    // const auth_w = await customFetch('/AuthV2/circuit.wasm');
    // const mtp_w = await customFetch(
    //     '/credentialAtomicQueryMTPV2/circuit.wasm',
    // );
    // const sig_w = await customFetch(
    //   '/credentialAtomicQuerySigV2/circuit.wasm',
    // );

    // const auth_z = await customFetch('/AuthV2/circuit_final.zkey');
    // const mtp_z = await customFetch(
    //     '/credentialAtomicQueryMTPV2/circuit_final.zkey',
    // );
    // const sig_z = await customFetch(
    //   '/credentialAtomicQuerySigV2/circuit_final.zkey',
    // );

    // const auth_j = await customFetch('/AuthV2/verification_key.json');
    // const mtp_j = await customFetch(
    //     '/credentialAtomicQueryMTPV2/verification_key.json',
    // );
    // const sig_j = await customFetch(
    //   '/credentialAtomicQuerySigV2/verification_key.json',
    // );
    // console.timeEnd('CircuitStorageInstance.init');
    // this.instanceCS = new CircuitStorage(new InMemoryDataSource());
    // console.time('CircuitStorageInstance.saveCircuitData');

    // await this.instanceCS.saveCircuitData(CircuitId.AuthV2, {
    //   circuitId: 'authV2'.toString(),
    //   ...circuitDataTmp,
    // });
    // await this.instanceCS.saveCircuitData(CircuitId.AtomicQueryMTPV2, {
    //   circuitId: 'credentialAtomicQueryMTPV2'.toString(),
    //   ...circuitDataTmp,
    // });
    // await this.instanceCS.saveCircuitData(CircuitId.AtomicQuerySigV2, {
    //   circuitId: 'credentialAtomicQuerySigV2'.toString(),
    //   ...circuitDataTmp,
    // });
    // await this.instanceCS.saveCircuitData(CircuitId.AuthV2, {
    //   circuitId: 'authV2'.toString(),
    //   wasm: auth_w,
    //   provingKey: auth_z,
    //   verificationKey: auth_j,
    // });
    // await this.instanceCS.saveCircuitData(CircuitId.AtomicQueryMTPV2, {
    //   circuitId: 'credentialAtomicQueryMTPV2'.toString(),
    //   wasm: mtp_w,
    //   provingKey: mtp_z,
    //   verificationKey: mtp_j,
    // });
    // await this.instanceCS.saveCircuitData(CircuitId.AtomicQuerySigV2, {
    //   circuitId: 'credentialAtomicQuerySigV2'.toString(),
    //   wasm: sig_w,
    //   provingKey: sig_z,
    //   verificationKey: sig_j,
    // });
    console.timeEnd('CircuitStorageInstance.saveCircuitData');
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
