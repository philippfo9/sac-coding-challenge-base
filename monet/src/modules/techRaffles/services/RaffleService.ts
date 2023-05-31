import prisma from '../../../lib/prisma'
import {
  AllowedPurchaseToken,
  ERaffleStatus,
  ERaffleType,
  Prisma,
} from '@prisma/client'
import {
  raffleDefaultSelect,
  raffleMinSelect,
  TRaffleSelect,
} from './selects/raffle'
import { TToken } from '../../../utils/sacUtils'
import { getValueInOtherTokenFromRates } from '../../../utils/dbRateUtils'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import {
  raffleOrderByType,
  raffleFilterType,
  raffleProjectFilterType,
  raffleStatusType,
  raffleUserConnectionType,
} from '../types'
import RaffleWhereInput = Prisma.RaffleWhereInput
import { getUserIdByWallet } from './UserService'
import {
  getAllParticipantRaffles,
  getRaffleOnChainData,
  getRaffleOnChainDataByDBId,
} from '../raffleOnChainUtils'
import { pub } from '../../../utils/solUtils'
import { addHours } from 'date-fns'
import { useOnChainRaffleListData } from '../hooks/raffle'
import asyncBatch from 'async-batch'
import postDiscordNewRaffle, {
  postDiscordEndingSoonRaffle,
} from '../../../utils/discordBot'

export type createRaffleType = {
  raffleOnChainAddress?: string
  name: string
  description?: string
  irlShippingTerms?: string
  payoutWallet: string
  hostWallet: string
  type?: ERaffleType
  status?: ERaffleStatus
  imageUrl: string
  pngUrl?: string
  animationUrl?: string
  feeAmount?: number
  winnerSpots?: number
  wlSpots?: number
  wlProjectTwitterLink?: string
  wlProjectWebsiteLink?: string
  wlProjectDiscordLink?: string
  collectSocial?: boolean
  nftMint?: string
  collectionId?: string
  holdersOnly?: boolean
  starts: Date
  ends: Date
  ticketPrice: number
  ticketPriceTokenId: number
  estimateTicketPriceInSol?: number
  maxTickets?: number
  creatorProjectId?: string
  isUserRaffle?: boolean
  creatorUserId?: string
  newRaffleImageUrl?: string
}

export type updateRaffleType = {
  status?: ERaffleStatus
  name?: string
  imageUrl?: string
  winnerSpots?: number
  wlSpots?: number
  wlProjectTwitterLink?: string
  wlProjectWebsiteLink?: string
  wlProjectDiscordLink?: string
  collectSocial?: boolean
  holdersOnly?: boolean
  starts: Date
  ends: Date
  ticketPrice: number
  ticketPriceTokenId: number
  maxTickets?: number
}

export const createRaffle = (data: createRaffleType) =>
  prisma.raffle.create({
    data,
    select: {
      ...raffleDefaultSelect,
    },
  })

type PurchaseTokenInput = {
  tokenId: number
  discount?: number | null
  fixedPrice?: number | null
}

export const updateRaffle = (id: string, data: updateRaffleType) =>
  prisma.raffle.update({
    where: {
      id,
    },
    data,
    select: {
      ...raffleDefaultSelect,
    },
  })

export const removeAllPurchaseTokensFromRaffle = async (id: string) =>
  prisma.raffle.update({
    where: {
      id,
    },
    data: {
      allowedPurchaseTokens: {
        set: [],
      },
    },
  })

  export const removeAllAdditionalImagesFromRaffle = async (id: string) =>
  prisma.raffle.update({
    where: {
      id,
    },
    data: {
      additionalImageUrls: {
        set: [],
      },
    },
  })

export const addAdditionalImagesToRaffle = async (
  id: string,
  ...imageUrls: string[]
) => {
  await prisma.raffle.update({
    where: {
      id,
    },
    data: {
      additionalImageUrls: {
        createMany: {
          data: imageUrls.map((imageUrl) => ({
            imageUrl,
          })),
        },
      },
    },
  })
}

