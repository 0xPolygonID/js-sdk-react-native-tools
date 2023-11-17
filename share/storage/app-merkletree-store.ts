import {Merkletree, str2Bytes} from '@iden3/js-merkletree';
// @ts-ignore
import * as uuid from 'uuid';
import {
  IdentityMerkleTreeMetaInformation,
  IMerkleTreeStorage,
  MerkleTreeType,
} from '@0xpolygonid/js-sdk';
import {appStorage} from './store';
import {AppMerkletreeStorageDB} from './merkatree-storage';

const mtTypes = [
  MerkleTreeType.Claims,
  MerkleTreeType.Revocations,
  MerkleTreeType.Roots,
];

export class AppMerkleTreeLocalStorage implements IMerkleTreeStorage {
  static readonly storageKeyMeta = 'merkleTreeMeta';

  constructor(private readonly _mtDepth: number) {}

  async createIdentityMerkleTrees(
    identifier: string,
  ): Promise<IdentityMerkleTreeMetaInformation[]> {
    if (!identifier) {
      identifier = `${uuid.v4()}`;
    }

    const createMetaInfo = () => {
      const treesMeta: IdentityMerkleTreeMetaInformation[] = [];

      for (let index = 0; index < mtTypes.length; index++) {
        const mType = mtTypes[index];
        const treeId = identifier.concat(`+${mType.toString()}`);
        const metaInfo = {treeId, identifier, type: mType};
        treesMeta.push(metaInfo);
      }
      return treesMeta;
    };
    const meta = await appStorage.getItem(
      AppMerkleTreeLocalStorage.storageKeyMeta,
    );
    console.log(meta);
    if (meta) {
      // eslint-disable-next-line no-debugger
      // debugger;
      const metaInfo: IdentityMerkleTreeMetaInformation[] = JSON.parse(meta);
      const identityMetaInfo = metaInfo.filter(
        m => m.identifier === identifier,
      );
      if (identityMetaInfo.length > 0) {
        return identityMetaInfo;
      }
      const treesMeta = createMetaInfo();
      await appStorage.setItem(
        AppMerkleTreeLocalStorage.storageKeyMeta,
        JSON.stringify([...metaInfo, ...treesMeta]),
      );
    }
    const treesMeta = createMetaInfo();
    await appStorage.setItem(
      AppMerkleTreeLocalStorage.storageKeyMeta,
      JSON.stringify(treesMeta),
    );
    console.log("createIdentityMerkleTrees return");

    return treesMeta;
  }

  async getIdentityMerkleTreesInfo(
    identifier: string,
  ): Promise<IdentityMerkleTreeMetaInformation[]> {
    console.log("getIdentityMerkleTreesInfo");

    const meta = await appStorage.getItem(
      AppMerkleTreeLocalStorage.storageKeyMeta,
    );
    if (meta) {
      const metaInfo: IdentityMerkleTreeMetaInformation[] = JSON.parse(meta);
      return metaInfo.filter(m => m.identifier === identifier);
    }
    throw new Error(`Merkle tree meta not found for identifier ${identifier}`);
  }

  // @ts-ignore
  async getMerkleTreeByIdentifierAndType(
    identifier: string,
    mtType: MerkleTreeType,
  ): Promise<Merkletree> {
    const meta = await appStorage.getItem(
      AppMerkleTreeLocalStorage.storageKeyMeta,
    );
    const err = new Error(
      `Merkle tree not found for identifier ${identifier} and type ${mtType}`,
    );
    if (!meta) {
      throw err;
    }

    console.log("getMerkleTreeByIdentifierAndType");
    const metaInfo: IdentityMerkleTreeMetaInformation[] = JSON.parse(meta);
    const resultMeta = metaInfo.filter(
      m => m.identifier === identifier && m.type === mtType,
    )[0];
    if (!resultMeta) {
      throw err;
    }
    return new Merkletree(
      new AppMerkletreeStorageDB(str2Bytes(resultMeta.treeId)),
      true,
      this._mtDepth,
    );
  }

  async addToMerkleTree(
    identifier: string,
    mtType: MerkleTreeType,
    hindex: bigint,
    hvalue: bigint,
  ): Promise<void> {
    const meta = await appStorage.getItem(
      AppMerkleTreeLocalStorage.storageKeyMeta,
    );
    if (!meta) {
      throw new Error(
        `Merkle tree meta not found for identifier ${identifier}`,
      );
    }

    const metaInfo: IdentityMerkleTreeMetaInformation[] = JSON.parse(meta);
    const resultMeta = metaInfo.filter(
      m => m.identifier === identifier && m.type === mtType,
    )[0];
    if (!resultMeta) {
      throw new Error(
        `Merkle tree not found for identifier ${identifier} and type ${mtType}`,
      );
    }

    const tree = new Merkletree(
      new AppMerkletreeStorageDB(str2Bytes(resultMeta.treeId)),
      true,
      this._mtDepth,
    );
    console.log('addToMerkleTree treee');

    await tree.add(hindex, hvalue);
    console.log('addToMerkleTree f]add');

  }

  async bindMerkleTreeToNewIdentifier(
    oldIdentifier: string,
    newIdentifier: string,
  ): Promise<void> {
    const meta = await appStorage.getItem(
      AppMerkleTreeLocalStorage.storageKeyMeta,
    );
    if (!meta) {
      throw new Error(
        `Merkle tree meta not found for identifier ${oldIdentifier}`,
      );
    }
    console.log("bindMerkleTreeToNewIdentifier");
    const metaInfo: IdentityMerkleTreeMetaInformation[] = JSON.parse(meta);
    console.log("bindMerkleTreeToNewIdentifier w");

    const treesMeta = metaInfo
      .filter(m => m.identifier === oldIdentifier)
      .map(m => ({...m, identifier: newIdentifier}));
    if (treesMeta.length === 0) {
      throw new Error(
        `Merkle tree meta not found for identifier ${oldIdentifier}`,
      );
    }

    const newMetaInfo = [
      ...metaInfo.filter(m => m.identifier !== oldIdentifier),
      ...treesMeta,
    ];
    await appStorage.setItem(
      AppMerkleTreeLocalStorage.storageKeyMeta,
      JSON.stringify(newMetaInfo),
    );
  }
}
