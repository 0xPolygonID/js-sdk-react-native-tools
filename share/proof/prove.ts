import {Platform} from 'react-native';
import RNFS from 'react-native-fs';
import {byteDecoder} from '@0xpolygonid/js-sdk';
import {ZKProof} from '@iden3/js-jwz';
import {fromByteArray} from 'react-native-quick-base64';
import {groth16Prove} from '@iden3/react-native-rapidsnark';
import {v4 as uuidv4} from 'uuid';

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

  const tmpDir =
    Platform.OS === 'android'
      ? RNFS.CachesDirectoryPath
      : RNFS.TemporaryDirectoryPath;
  const zkeyPath = `${tmpDir}/proving_key_${uuidv4()}.zkey`;

  try {
    await RNFS.writeFile(zkeyPath, fromByteArray(provingKey), 'base64');
    const {proof, pub_signals} = await groth16Prove(zkeyPath, calcResult);
    console.timeEnd('rapidsnark');

    return {
      proof: JSON.parse(proof),
      pub_signals: JSON.parse(pub_signals),
    };
  } finally {
    await RNFS.unlink(zkeyPath).catch(e =>
      console.warn('Failed to clean up temp zkey file:', e),
    );
  }
};