export const addPurchaseTokenToRaffle = async (
  id: string,
  ...tokenIds: PurchaseTokenInput[]
) => {
  await prisma.raffle.update({
    where: {
      id,
    },
    data: {
      allowedPurchaseTokens: {
        createMany: {
          data: tokenIds.map((token) => ({
            tokenId: token.tokenId,
            fixedPrice: !!token.fixedPrice ? token.fixedPrice : undefined,
            discount: !!token.discount ? token.discount : undefined,
          })),
        },
      },
    },
  })
}

export const addBenefitingProjectToRaffle = async (
  id: string,
  ...benefitingProjectIds: string[]
) => {
  for (const project of benefitingProjectIds) {
    await prisma.raffle.update({
      where: {
        id,
      },
      data: {
        benefitingProjects: {
          connect: {
            id: project,
          },
        },
      },
    })
  }
}

export const addTransferTxToRaffle = (id: string, transferTx: string) =>
  prisma.raffle.update({
    where: { id },
    data: { transferTx },
  })

export const setRaffleStatus = (id: string, status: ERaffleStatus) =>
  prisma.raffle.update({
    where: { id },
    data: { status },
  })

export const getRaffleByIdSafe = (id: string) =>
  prisma.raffle.findUnique({
    select: { ...raffleDefaultSelect, _count: { select: { likedBy: true } } },
    where: { id },
    rejectOnNotFound: true,
  })

export const getRaffleById = (id: string) =>
  prisma.raffle.findUnique({
    select: { ...raffleDefaultSelect, _count: { select: { likedBy: true } } },
    where: { id },
  })

export const getLandingPageRaffles = async (
  filter: raffleFilterType,
  orderBy: raffleOrderByType,
  status: raffleStatusType,
  page: number
) => {
  console.log(page)
  const raffles = await prisma.raffle.findMany({
    select: raffleMinSelect,
    where: {
      status:
        status !== 'ENDED'
          ? 'SCHEDULED'
          : { notIn: ['IN_CREATION', 'CANCELLED'] },
      ends:
        status === 'ENDED'
          ? {
              lte: new Date(),
            }
          : {
              gte: new Date(),
            },
      type:
        filter === 'NFT'
          ? 'NFT'
          : filter === 'WL'
          ? 'WHITELIST'
          : filter === 'IRL'
          ? 'IRL'
          : undefined,
      AND:
        status === 'FEATURED'
          ? [
              {
                allowedPurchaseTokens: {
                  some: {
                    token: {
                      onDEX: true,
                    },
                  },
                },
              },
              {
                OR: [
                  {
                    collection: {
                      OR: [
                        {
                          floorPrice: {
                            gte: 1.001 * LAMPORTS_PER_SOL,
                          },
                        },
                        {
                          averagePrice24hr: {
                            gte: 1.001 * LAMPORTS_PER_SOL,
                          },
                        },
                      ],
                    },
                  },
                  {
                    isInFeaturedSection: true,
                  },
                  {
                    type: 'IRL',
                  },
                ],
              },
              {
                OR: [
                  {
                    creatorProject: {
                      verified: true,
                    },
                  },
                  {
                    creatorUser: {
                      OR: [
                        {
                          twitterId: {
                            not: null,
                          },
                        },
                        {
                          discordId: {
                            not: null,
                          },
                        },
                      ],
                      hasBeenBanned: false,
                      hasBeenFlagged: false,
                    },
                  },
                ],
              },
            ]
          : [],
    },
    orderBy:
      status === 'ENDED'
        ? { ends: 'desc' }
        : orderBy === 'ENDING_SOON'
        ? { ends: 'asc' }
        : orderBy === 'RECENTLY_ADDED'
        ? { ends: 'desc' }
        : orderBy === 'FLOOR'
        ? {
            collection: {
              floorPrice: 'desc',
            },
          }
        : {
            collection: {
              averagePrice24hr: 'desc',
            },
          },
    take: 16,
    skip: page * 16,
  })
  return raffles
}

