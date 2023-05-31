import axios from "axios";
import {meAPIgetToken} from "./dto/meAPIgetToken";
import meApigetCollectionByShortName from "./dto/meAPIgetCollection";
import config from "../../../config/config";
import meApigetCollectionStatsByShortName from './dto/meApigetCollectionStatsByShortName';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export const getMENFTByMintAddress = async (nftMint: string) => (await axios.get<meAPIgetToken>(`${config.meApi}tokens/${nftMint}`)).data

export const getMECollectionByName = async (collectionShortName: string) => (await axios.get<meApigetCollectionByShortName>(`${config.meApi}collections/${collectionShortName}`))

export const getMECollectionStatsByName = async (collectionShortName: string) => (await axios.get<meApigetCollectionStatsByShortName>(`${config.meApi}collections/${collectionShortName}/stats`)).data

export async function getNFTInfoByMagicEden(nftMint: string) {
  const nftMetadata = await getMENFTByMintAddress(nftMint)
  if (!nftMetadata.mintAddress) {
    throw new Error('Mint address not found on MagicEden');
    return
  }

  if (!nftMetadata.collection) {
    throw new Error('No collection found for the NFT on MagicEden')
  }

  const meCollectionResponse = await getMECollectionByName(nftMetadata.collection)

  if (meCollectionResponse.status != 200) {
    throw new Error("Collection not found on MagicEden");
  }
  const meCollection = meCollectionResponse.data;

  if (meCollection.isFlagged) {
    throw new Error("NFT is flagged on MagicEden");
  }

  console.log({
    nftMetadata,
    meCollection
  });
  

  return {
    valid: true,
    nftMetadata,
    meCollection
  }
}