import {byteDecoder} from '@0xpolygonid/js-sdk';
import {ZKProof} from '@iden3/js-jwz';
import {fromByteArray} from 'react-native-quick-base64';
import {groth16Prove} from '@iden3/react-native-rapidsnark';

export const reactNativeGroth16Prover = async (
  inputs: Uint8Array,
  provingKey: Uint8Array,
  wasm: Uint8Array,
  witnessCalculator: Function,
): Promise<ZKProof> => {
  const parsedData = JSON.parse(byteDecoder.decode(inputs));

  console.time('witness calc');
  const calcResult = await witnessCalculator(wasm, parsedData);
  console.timeEnd('witness calc');

  console.time('rapidsnark');

  const {proof, pub_signals} = await groth16Prove(
    fromByteArray(provingKey),
    calcResult,
  );
  console.timeEnd('rapidsnark');

  return {
    proof: JSON.parse(proof),
    pub_signals: JSON.parse(pub_signals),
  };
};