export const getRafflesForProject = (
  projectId: string,
  filter: raffleProjectFilterType,
  orderBy: raffleOrderByType,
  status: raffleStatusType,
  page: number
) => {
  return prisma.raffle.findMany({
    select: raffleMinSelect,
    where: {
      status:
        status !== 'ENDED'
          ? 'SCHEDULED'
          : { notIn: ['IN_CREATION', 'CANCELLED'] },
      OR: [
        filter !== 'USER' ? { creatorProjectId: projectId } : {},
        filter !== 'PROJECT'
          ? {
              benefitingProjects: {
                some: { id: projectId },
              },
            }
          : {},
      ],
      ends:
        status === 'ENDED'
          ? {
              lte: new Date(),
            }
          : {
              gte: new Date(),
            },
      type:
        filter === 'NFT'
          ? 'NFT'
          : filter === 'WL'
          ? 'WHITELIST'
          : filter === 'IRL'
          ? 'IRL'
          : undefined,
      AND: [
        {
          OR: [
            {
              creatorProjectId: {
                not: null,
              },
            },
            {
              collection:
                filter === 'COLLECTION' || status === 'FEATURED'
                  ? {
                      AND: [
                        filter === 'COLLECTION' ? { projectId } : {},
                        status === 'FEATURED'
                          ? {
                              AND: [
                                {
                                  floorPrice: {
                                    gte: 0.51 * LAMPORTS_PER_SOL,
                                  },
                                },
                                {
                                  averagePrice24hr: {
                                    gte: 0.51 * LAMPORTS_PER_SOL,
                                  },
                                },
                              ],
                            }
                          : {},
                      ],
                    }
                  : {},
            },
          ],
        },
      ],
    },
    orderBy:
      status === 'ENDED'
        ? { ends: 'desc' }
        : orderBy === 'ENDING_SOON'
        ? { ends: 'asc' }
        : orderBy === 'RECENTLY_ADDED'
        ? { ends: 'desc' }
        : orderBy === 'FLOOR'
        ? {
            collection: {
              floorPrice: 'desc',
            },
          }
        : {
            collection: {
              averagePrice24hr: 'desc',
            },
          },
    take: 16,
    skip: page * 16,
  })
}

export const getUserRaffles = async (
  userWallet: string,
  type: raffleUserConnectionType,
  includeCancelled: boolean,
  page: number
) => {
  const participatedRaffleIds: string[] = []
  if (type === 'PARTICIPATED' || type === 'ALL') {
    const userPub = pub(userWallet)
    participatedRaffleIds.push(
      ...(await getAllParticipantRaffles(userPub))
        .filter((u) => u.account.authority.equals(userPub))
        .map((ru) => ru.account.raffle.toBase58())
    )
  }

  const userId = await getUserIdByWallet(userWallet)
  return prisma.raffle.findMany({
    select: { ...raffleMinSelect, _count: { select: { likedBy: true } } },
    where: {
      OR: [
        type === 'ALL' || type === 'CREATED'
          ? {
              creatorUserId: userId,
              status: {
                notIn: includeCancelled
                  ? ['IN_CREATION']
                  : ['IN_CREATION', 'CANCELLED'],
              },
            }
          : {},
        type === 'ALL' || type === 'PARTICIPATED'
          ? {
              raffleOnChainAddress: {
                in: participatedRaffleIds,
              },
            }
          : {},
      ],
    },
    orderBy: {
      ends: 'desc',
    },
    take: 16,
    skip: page * 16,
  })
}

export const getCollectionRaffles = (collectionName: string, page: number) => {
  return prisma.raffle.findMany({
    select: raffleMinSelect,
    where: {
      status: { notIn: ['IN_CREATION', 'CANCELLED'] },
      collection: {
        name: collectionName,
      },
    },
    orderBy: { ends: 'desc' },
    take: 16,
    skip: page * 16,
  })
}

export const raffleDrawSelect = {
  ...raffleDefaultSelect,
  onlyPickFromVerified: true,
  estimateTicketPriceInSol: true,
  feeAmount: true,
  creatorProject: {
    select: {
      ...raffleDefaultSelect.creatorProject.select,
      discordWinnersHook: true,
      discordWinnersRoleId: true,
    },
  },
  benefitingProjects: {
    select: {
      ...raffleDefaultSelect.benefitingProjects.select,
      discordWinnersHook: true,
      discordNewRafflesHook: true,
      discordWinnersRoleId: true,
      fundsWallet: true,
    },
  },
}
const raffleDrawSelectCheck: TRaffleSelect = raffleDrawSelect

