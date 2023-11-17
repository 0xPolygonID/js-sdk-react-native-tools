import {core} from '@0xpolygonid/js-sdk';
import {ProvingMethod, ZKProof, ProvingMethodAlg, proving} from '@iden3/js-jwz';
import {newHashFromString, Hash} from '@iden3/js-merkletree';
import {reactNativeProve} from './prove';

// // AuthV2PubSignals auth.circom public signals
const Id = core.Id;

export interface AuthV2PubSignals {
  userID: core.Id;
  challenge: bigint;
  GISTRoot: Hash;
}

export class ProvingMethodGroth16AuthV2 implements ProvingMethod {
  // private static readonly curveName = 'bn128';

  constructor(public readonly methodAlg: ProvingMethodAlg, public witnessCalculator: Function) {
    console.log('ProvingMethodGroth16AuthV2 sss');
  }

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
    return true;
    // const verificationResult = await verify<AuthV2PubSignals>(
    //   messageHash,
    //   proof,
    //   verificationKey,
    //   this.unmarshall,
    // );
    // // await this.terminateCurve();
    //
    // return verificationResult;
  }

  async prove(
    inputs: Uint8Array,
    provingKey: Uint8Array,
    wasm: Uint8Array,
  ): Promise<ZKProof> {
    const zkProof = await reactNativeProve(inputs, provingKey, wasm, this.witnessCalculator);

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

// export const provingMethodGroth16AuthV2Instance: ProvingMethod =
//   new ProvingMethodGroth16AuthV2(
//     new ProvingMethodAlg(
//       proving.provingMethodGroth16AuthV2Instance.alg,
//       proving.provingMethodGroth16AuthV2Instance.circuitId,
//     ),
//   );
