import {
  CircuitId,
  ICircuitStorage,
  IZKProver,
} from '@0xpolygonid/js-sdk';
import {ZKProof} from '@iden3/js-jwz';
import {reactNativeProve} from './prove';

export class ReactNativeZKProver implements IZKProver {
  private static readonly curveName = 'bn128';

  constructor(private readonly _circuitStorage: ICircuitStorage, public witnessCalculator: Function) {}

  async verify(zkp: any, circuitId: any): Promise<boolean> {
    try {
      const circuitData = await this._circuitStorage.loadCircuitData(circuitId);

      if (!circuitData.verificationKey) {
        throw new Error(
          `verification file doesn't exist for circuit ${circuitId}`,
        );
      }

      // await snarkjs.groth16.verify(
      //   JSON.parse(byteDecoder.decode(circuitData.verificationKey)),
      //   zkp.pub_signals,
      //   zkp.proof
      // );
      //
      // // we need to terminate curve manually
      // await this.terminateCurve();
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async generate(inputs: Uint8Array, circuitId: CircuitId): Promise<ZKProof> {
    console.log('ReactNativeZKProver generate proof');
    const circuitData = await this._circuitStorage.loadCircuitData(circuitId);
    if (!circuitData.wasm) {
      throw new Error(`wasm file doesn't exist for circuit ${circuitId}`);
    }

    const zkProof = await reactNativeProve(
      inputs,
      circuitData.provingKey as Uint8Array,
      circuitData.wasm,
      this.witnessCalculator
    );
    return zkProof;
    // return {
    //   proof,
    //   pub_signals: publicSignals,
    // };
  }
}
