import {proving, ProvingMethod, ProvingMethodAlg} from '@iden3/js-jwz';
import {CircuitStorageInstance} from './CircuitStorage';
import {WalletService} from './Wallet.service';
import {defaultEthConnectionConfig, INIT} from '../constants';

import {
  AuthHandler,
  CircuitId,
  CredentialStorage,
  CredentialWallet,
  DataPrepareHandlerFunc,
  EthStateStorage,
  IdentityStorage,
  IdentityWallet,
  PackageManager,
  PlainPacker,
  ProofService,
  VerificationHandlerFunc,
  ZKPPacker,
} from '@0xpolygonid/js-sdk';
import {ReactNativeZKProver} from '../../share/proof/react-native-zk-prover';
import {AppMerkleTreeLocalStorage} from '../../share/storage';
import {DID} from '@iden3/js-iden3-core';
import {ProvingMethodGroth16AuthV2} from '../../share/proof/groth16prove';

export class AppService {
  static instanceES: {
    packageMgr: PackageManager;
    proofService: ProofService;
    credWallet: CredentialWallet;
    wallet: IdentityWallet;
    dataStorage: {
      credential: CredentialStorage;
      identity: IdentityStorage;
      mt: AppMerkleTreeLocalStorage;
      states: EthStateStorage;
    };
    authHandler: AuthHandler;
    status: string;
  };
  static isInit = false;

  static reset() {
    this.isInit = false;
  }
  static isInited() {
    return this.isInit;
    // return !!this.instanceES;
  }
  static async init(circuitsUrl: string, witnessCalculator: Function) {
    await CircuitStorageInstance.init(circuitsUrl);
    let accountInfo = await WalletService.createWallet();
    const {wallet, credWallet, dataStorage} = accountInfo;

    const circuitStorage = CircuitStorageInstance.getCircuitStorageInstance();

    const proofService = new ProofService(
      wallet,
      credWallet,
      circuitStorage,
      new EthStateStorage(defaultEthConnectionConfig[0]),
      {ipfsGatewayURL: 'https://ipfs.io', prover: new ReactNativeZKProver(circuitStorage, witnessCalculator)},
    );
    const provingMethodGroth16AuthV2Instance: ProvingMethod =
        new ProvingMethodGroth16AuthV2(
            new ProvingMethodAlg(
                proving.provingMethodGroth16AuthV2Instance.alg,
                proving.provingMethodGroth16AuthV2Instance.circuitId,
            ),
            witnessCalculator
        );
    await proving.registerProvingMethod(
      proving.provingMethodGroth16AuthV2Instance.methodAlg,
      () => provingMethodGroth16AuthV2Instance,
    );


    let packageMgr = await AppService.getPackageMgr(
      await circuitStorage.loadCircuitData(CircuitId.AuthV2),
      proofService.generateAuthV2Inputs.bind(proofService),
      proofService.verifyState.bind(proofService),
    );

    let authHandler = new AuthHandler(packageMgr, proofService);

    // if (!this.instanceES) {
      this.instanceES = {
        packageMgr,
        proofService,
        credWallet,
        wallet,
        dataStorage,
        authHandler,
        status: INIT,
      };
    // }
    console.log('---App services has been initialized');
    this.isInit = true;
    return this.instanceES;
  }

  static async getPackageMgr(
    circuitData: {
      circuitId?: string;
      wasm: any;
      verificationKey: any;
      provingKey: any;
    },
    prepareFn: {
      (hash: Uint8Array, did: DID, circuitId: CircuitId): Promise<Uint8Array>;
      (hash: Uint8Array, did: DID, circuitId: CircuitId): Promise<Uint8Array>;
    },
    stateVerificationFn: {
      (circuitId: string, pubSignals: string[]): Promise<boolean>;
      (id: string, pubSignals: string[]): Promise<boolean>;
    },
  ) {
    const authInputsHandler = new DataPrepareHandlerFunc(prepareFn);
    const verificationFn = new VerificationHandlerFunc(stateVerificationFn);
    console.log(proving.provingMethodGroth16AuthV2Instance);
    const mapKey =
      proving.provingMethodGroth16AuthV2Instance.methodAlg.toString();

    const verificationParamMap = new Map([
      [
        mapKey,
        {
          key: circuitData.verificationKey,
          verificationFn,
        },
      ],
    ]);

    const provingParamMap = new Map();
    provingParamMap.set(mapKey, {
      dataPreparer: authInputsHandler,
      provingKey: circuitData.provingKey,
      wasm: circuitData.wasm,
    });

    const mgr = new PackageManager();
    const packer = new ZKPPacker(provingParamMap, verificationParamMap);
    const plainPacker = new PlainPacker();
    mgr.registerPackers([packer, plainPacker]);

    return mgr;
  }

  static getExtensionServiceInstance() {
    return this.instanceES;
  }
}
