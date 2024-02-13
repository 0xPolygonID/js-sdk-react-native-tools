import {core} from '@0xpolygonid/js-sdk';
import {ProvingMethod, ZKProof, ProvingMethodAlg} from '@iden3/js-jwz';
import {newHashFromString, Hash} from '@iden3/js-merkletree';
import {reactNativeGroth16Prover} from './prove';
import {verifyGroth16} from './verify';

const Id = core.Id;

export interface AuthV2PubSignals {
  userID: core.Id;
  challenge: bigint;
  GISTRoot: Hash;
}

export class ProvingMethodGroth16AuthV2 implements ProvingMethod {
  constructor(
    public readonly methodAlg: ProvingMethodAlg,
    public witnessCalculator: Function,
  ) {}

  get alg(): string {
    return this.methodAlg.alg;
  }

  get circuitId(): string {
    return this.methodAlg.circuitId;
  }

  async verify(
    messageHash: Uint8Array,
    proof: ZKProof,
    verificationKey: Uint8Array,
  ): Promise<boolean> {
    const verificationResult = await verifyGroth16<AuthV2PubSignals>(
      messageHash,
      proof,
      verificationKey,
      this.unmarshall,
    );
    return verificationResult;
  }

  async prove(
    inputs: Uint8Array,
    provingKey: Uint8Array,
    wasm: Uint8Array,
  ): Promise<ZKProof> {
    const zkProof = await reactNativeGroth16Prover(
      inputs,
      provingKey,
      wasm,
      this.witnessCalculator,
    );

    return zkProof;
  }

  unmarshall(pubSignals: string[]): AuthV2PubSignals {
    const len = 3;

    if (pubSignals.length !== len) {
      throw new Error(
        `invalid number of Output values expected ${len} got ${pubSignals.length}`,
      );
    }

    return {
      userID: Id.fromBigInt(BigInt(pubSignals[0])),
      challenge: BigInt(pubSignals[1]),
      GISTRoot: newHashFromString(pubSignals[2]),
    };
  }
}
