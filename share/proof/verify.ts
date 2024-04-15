import {byteDecoder} from '@0xpolygonid/js-sdk';
import {ProofData, ZKProof} from '@iden3/js-jwz';
import {fromBigEndian} from '@iden3/js-iden3-core';
import {groth16Verify} from '@iden3/react-native-rapidsnark';
export const reactNativeGroth16Verify = async (
  proof: ProofData,
  pub_signals: string[],
  verificationKey: Uint8Array,
) => {
  try {
    const res = await groth16Verify(
      JSON.stringify(proof),
      JSON.stringify(pub_signals),
      byteDecoder.decode(verificationKey),
    );
    return res;
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
    proof.proof,
    proof.pub_signals,
    verificationKey,
  );
  return result;
}
