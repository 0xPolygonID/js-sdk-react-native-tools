import {NativeModules} from 'react-native';
import {byteDecoder} from '@0xpolygonid/js-sdk';
import {ZKProof} from '@iden3/js-jwz';
import {fromByteArray} from 'react-native-quick-base64';


const rapidsnark = NativeModules.Rapidsnark;
export const reactNativeProve = async (
  inputs: Uint8Array,
  provingKey: Uint8Array,
  wasm: Uint8Array,
  witnessCalculator: Function,
): Promise<ZKProof> => {
  console.log('reactNativeProve');
  const parsedData = JSON.parse(byteDecoder.decode(inputs));

  console.time('witness calc');
  const calcResult = await witnessCalculator(wasm, parsedData);
  console.timeEnd('witness calc');

  console.log(calcResult.length);
  console.time('rapidsnark');

  const {proof, pub_signals} = await rapidsnark.groth16_prover(
    fromByteArray(provingKey),
    calcResult,
  );
  console.timeEnd('rapidsnark');

  return {
    proof: JSON.parse(proof),
    pub_signals: JSON.parse(pub_signals),
  };
};