export const getAllUndrawnEndedRafflesOrPossiblySoldOut = async () => {
  const endedRaffles = await prisma.raffle.findMany({
    select: raffleDrawSelect,
    where: {
      status: {
        in: ['SCHEDULED', 'DRAWN'],
      },
      OR: [
        {
          ends: {
            lte: new Date(),
          },
        },
        {
          possiblySoldOut: true,
        },
      ],
    },
  })
  console.log(
    'searching for undrawn ended raffles, found ',
    endedRaffles.length
  )
  return endedRaffles
}

export const getRafflesWByProjectId = (
  projectId?: string,
  includeEnded: boolean = false
) =>
  prisma.raffle.findMany({
    select: raffleDefaultSelect,
    where: {
      creatorProjectId: projectId,
      status: { notIn: ['IN_CREATION', 'CANCELLED'] },
      ends: includeEnded
        ? {}
        : {
            gte: new Date(),
          },
    },
  })

export const getAllBySearch = (search: string, includeEnded = true) =>
  prisma.raffle.findMany({
    where: {
      status: { notIn: ['IN_CREATION', 'CANCELLED'] },
      AND: [
        {
          OR: [
            {
              name: {
                contains: search,
              },
            },
            {
              collection: {
                OR: [
                  {
                    name: {
                      contains: search,
                    },
                  },
                  {
                    title: {
                      contains: search,
                    },
                  },
                ],
              },
            },
            {
              creatorProject: {
                OR: [
                  {
                    communityName: {
                      contains: search,
                    },
                  },
                  {
                    platformName: {
                      contains: search,
                    },
                  },
                  {
                    publicId: {
                      contains: search,
                    },
                  },
                ],
              },
            },
            {
              creatorUser: {
                OR: [
                  {
                    name: {
                      contains: search,
                    },
                  },
                  {
                    wallet: {
                      contains: search,
                    },
                  },
                  {
                    twitterUsername: {
                      contains: search,
                    },
                  },
                  {
                    discordUsername: {
                      contains: search,
                    },
                  },
                ],
              },
            },
          ],
        },
        {
          OR: [
            {
              creatorProject: {
                verified: true,
                isHidden: false,
              },
            },
            {
              creatorUser: {
                twitterId: {
                  not: null,
                },
                discordId: {
                  not: null,
                },
                hasBeenFlagged: false,
                hasBeenBanned: false,
              },
            },
          ],
        },
      ],
      ends: includeEnded
        ? {}
        : {
            gte: new Date(),
          },
    },
    take: 5,
    select: {
      id: true,
      name: true,
      imageUrl: true,
      collection: {
        select: {
          title: true,
        },
      },
    },
    orderBy: {
      collection: {
        floorPrice: 'desc',
      },
    },
  })

export const getAllSavedByUser = (id: string, includeEnded: boolean = false) =>
  prisma.raffle.findMany({
    where: {
      likedBy: {
        some: {
          id,
        },
      },
      ends: includeEnded
        ? {}
        : {
            gte: new Date(),
          },
      status: { notIn: ['IN_CREATION', 'CANCELLED'] },
    },
    orderBy: {
      ends: 'desc',
    },
    select: raffleDefaultSelect,
  })

