import {RHS_URL} from '../constants';
import {AppService} from './App.service';
import {core, CredentialStatusType, W3CCredential} from '@0xpolygonid/js-sdk';

export class IdentityService {
  static instanceIS: {did: core.DID; credential: W3CCredential};

  static async createIdentity() {
    console.log("createIdentity");
    // if (!this.instanceIS) {
      const {wallet} = AppService.getExtensionServiceInstance();
      console.log("ExtensionService.getExtensionServiceInstance", wallet);

      const seedPhrase = new TextEncoder().encode(
        'seedseedseedseedseedseedseedseed',
      );
      console.log(seedPhrase);
      let identity = await wallet.createIdentity({
        method: core.DidMethod.PolygonId,
        blockchain: core.Blockchain.Polygon,
        seed: seedPhrase,
        networkId: core.NetworkId.Mumbai,
        revocationOpts: {
          type: CredentialStatusType.Iden3ReverseSparseMerkleTreeProof,
          id: RHS_URL,
        },
      });
      console.log('!!!!!!!!!!!!!!!!');
      this.instanceIS = identity;
      return this.instanceIS;
    // } else return this.instanceIS;
  }

  static getIdentityInstance() {
    return this.instanceIS;
  }
}
