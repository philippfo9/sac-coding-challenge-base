import prisma from "../../../lib/prisma";
import {Attribute} from "../api/dto/meAPIgetToken";
import {HowRareAttribute} from "../api/dto/howRareIsApiCollections";

export const attributeDefaultSelect = {
  traitType: true,
  value: true,
  rarity: true,
}


export const addNFTAttributesFromAPI = async (raffleId: string, attributes: Attribute[], rarityAttr?: HowRareAttribute[]) => {
  for (const a of attributes) {
    const traitType = a.trait_type?.toString()
    const rA = !!rarityAttr ? rarityAttr.find((prA) => prA.name === traitType) : undefined;
    await prisma.raffleAttribute.create({
      data: {
        traitType,
        value: a.value.toString(),
        rarity: rA?.rarity,
        raffleId
      }
    })
  }
}