export const getTrendingRaffles = async () => {
  const highestRunningValueRaffleArr = await prisma.raffle.findMany({
    where: {
      starts: {
        lte: new Date(),
      },
      ends: {
        gte: new Date(),
      },
      status: 'SCHEDULED',
      ticketPriceToken: {
        onDEX: true,
      },
      allowedPurchaseTokens: {
        every: {
          token: {
            onDEX: true,
          },
        },
      },
      OR: [
        {
          creatorProject: {
            verified: true,
          },
        },
        {
          creatorUser: {
            twitterId: {
              not: null,
            },
            discordId: {
              not: null,
            },
            hasBeenBanned: false,
            hasBeenFlagged: false,
          },
        },
      ],
    },
    orderBy: {
      collection: {
        averagePrice24hr: 'desc',
      },
    },
    take: 3,
    select: raffleMinSelect,
  })

  const selectedTopRaffle = await prisma.raffle.findFirst({
    select: raffleMinSelect,
    where: { setTrending: true },
  })
  const randomHighestValIdx = Math.floor(
    Math.random() * (highestRunningValueRaffleArr.length * 0.9999999)
  )
  const highestRunningValueRaffle =
    highestRunningValueRaffleArr[randomHighestValIdx]
  const rand = Math.random() * 100
  const takeTopRaffleFirst =
    selectedTopRaffle?.status === 'SCHEDULED' && rand > 66 // 34%
  const selectedFirstRaffleArray = takeTopRaffleFirst
    ? [selectedTopRaffle]
    : highestRunningValueRaffle
    ? [highestRunningValueRaffle]
    : []

  const raffles = await prisma.raffle.findMany({
    where: {
      starts: {
        lte: new Date(),
      },
      ends: {
        gte: new Date(),
        lte: addHours(new Date(), 16),
      },
      status: 'SCHEDULED',
      OR: [
        {
          creatorProject: {
            verified: true,
          },
        },
        {
          creatorUser: {
            twitterId: {
              not: null,
            },
            discordId: {
              not: null,
            },
            hasBeenBanned: false,
            hasBeenFlagged: false,
          },
        },
      ],
    },
    orderBy: {
      collection: {
        averagePrice24hr: 'desc',
      },
    },
    take: 7,
    select: raffleMinSelect,
  })

  const selectedEndingSoonRaffles: typeof raffles = []
  while (
    selectedEndingSoonRaffles.length < 3 &&
    selectedEndingSoonRaffles.length < raffles.length
  ) {
    const randomIdx = Math.floor(Math.random() * (raffles.length * 0.9999999))
    if (randomIdx === raffles.length) {
      continue
    }
    const raffle = raffles[randomIdx]
    if (
      selectedEndingSoonRaffles.some((r) => r.id === raffle.id) ||
      highestRunningValueRaffleArr.some((r) => r.id === raffle.id) ||
      selectedTopRaffle?.id === raffle?.id
    ) {
      continue
    }

    if (raffle) {
      selectedEndingSoonRaffles.push(raffle)
    }
  }

  return [
    ...selectedFirstRaffleArray,
    ...selectedEndingSoonRaffles,
    ...highestRunningValueRaffleArr.filter(
      (raffle) => !selectedFirstRaffleArray.some((r) => r.id === raffle.id)
    ),
    ...(takeTopRaffleFirst || selectedTopRaffle?.status !== 'SCHEDULED'
      ? []
      : [selectedTopRaffle]),
  ]
}

export const getRandomRaffle = (itemCount: number, notIn?: string[]) => {
  const skip = Math.max(0, Math.floor(Math.random() * itemCount) - 1)
  const orderBy = randomPick([
    'id',
    'raffleOnChainAddress',
    'imageUrl',
    'starts',
    'ends',
    'ticketPrice',
    'type',
  ])
  const orderDir = randomPick(['asc', 'desc'])

  return prisma.raffle.findFirst({
    where: {
      id: {
        notIn: notIn,
      },
      starts: {
        lte: new Date(),
      },
      ends: {
        gte: new Date(),
      },
      status: 'SCHEDULED',
    },
    skip: skip,
    orderBy: { [orderBy]: orderDir },
    select: raffleDefaultSelect,
  })
}

const randomPick = (values: string[]) => {
  const index = Math.floor(Math.random() * values.length)
  return values[index]
}

export async function getTicketPrice(
  raffle: {
    ticketPrice: number
    ticketPriceToken: { address: string; symbol: string }
  },
  purchaseTokenObj: {
    token: TToken
  } & Partial<AllowedPurchaseToken>
) {
  const payToken = purchaseTokenObj.token

  if (purchaseTokenObj.fixedPrice) {
    return purchaseTokenObj.fixedPrice
  }

  if (raffle.ticketPriceToken.address === payToken.address) {
    return raffle.ticketPrice
  }

  const payTokenTicketPrice = await getValueInOtherTokenFromRates(
    raffle.ticketPrice,
    raffle.ticketPriceToken,
    payToken
  )
  const discount = purchaseTokenObj.discount ?? 0
  const discountedPrice = payTokenTicketPrice * (1 - discount / 100)
  return discountedPrice * 1.0125 // 1.0125 for slippage
}

export const likeRaffleForUser = (raffleId: string, userId: string) =>
  prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      likedRaffles: {
        connect: {
          id: raffleId,
        },
      },
    },
  })

export const dislikeRaffleForUser = (raffleId: string, userId: string) =>
  prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      likedRaffles: {
        disconnect: {
          id: raffleId,
        },
      },
    },
  })

