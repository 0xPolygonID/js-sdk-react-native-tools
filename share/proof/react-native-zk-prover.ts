import {CircuitId, ICircuitStorage, IZKProver} from '@0xpolygonid/js-sdk';
import {ZKProof} from '@iden3/js-jwz';
import {reactNativeGroth16Prover} from './prove';
import {reactNativeGroth16Verify} from './verify';

export class ReactNativeZKProver implements IZKProver {
  constructor(
    private readonly _circuitStorage: ICircuitStorage,
    public witnessCalculator: Function,
  ) {}

  async verify(zkp: ZKProof, circuitId: any): Promise<boolean> {
    try {
      const circuitData = await this._circuitStorage.loadCircuitData(circuitId);

      if (!circuitData.verificationKey) {
        throw new Error(
          `verification file doesn't exist for circuit ${circuitId}`,
        );
      }

      const res = await reactNativeGroth16Verify(
        zkp.pub_signals,
        zkp.proof,
        circuitData.verificationKey,
      );
      return res;
    } catch (e) {
      return false;
    }
  }

  async generate(inputs: Uint8Array, circuitId: CircuitId): Promise<ZKProof> {
    const circuitData = await this._circuitStorage.loadCircuitData(circuitId);
    if (!circuitData.wasm) {
      throw new Error(`wasm file doesn't exist for circuit ${circuitId}`);
    }

    const zkProof = await reactNativeGroth16Prover(
      inputs,
      circuitData.provingKey as Uint8Array,
      circuitData.wasm,
      this.witnessCalculator,
    );
    return zkProof;
  }
}
