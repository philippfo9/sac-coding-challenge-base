import {
  CreatorInput,
  keypairIdentity,
  Metaplex,
  PublicKey,
  token as getSplTokenAmount,
} from '@metaplex-foundation/js';
import { Connection, Keypair } from '@solana/web3.js';


export const mintNfts = async (
  conn: Connection,
  keypair: Keypair,
  config: {
    numNfts: number;
    recipient?: PublicKey;
    isCollection?: boolean;
    collectionAddress?: PublicKey;
    verifyCollection?: boolean;
    collectionIsSized?: boolean;
    creators?: CreatorInput[];
    sftAmount?: number; // if this is set, will mint sft instead of nft
  },
) => {
  const metaplexInstance = new Metaplex(conn).use(keypairIdentity(keypair));
  let collectionSigner = (() => {
    if (config.verifyCollection) {
      return keypair;
    }
    return undefined;
  })();

  const sftAmount = config.sftAmount;
  if (sftAmount === undefined) {
    return Promise.all(
      Array(0, config.numNfts).map((_, index) =>
        metaplexInstance.nfts().create(
          {
            name: `TEST #${index}`,
            uri: `nft://${index}.json`,
            sellerFeeBasisPoints: 100,
            isCollection: config.isCollection,
            tokenOwner: config.recipient,
            collection: config.collectionAddress,
            collectionAuthority: collectionSigner,
            collectionIsSized: config.collectionIsSized,
            creators: config.creators,
          },
          { confirmOptions: { skipPreflight: true, commitment: 'processed' } },
        ),
      ),
    );
  } else {
    return Promise.all(
      Array(0, config.numNfts).map((_, index) =>
        metaplexInstance.nfts().createSft(
          {
            name: `TEST #${index}`,
            uri: `nft://${index}.json`,
            sellerFeeBasisPoints: 100,
            isCollection: config.isCollection,
            tokenOwner: config.recipient ?? keypair.publicKey,
            collection: config.collectionAddress,
            collectionAuthority: collectionSigner,
            collectionIsSized: config.collectionIsSized,
            creators: config.creators,
            tokenAmount: getSplTokenAmount(sftAmount),
          },
          { confirmOptions: { skipPreflight: true, commitment: 'processed' } },
        ),
      ),
    );
  }
};

export const mintCollection = async (
  conn: Connection,
  keypair: Keypair,
  config: {
    numNfts: number;
    legacy: boolean;
    recipient?: PublicKey;
    verifyCollection: boolean;
    creators?: CreatorInput[];
  },
) => {
  const collectionNft = (
    await mintNfts(conn, keypair, {
      numNfts: 1,
      isCollection: true,
      collectionIsSized: !config.legacy,
    })
  )[0];

  const collectionMembers = await mintNfts(conn, keypair, {
    numNfts: config.numNfts,
    recipient: config.recipient,
    collectionAddress: collectionNft.mintAddress,
    verifyCollection: config.verifyCollection,
    creators: config.creators,
  });

  return { collection: collectionNft, members: collectionMembers };
};
