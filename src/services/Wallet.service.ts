import {defaultEthConnectionConfig} from '../constants';
import {
  AppDataSource,
  AppMerkleTreeLocalStorage,
  AppStoragePrivateKeyStore,
} from '../../share/storage';

import {
  IdentityStorage,
  CredentialStorage,
  BjjProvider,
  KmsKeyType,
  IdentityWallet,
  CredentialWallet,
  KMS,
  EthStateStorage,
  CredentialStatusResolverRegistry,
  CredentialStatusType,
  RHSResolver,
  OnChainResolver,
  IssuerResolver,
} from '@0xpolygonid/js-sdk';

export class WalletService {
  static async createWallet() {
    const keyStore = new AppStoragePrivateKeyStore();
    const bjjProvider = new BjjProvider(KmsKeyType.BabyJubJub, keyStore);
    const kms = new KMS();
    kms.registerKeyProvider(KmsKeyType.BabyJubJub, bjjProvider);
    let dataStorage = {
      credential: new CredentialStorage(
        new AppDataSource(CredentialStorage.storageKey),
      ),
      identity: new IdentityStorage(
        new AppDataSource(IdentityStorage.identitiesStorageKey),
        new AppDataSource(IdentityStorage.profilesStorageKey),
      ),
      mt: new AppMerkleTreeLocalStorage(40),
      states: new EthStateStorage(defaultEthConnectionConfig[0]),
    };

    const resolvers = new CredentialStatusResolverRegistry();
    resolvers.register(
      CredentialStatusType.SparseMerkleTreeProof,
      new IssuerResolver(),
    );
    resolvers.register(
      CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
      new RHSResolver(dataStorage.states),
    );
    resolvers.register(
      CredentialStatusType.Iden3OnchainSparseMerkleTreeProof2023,
      new OnChainResolver(defaultEthConnectionConfig),
    );

    const credWallet = new CredentialWallet(dataStorage, resolvers);
    let wallet = new IdentityWallet(kms, dataStorage, credWallet);

    return {
      wallet: wallet,
      credWallet: credWallet,
      kms: kms,
      dataStorage: dataStorage,
    };
  }
}
