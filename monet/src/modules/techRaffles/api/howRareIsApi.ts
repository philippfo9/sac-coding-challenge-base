import axios from "axios";
import {howRareIsApiCollectionResponse} from "./dto/howRareIsApiCollections";

export const getHowRareIsMintInfo = async (meCollectionName: string, nftMint: string) => {
  let response = undefined;
  try {
     response = (await axios.get<howRareIsApiCollectionResponse>(`https://api.howrare.is/v0.1/collections/${meCollectionName.replace(/_/g, '')}`)).data;
  } catch {
    return undefined;
  }

  let nft = undefined;
  for (const nfts of response.result.data.items) {
    if (nfts.mint === nftMint) {
      nft = nfts;
      break;
    }
  }
  return nft;
}