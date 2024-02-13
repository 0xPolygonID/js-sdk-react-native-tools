import {NativeModules} from 'react-native';
import {byteDecoder} from '@0xpolygonid/js-sdk';
import {ProofData, ZKProof} from '@iden3/js-jwz';
import {fromBigEndian} from '@iden3/js-iden3-core';

const rapidsnark = NativeModules.Rapidsnark;

export const reactNativeGroth16Verify = async (
  pub_signals: string[],
  proof: ProofData,
  verificationKey: Uint8Array,
) => {
  try {
    return await rapidsnark.groth16_verify(
      JSON.stringify(pub_signals),
      JSON.stringify(proof),
      byteDecoder.decode(verificationKey),
    );
  } catch (e: any) {
    console.log(e.message);
    return false;
  }
};

export async function verifyGroth16<T extends {challenge: bigint}>(
  messageHash: Uint8Array,
  proof: ZKProof,
  verificationKey: Uint8Array,
  unmarshall: (pubSignals: string[]) => T,
): Promise<boolean> {
  const outputs: T = unmarshall(proof.pub_signals);
  if (outputs.challenge !== fromBigEndian(messageHash)) {
    throw new Error('challenge is not equal to message hash');
  }
  const result = await reactNativeGroth16Verify(
    proof.pub_signals,
    proof.proof,
    verificationKey,
  );
  return result;
}
