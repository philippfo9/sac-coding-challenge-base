import prisma from "../../../lib/prisma";
import {getMECollectionByName} from "../api/magicedenApi";
import {TRPCError} from "@trpc/server";
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import {collectionMinSelect} from "./selects/raffle";

export type createCollectionType = {
  name: string,
  title: string
} & updateCollectionType

export type updateCollectionType = {
  image: string,
  verified?: boolean
  twitter?: string,
  website?: string,
  discord?: string,
  averagePrice24hr?: number,
  floorPrice?: number
}

export const createCollection = (data: createCollectionType) =>
  prisma.nftCollection.create({
    data
  })

export const updateCollection = (name: string, data: updateCollectionType) =>
  prisma.nftCollection.update({
    where: {
      name
    },
    data
  })

export const getAllCollectionsSearch = (search: string) => {
  return prisma.nftCollection.findMany({
    where: {
      OR: [
        {
          name: {
            contains: search,
          }
        },
        {
          title: {
            contains: search
          }
        }
      ],
      AND: [
        {
          verified: true,
        }
      ]
    },
    take: 2,
    select: {
      title: true,
      name: true,
      image: true,
      floorPrice: true,
      averagePrice24hr: true,
    },
    orderBy: {
      usedInRaffles: {
        _count: 'desc',
      },
    },
  })
}

export const getAllCollectionsPaginated = (page: number) =>
  prisma.nftCollection.findMany({
    select: collectionMinSelect,
    take: 24,
    skip: page * 24,
    orderBy: {
      floorPrice: 'desc'
    },
  })

export const getCollectionByName = async (name: string) => {
  const meCollectionResponse = await getMECollectionByName(name);
  if (meCollectionResponse.status != 200) {
    throw new TRPCError({code: "BAD_REQUEST", message: "Collection not found on MagicEden"});
  }
  const meCollection = meCollectionResponse.data;

  if (meCollection.isFlagged) {
    throw new TRPCError({code: "BAD_REQUEST", message: "NFT is flagged on MagicEden"});
  }

  const collection = await prisma.nftCollection.findUnique({where: {name}});
  if (!collection) {
    return createCollection({
      name: meCollection.symbol,
      title: meCollection.name,
      image: meCollection.image,
      verified: meCollection.isBadged,
      twitter: meCollection.twitter,
      discord: meCollection.discord,
      website: meCollection.website,
      averagePrice24hr: meCollection.avgPrice24hr,
      floorPrice: meCollection.floorPrice
    });
  } else {
    return updateCollection(name, {
      image: meCollection.image,
      verified: meCollection.isBadged,
      twitter: meCollection.twitter,
      discord: meCollection.discord,
      website: meCollection.website,
      averagePrice24hr: meCollection.avgPrice24hr,
      floorPrice: meCollection.floorPrice
    })
  }
}