export const isRaffleLikedByUser = async (raffleId: string, userId: string) =>
  (await prisma.raffle.count({
    where: {
      id: raffleId,
      likedBy: {
        some: {
          id: userId,
        },
      },
    },
  })) > 0

export const getRunningVerifiedRafflesWithoutCreatedTweet = function () {
  return prisma.raffle.findMany({
    where: {
      starts: {
        lte: new Date(),
      },
      ends: {
        gt: new Date(),
      },
      creatorProject: {
        verified: true,
      },
      status: 'SCHEDULED',
      OR: [
        {
          createdTweetUrl: null,
        },
        {
          raffleStartPostedToDiscord: false,
        },
      ],
    },
    select: {
      id: true,
      name: true,
      maxTickets: true,
      imageUrl: true,
      pngUrl: true,
      animationUrl: true,
      isUserRaffle: true,
      createdTweetUrl: true,
      raffleStartPostedToDiscord: true,
      newRaffleImageUrl: true,
      creatorUser: {
        select: {
          twitterId: true,
        },
      },
      creatorProject: {
        select: {
          id: true,
          twitterUserHandle: true,
          discordNewRafflesHook: true,
          discordNewRafflesRoleId: true,
          communityName: true,
        },
      },
    },
  })
}

export const getRunningVerifiedRafflesWithoutEndingTweet = async function () {
  const raffles = await prisma.raffle.findMany({
    where: {
      starts: {
        lte: new Date(),
      },
      ends: {
        // 5-60 min before ending
        gte: new Date(new Date().getTime() + 5 * 60 * 1000),
        lte: new Date(new Date().getTime() + 60 * 60 * 1000),
      },
      endingSoonTweetUrl: null,
      status: {
        notIn: [
          ERaffleStatus.CANCELLED,
          ERaffleStatus.FINISHED,
          ERaffleStatus.FINISHED,
        ],
      },
      OR: [
        {
          creatorProject: {
            verified: true,
          },
        },
        {
          isUserRaffle: true,
        },
      ],
      // ticketsSoldFinal: {
      //   gt: 5,
      // },
      collection: {
        AND: [
          {
            floorPrice: {
              gte: 10.5 * LAMPORTS_PER_SOL,
            },
          },
          {
            averagePrice24hr: {
              gte: 10.5 * LAMPORTS_PER_SOL,
            },
          },
        ],
      },
    },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      pngUrl: true,
      animationUrl: true,
      isUserRaffle: true,
      maxTickets: true,
      ticketPrice: true,
      ticketPriceToken: {
        select: {
          symbol: true,
        },
      },
      allowedPurchaseTokens: {
        select: {
          token: true,
        },
      },
      ticketsSoldFinal: true,
      endingSoonTweetUrl: true,
      creatorUser: {
        select: {
          twitterId: true,
          name: true,
        },
      },
      creatorProject: {
        select: {
          twitterUserHandle: true,
          discordNewRafflesHook: true,
          discordNewRafflesRoleId: true,
          communityName: true,
        },
      },
      collection: {
        select: {
          name: true,
          title: true,
          floorPrice: true,
          averagePrice24hr: true,
        },
      },
    },
  })

  const rafflesFull = await asyncBatch(
    raffles,
    async (raffle) => {
      try {
        const onChainData = await getRaffleOnChainDataByDBId(raffle.id)
        return {
          ...raffle,
          ticketsSold: onChainData.ticketCount,
        }
      } catch (e) {
        console.log('raffle on chain data error. Raflle id: ', raffle.id, e)
      }
    },
    4
  )

  type raffleType = (typeof raffles)[0] & { ticketsSold: number }

  return rafflesFull as raffleType[]
}

