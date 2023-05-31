import { createRouter } from '../../../server/createRouter'
import {
  getProjectByPublicId,
  getProjectIdByPublicId,
} from '../services/ProjectService'
import { z } from 'zod'
import {
  addBenefitingProjectToRaffle,
  addPurchaseTokenToRaffle,
  addTransferTxToRaffle,
  createRaffle,
  dislikeRaffleForUser,
  getAllBySearch,
  getAllSavedByUser,
  getTrendingRaffles,
  getRaffleByIdSafe,
  getRafflesWByProjectId,
  getRafflesForProject,
  getRandomRaffle,
  getTicketPrice,
  isRaffleLikedByUser,
  likeRaffleForUser,
  removeAllPurchaseTokensFromRaffle,
  updateRaffle,
  getLandingPageRaffles,
  getUserRaffles,
  getCollectionRaffles,
  postDiscordNewRaffleAndUpdateStatus,
  addAdditionalImagesToRaffle,
  removeAllAdditionalImagesFromRaffle,
} from '../services/RaffleService'
import { LAMPORTS_PER_SOL, SystemProgram, Transaction } from '@solana/web3.js'
import config, { connection, jwtKey, MONET_NON_DEX_FEE_WALLET_PUBKEY } from '../../../config/config'
import {
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAddressInstruction,
  increaseComputeUnitInstruction,
  loadWallet,
  pub,
} from '../../../utils/solUtils'
import { TRPCError } from '@trpc/server'
import {
  getWalletKeyFromContext,
  userAuthedMiddleware,
  userPlatformAdminMiddleware,
} from '../../common/auth/authService'
import { createTransferInstruction } from '../../../utils/splUtils'
import {
  getEstimatedTokenPriceInSolOrUndefined,
  getTokenByIdSafe,
  getTokenIdsByIdsSafe,
} from '../services/TokenService'
import {
  getOrCreateUser,
  getUserByWalletSafe,
  getUserIdByWallet,
  isPlatformAdmin,
  isUserMemberOfProject,
} from '../services/UserService'
import { addNFTAttributesFromAPI } from '../services/AttributeService'
import {
  getMENFTByMintAddress,
  getNFTInfoByMagicEden,
} from '../api/magicedenApi'
import { getCollectionByName } from '../services/CollectionService'
import { decode, encode } from 'jwt-simple'
import reattempt from 'reattempt'
import { meAPIgetToken } from '../api/dto/meAPIgetToken'
import { raffleProgram } from '../raffleConfig'
import {
  getRaffleOnChainDataByDBId,
  getRafflePubkeyAndCheck,
  getRaffleTreasuryPda,
  getRaffleUser,
  getRaffleUserPda,
} from '../raffleOnChainUtils'
import { isUserHolderDBCheck } from '../services/HolderService'
import { BN, web3 } from '@project-serum/anchor'
import prisma from '../../../lib/prisma'
import { raffleDefaultSelect } from '../services/selects/raffle'
import { addDays, addHours, isAfter, isBefore } from 'date-fns'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import tweetNewRaffle from '../../../utils/twitterBot'
import postDiscordNewRaffle from '../../../utils/discordBot'
import {
  createInitIRLRaffleInstruction,
  createInitNFTRaffleInstruction,
  createInitWLRaffleInstruction,
} from '../services/raffleOnChainService'
import {
  createAndUploadWinnerImageS3,
  createRaffleImage,
} from '../../../utils/twitterImages'
import { monetFeatureConfig } from '../../../config/monetFeatureConfig'
import { createRaffleFee } from '../services/RaffleFeeService'
import { NftCollection } from '@prisma/client'
import {
  raffleOrderByValidation,
  raffleFilterValidation,
  raffleProjectFilterValidation,
  raffleStatusValidation,
  raffleUserConnectionValidation,
} from '../types'
import { getValueInOtherToken } from '../../../utils/sacUtils'
import { uploadImageToS3 } from '../../../utils/s3'
import axios from 'axios'
import { getHowRareIsMintInfo } from '../api/howRareIsApi'

export const raffleRouter = createRouter()
  .query('getTokenPrices', {
    resolve: async () => {},
  })
  .query('explore', {
    resolve: async () =>
      getRandomRaffle(
        await prisma.raffle.count({
          where: {
            starts: {
              lte: new Date(),
            },
            ends: {
              gte: new Date(),
            },
            status: 'SCHEDULED',
          },
        })
      ),
  })
  .query('trending.cache', {
    resolve: async () => getTrendingRaffles(),
  })
  .query('search', {
    input: z.object({
      search: z.string(),
      includeEnded: z.boolean().optional(),
    }),
    resolve: async ({ input }) =>
      getAllBySearch(input.search, input.includeEnded),
  })
  .query('all', {
    input: z.object({
      filter: raffleFilterValidation,
      orderBy: raffleOrderByValidation,
      status: raffleStatusValidation,
      page: z.number().min(0),
    }),
    resolve: async ({ input }) =>
      getLandingPageRaffles(
        input.filter,
        input.orderBy,
        input.status,
        input.page
      ),
  })
  .query('all-by-project-public-id', {
    input: z.object({
      projectPublicId: z.string(),
      filter: raffleProjectFilterValidation,
      orderBy: raffleOrderByValidation,
      status: raffleStatusValidation,
      page: z.number().min(0),
    }),
    resolve: async ({ input }) =>
      getRafflesForProject(
        await getProjectIdByPublicId(input.projectPublicId),
        input.filter,
        input.orderBy,
        input.status,
        input.page
      ),
  })
  .query('all-user', {
    input: z.object({
      userWallet: z.string(),
      type: raffleUserConnectionValidation,
      includeCancelled: z.boolean().optional().default(false),
      page: z.number().min(0),
    }),
    resolve: async ({ input }) =>
      getUserRaffles(
        input.userWallet,
        input.type,
        input.includeCancelled,
        input.page
      ),
  })
  .query('all-collection', {
    input: z.object({
      collectionName: z.string(),
      page: z.number().min(0),
    }),
    resolve: async ({ input }) =>
      getCollectionRaffles(input.collectionName, input.page),
  })
  .query('all-admin-by-project-public-id', {
    input: z.object({
      projectPublicId: z.string(),
      includeEnded: z.boolean().default(false),
    }),
    resolve: async ({ input }) =>
      getRafflesWByProjectId(
        await getProjectIdByPublicId(input.projectPublicId),
        input.includeEnded
      ),
  })
  .query('single', {
    input: z.object({
      id: z.string(),
    }),
    resolve: async ({ input }) => getRaffleByIdSafe(input.id),
  })