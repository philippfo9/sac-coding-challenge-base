import {attributeDefaultSelect} from '../AttributeService';
import {tokenDefaultSelect} from '../TokenService';
import {projectDefaultSelect} from '../ProjectService';
import {userDefaultSelect} from './user';
import prisma from '../../../../lib/prisma';

export type TRaffleSelect = NonNullable<Parameters<typeof prisma.raffle.findUnique>[0]>['select']
export const collectionMinSelect = {
  name: true,
  title: true,
  image: true,
  verified: true,
  twitter: true,
  website: true,
  discord: true,
  averagePrice24hr: true,
  floorPrice: true
};

export const raffleDefaultSelect = {
  id: true,
  raffleOnChainAddress: true,
  payoutWallet: true,
  hostWallet: true,
  noTicketsBought: true,
  name: true,
  description: true,
  irlShippingTerms: true,
  type: true,
  status: true,
  imageUrl: true,
  pngUrl: true,
  animationUrl: true,
  winnerSpots: true,
  wlSpots: true,
  wlProjectTwitterLink: true,
  wlProjectWebsiteLink: true,
  wlProjectDiscordLink: true,
  createdTweetUrl: true,
  collectSocial: true,
  nftMint: true,
  newRaffleImageUrl: true,
  attributes: {
    select: attributeDefaultSelect
  },
  hasBeenPostedToDiscord: true,
  collection: {
    select: collectionMinSelect
  },
  holdersOnly: true,
  starts: true,
  ends: true,
  additionalImageUrls: {select: {imageUrl: true}},
  allowedPurchaseTokens: {
    select: {
      tokenId: true,
      token: {
        select: tokenDefaultSelect
      },
      discount: true,
      fixedPrice: true
    }
  },
  ticketPrice: true,
  estimateTicketPriceInSol: true,
  ticketPriceToken: {
    select: tokenDefaultSelect
  },
  maxTickets: true,
  ticketsSoldFinal: true,
  creatorProjectId: true,
  creatorProject: {
    select: projectDefaultSelect
  },
  isUserRaffle: true,
  creatorUserId: true,
  creatorUser: {
    select: userDefaultSelect
  },
  winners: {
    select: userDefaultSelect
  },
  benefitingProjects: {
    select: {
      id: true,
      publicId: true,
      communityName: true,
      gradientStart: true,
      gradientEnd: true,
      profilePictureUrl: true
    }
  },
  autodrawDisabled: true,
  needsSocial: true,
  maxTicketsPerUser: true
}
const raffleDefaultSelectCheck: TRaffleSelect = raffleDefaultSelect

export const raffleMinSelect = {
  id: true,
  raffleOnChainAddress: true,
  payoutWallet: true,
  hostWallet: true,
  name: true,
  description: true,
  irlShippingTerms: true,
  type: true,
  status: true,
  imageUrl: true,
  pngUrl: true,
  animationUrl: true,
  wlSpots: true,
  wlProjectTwitterLink: true,
  wlProjectWebsiteLink: true,
  wlProjectDiscordLink: true,
  nftMint: true,
  collection: {
    select: collectionMinSelect
  },
  holdersOnly: true,
  starts: true,
  ends: true,
  allowedPurchaseTokens: {
    select: {
      tokenId: true,
      token: {
        select: tokenDefaultSelect
      },
      discount: true,
      fixedPrice: true
    }
  },
  ticketPrice: true,
  estimateTicketPriceInSol: true,
  ticketPriceToken: {
    select: tokenDefaultSelect
  },
  maxTickets: true,
  creatorProjectId: true,
  creatorProject: {
    select: projectDefaultSelect
  },
  isUserRaffle: true,
  creatorUserId: true,
  creatorUser: {
    select: {
      ...userDefaultSelect,
    }
  },
  needsSocial: true,
  maxTicketsPerUser: true
}

export const collectionDefaultSelect = {
  name: true,
  title: true,
  image: true,
  verified: true,
  twitter: true,
  website: true,
  discord: true,
  averagePrice24hr: true,
  floorPrice: true,
  projectId: true,
  project: {
    select: projectDefaultSelect
  },
  _count: {
    select: {
      usedInRaffles: true
    }
  }
};