export const getRunningVerifiedRafflesWithoutEndingDiscordMessage =
  async function () {
    const raffles = await prisma.raffle.findMany({
      where: {
        starts: {
          lte: new Date(),
        },
        ends: {
          // 5-45 min before ending
          gte: new Date(new Date().getTime() + 5 * 60 * 1000),
          lte: new Date(new Date().getTime() + 45 * 60 * 1000),
        },
        raffleEndPostedToDiscord: false,
        OR: [
          {
            creatorProject: {
              verified: true,
            },
          },
          {
            isUserRaffle: true,
          },
        ],
        status: {
          notIn: [
            ERaffleStatus.CANCELLED,
            ERaffleStatus.FINISHED,
            ERaffleStatus.FINISHED,
          ],
        },
        // ticketsSoldFinal: {
        //   gt: 5,
        // },
        collection: {
          AND: [
            {
              floorPrice: {
                gte: 1 * LAMPORTS_PER_SOL,
              },
            },
            {
              averagePrice24hr: {
                gte: 1 * LAMPORTS_PER_SOL,
              },
            },
          ],
        },
      },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        pngUrl: true,
        animationUrl: true,
        isUserRaffle: true,
        maxTickets: true,
        ticketPrice: true,
        raffleEndPostedToDiscord: true,
        starts: true,
        ends: true,
        ticketPriceToken: {
          select: {
            symbol: true,
          },
        },
        allowedPurchaseTokens: {
          select: {
            token: true,
          },
        },
        ticketsSoldFinal: true,
        endingSoonTweetUrl: true,
        creatorUser: {
          select: {
            twitterId: true,
            name: true,
          },
        },
        creatorProject: {
          select: {
            id: true,
            twitterUserHandle: true,
            discordNewRafflesHook: true,
            discordNewRafflesRoleId: true,
            communityName: true,
          },
        },
        benefitingProjects: {
          select: {
            id: true,
            discordNewRafflesHook: true,
            discordNewRafflesRoleId: true,
            communityName: true,
          },
        },
        collection: {
          select: {
            name: true,
            title: true,
            floorPrice: true,
            averagePrice24hr: true,
          },
        },
      },
    })

    const rafflesFull = await asyncBatch(
      raffles,
      async (raffle) => {
        try {
          const onChainData = await getRaffleOnChainDataByDBId(raffle.id)
          return {
            ...raffle,
            ticketsSold: onChainData.ticketCount,
          }
        } catch (e) {
          console.log('raffle on chain data error. Raflle id: ', raffle.id, e)
        }
      },
      4
    )

    type raffleType = (typeof raffles)[0] & { ticketsSold: number }

    return rafflesFull as raffleType[]
  }

const deleteOldInCreationRafflesWhereQuery = (date: Date) => {
  return {
    status: 'IN_CREATION',
    raffleOnChainAddress: null,
    ends: {
      lte: date,
    },
  } as RaffleWhereInput
}

export async function deleteOldInCreationRaffles() {
  console.log('deleting unused raffles')
  console.time('Unused raffles')
  const date = new Date()
  date.setDate(date.getDate() - 3)
  const raffles = await prisma.raffle.findMany({
    select: {
      id: true,
      ends: true,
      status: true,
    },
    where: {
      status: 'IN_CREATION',
      raffleOnChainAddress: null,
      ends: {
        lte: date,
      },
    },
    orderBy: {
      ends: 'asc',
    },
  })

  for (const raffle of raffles) {
    console.log(raffle)
    await Promise.all([
      prisma.allowedPurchaseToken.deleteMany({
        where: { raffleId: raffle.id },
      }),
      prisma.$queryRaw`DELETE FROM _benefitingRaffles WHERE B=${raffle.id}`,
      prisma.$queryRaw`DELETE FROM Raffle WHERE ID=${raffle.id}`,
    ])
  }

  console.log('raffles deleted: ', raffles.length)
  console.timeEnd('Unused raffles')
}

export async function postDiscordNewRaffleAndUpdateStatus(
  projectId?: string,
  ...parameters: Parameters<typeof postDiscordNewRaffle>
) {
  const status = await postDiscordNewRaffle(...parameters)
  return await updateProjectWebhookStatusBasedOnResponse(status, projectId)
}

export async function postDiscordEndingSoonRaffleAndUpdateStatus(
  projectId?: string,
  ...parameters: Parameters<typeof postDiscordEndingSoonRaffle>
) {
  const status = await postDiscordEndingSoonRaffle(...parameters)
  return await updateProjectWebhookStatusBasedOnResponse(status, projectId)
}

export async function updateProjectWebhookStatusBasedOnResponse(
  status: number,
  projectId?: string
) {
  if (projectId) {
    return await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        recentDiscordWebhookStatus: status,
      },
    })
  }
}
