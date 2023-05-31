import {createRouter} from "../../../server/createRouter";
import {getWalletKeyFromContext, userAuthedMiddleware, userPlatformAdminMiddleware} from "../../common/auth/authService";
import prisma from "../../../lib/prisma";
import {z} from "zod";
import {getDiscordRefreshAndAccessTokenByCode, getDiscordUser} from "../api/discordApi";
import {
  getAllUserBySearch,
  getLikedRaffles,
  getOrCreateUser,
  getUserByWalletSafe,
  getUserIdByWallet,
  isPlatformAdmin,
  likeRaffle,
  removeDiscordFromUser,
  removeTwitterFromUser,
  unlikeRaffle
} from "../services/UserService";
import {getTwitterProfilePicture, getTwitterRefreshAndAccessToken, getTwitterUser} from "../api/twitterApi";
import {isValidPubKey} from '../../../utils/solUtils';
import {TRPCError} from '@trpc/server';
import {
  getDiscordUserHolderChecks,
  processDiscordChecks,
  removeAllHoldersFromUser
} from '../services/HolderService';
import { random } from 'lodash';
import { userDefaultSelect } from "../services/selects/user";
import { Prisma } from '@prisma/client';
import { timeframeFilterValidation } from '../types';
import { filterRaffleEndsByTimeFrame, getMinDateStringForTimeFrame } from '../../../utils/dbUtils';

export type TLeaderboardStatsUser = {
  id: string, 
  name: string, 
  wallet: string,
  gradientStart: string,
  gradientEnd: string,
  profilePictureUrl: string,
  rafflesCreated: number, 
  ticketsSold: number, 
  totalVolume: number,
  isTrustedRaffler: boolean
}

export type TBuyerLeaderboardBaseStatsUser = {
  id: string, 
  name: string, 
  wallet: string,
  gradientStart: string,
  gradientEnd: string,
  profilePictureUrl: string,
  ticketsBought: number, 
  participatedCount: number,
  totalVolume: number,
  isTrustedRaffler: boolean
}

export type TBuyerLeaderboardStatsWon = {
  id: string, 
  name: string, 
  wallet: string,
  gradientStart: string,
  gradientEnd: string,
  profilePictureUrl: string,
  wonRaffles: number,
  isTrustedRaffler: boolean
}

export type TBuyerLeaderboardStatsUser = TBuyerLeaderboardBaseStatsUser & TBuyerLeaderboardStatsWon

export const userRouter = createRouter()
  .query('get-by-wallet', {
    input: z.object({
      wallet: z.string()
    }),
    resolve: async ({input}) => {
      return await getOrCreateUser(input.wallet)
    }
  })
  .query('search', {
    input: z.object({
      search: z.string(),
    }),
    resolve: async ({ input }) => getAllUserBySearch(input.search),
  })
  .query('all-leader-paginated', {
    input: z.object({
      page: z.number().min(0),
      timeframe: timeframeFilterValidation
    }),
    resolve: async ({ input }) => {
      if (input.page > 3) {
        input.page = 3;
      }

      const userLeaders = await prisma.$queryRaw`
          select
              u.id,
              u.name,
              u.wallet,
              u.gradientStart,
              u.gradientEnd,
              u.profilePictureUrl,
              u.isTrustedRaffler,
              COUNT(r.id) as "rafflesCreated",
              SUM(r.ticketsSoldFinal) as "ticketsSold",
              SUM(r.ticketsSoldFinal * IFNULL(r.estimateTicketPriceInSol, 0)) as "totalVolume"
              from User u
              inner join Raffle r on r.creatorUserId = u.id
              where u.hasBeenBanned = false AND u.hasBeenFlagged = false AND r.status = "FINISHED" AND r.ends > ${getMinDateStringForTimeFrame(input.timeframe)}
            group by u.id
          order by totalVolume desc
          LIMIT 50 OFFSET ${50 * input.page};
      ` as TLeaderboardStatsUser[]
      return userLeaders
    },
  })
  .query('buyer-leaderboard-paginated', {
    input: z.object({
      page: z.number().min(0),
      timeframe: timeframeFilterValidation
    }),
    resolve: async ({input, ctx}) => {
      if (input.page > 3) {
        input.page = 3;
      }

      console.log(`
      select u.id,
             u.name,
             u.wallet,
             u.gradientStart,
             u.gradientEnd,
             u.profilePictureUrl,
             u.isTrustedRaffler,
             SUM(p.ticketsBought) AS "ticketsBought",
            COUNT(p.ticketsBought) AS "participatedCount",
             SUM(p.volumeInSol) AS "totalVolume"
          from Raffle r
          INNER JOIN Participant p on r.id = p.raffleId
          INNER JOIN User u on u.id = p.userId
          where u.hasBeenBanned = false and u.hasBeenFlagged = false and r.status = 'FINISHED' ${filterRaffleEndsByTimeFrame(input.timeframe)}
      group by u.id
      order by totalVolume desc
      LIMIT 50 OFFSET ${50 * input.page};
  `);
      

      const userLeaders = await prisma.$queryRaw`
          select u.id,
                 u.name,
                 u.wallet,
                 u.gradientStart,
                 u.gradientEnd,
                 u.profilePictureUrl,
                 u.isTrustedRaffler,
                 SUM(p.ticketsBought) AS "ticketsBought",
                 COUNT(p.ticketsBought) AS "participatedCount",
                 SUM(p.volumeInSol) AS "totalVolume"
              from Raffle r
              INNER JOIN Participant p on r.id = p.raffleId
              INNER JOIN User u on u.id = p.userId
              where u.hasBeenBanned = false and u.hasBeenFlagged = false and r.status = 'FINISHED' AND r.ends > ${getMinDateStringForTimeFrame(input.timeframe)}
          group by u.id
          order by totalVolume desc
          LIMIT 50 OFFSET ${50 * input.page};
      ` as TBuyerLeaderboardBaseStatsUser[]

      console.log('found users', userLeaders.length);
      

      const userWonLeaders = await prisma.$queryRaw`
          select u.id,
          u.name,
          COUNT(wR.B) AS "wonRaffles",
          u.wallet,
          u.gradientStart,
          u.gradientEnd,
          u.profilePictureUrl,
          u.isTrustedRaffler
          from User u 
          inner join _wonRaffles wR on wR.B = u.id
          inner join Raffle r on r.id = wR.A
          where u.hasBeenBanned = false and u.hasBeenFlagged = false and r.status = 'FINISHED'
          AND r.ends > ${getMinDateStringForTimeFrame(input.timeframe)}
          and u.id in (${Prisma.join(userLeaders.map(u => u.id))})
          group by u.id;
      ` as TBuyerLeaderboardStatsWon[]

      return userLeaders.map(u => {
        return {
          ...u,
          wonRaffles: userWonLeaders.find(userWon => userWon.id === u.id)?.wonRaffles ?? 0
        }
      }) as TBuyerLeaderboardStatsUser[]
    }
  })
  .query('get-simple', {
    resolve: ({ctx}) => {
      prisma.user.findUnique({
        select: userDefaultSelect,
        where: { wallet: getWalletKeyFromContext(ctx) },
      })
    }
  })
  .middleware(userAuthedMiddleware)
  .query('get', {
    resolve: ({ctx}) => getOrCreateUser(getWalletKeyFromContext(ctx))
  })
  .mutation('checkHolder', {
    async resolve({ctx}) {
      const wallet = getWalletKeyFromContext(ctx);
      const user = await prisma.user.findUnique({
        where: {wallet},
        select: {
          wallet: true,
          name: true,
          discordRefreshToken: true,
          discordUsername: true,
          lastHolderCheck: true
        },
        rejectOnNotFound: true
      })
      const lastUsedDate = user.lastHolderCheck;

      const today = new Date();
      today.setMinutes(today.getMinutes() - 10);

      if (lastUsedDate && lastUsedDate.getTime() > today.getTime()) {
        throw new TRPCError({code: 'FORBIDDEN', message: 'Holder refresh rate limit exceeded'});
      }

      await prisma.user.update({
        where: {
          wallet
        },
        data: {
          lastHolderCheck: new Date()
        }
      })

      processDiscordChecks(await getDiscordUserHolderChecks(user)).then(() => {})
    }
  })
  .mutation('addDiscord', {
    input: z.object({
      code: z.string()
    }),
    async resolve({input, ctx}) {
      const wallet = getWalletKeyFromContext(ctx);

      const discordAuthResponse = await getDiscordRefreshAndAccessTokenByCode(input.code);
      const discordUser = await getDiscordUser(discordAuthResponse.access_token);
      const newDiscordId = discordUser.id.toString();

      const userPreUpdate = await prisma.user.findUnique({where: {wallet}, select: {wallet: true, name: true}})

      try {

        await prisma.user.update({
          where: {
            wallet
          },
          data: {
            discordId: newDiscordId,
            discordUsername: `${discordUser.username}#${discordUser.discriminator}`,
            discordRefreshToken: discordAuthResponse.refresh_token,
            ...(userPreUpdate?.name === userPreUpdate?.wallet ? {name: discordUser.username} : {}),
          }
        })
      } catch(err: any) {
        console.log('could not update user name', err.message);
        await prisma.user.update({
          where: {
            wallet
          },
          data: {
            discordId: newDiscordId,
            discordUsername: `${discordUser.username}#${discordUser.discriminator}`,
            discordRefreshToken: discordAuthResponse.refresh_token
          }
        })
      }


      const user = await prisma.user.findUnique({
        where: {wallet},
        select: {
          wallet: true,
          name: true,
          discordRefreshToken: true,
          discordUsername: true,
          discordId: true
        },
        rejectOnNotFound: true
      })

      processDiscordChecks(await getDiscordUserHolderChecks(user)).then(() => {})
    }
  })
  .mutation('rmDiscord', {
    resolve: async ({ctx}) => {
      const wallet = getWalletKeyFromContext(ctx);
      await removeDiscordFromUser(wallet)
      await removeAllHoldersFromUser(wallet)
    }
  })
  .mutation('addTwitter', {
    input: z.object({
      code: z.string(),
      codeVerifier: z.string(),
    }),
    async resolve({input, ctx}) {
      const wallet = getWalletKeyFromContext(ctx);
      const user = await getUserByWalletSafe(wallet);
      const twitterAuthResponse = await getTwitterRefreshAndAccessToken(input.code, input.codeVerifier);
      const twitterUser = await getTwitterUser(twitterAuthResponse.access_token);
      const twitterPfp = (await getTwitterProfilePicture(twitterAuthResponse.access_token, twitterUser.username)).profile_image_url;
      const userFound = await prisma.user.findUnique({where: {name: twitterUser.name}})
      const newUsername = !!userFound ? twitterUser.name + random(1000, 9999).toString() : twitterUser.name

      await prisma.user.update({
        where: {
          wallet
        },
        data: {
          name: user.name.includes(user.wallet) ? newUsername : undefined,
          profilePictureUrl: !user.profilePictureUrl ? twitterPfp?.replace('_normal', '_bigger') : undefined,
          twitterId: twitterUser.id.toString(),
          twitterUsername: twitterUser.username,
          twitterRefreshToken: twitterAuthResponse.refresh_token
        }
      });
    }
  })
  .mutation('rmTwitter', {
    resolve: async ({ctx}) => removeTwitterFromUser(getWalletKeyFromContext(ctx))
  })
  .mutation('updateFundsWallet', {
    input: z.object({
      fundsWallet: z.string().min(1)
    }),
    async resolve({input, ctx}) {
      if (!isValidPubKey(input.fundsWallet)) {
        throw new TRPCError({code: 'BAD_REQUEST', message: 'Invalid wallet key'});
      }

      const wallet = getWalletKeyFromContext(ctx);
      await prisma.user.update({
        where: {
          wallet
        },
        data: {
          fundsWallet: input.fundsWallet
        }
      })
    }
  })
  .mutation('like', {
    input: z.object({
      id: z.string()
    }),
    resolve: ({ctx, input}) => likeRaffle(getWalletKeyFromContext(ctx), input.id)
  })
  .mutation('unlike', {
    input: z.object({
      id: z.string()
    }),
    resolve: ({ctx, input}) => unlikeRaffle(getWalletKeyFromContext(ctx), input.id)
  })
  .mutation('setUsername', {
    input: z.object({
      name: z.string().optional()
    }),
    resolve: async ({ctx, input}) => {
      const user = await getUserByWalletSafe(getWalletKeyFromContext(ctx))

      if (input.name && ((await prisma.user.count({where: {wallet: input.name, id: {not: user.id}}})) > 0 || ((user.wallet !== input.name) && isValidPubKey(input.name)))) {
        throw new TRPCError({code: 'FORBIDDEN', message: 'Cant name username after wallet'})
      }

      await prisma.user.update({
        where: {
          id: user.id
        },
        data: {
          name: input.name ?? user.wallet
        }
      })
    }
  })
  .mutation('setPfp', {
    input: z.object({
      url: z.string().optional()
    }),
    resolve: async ({ctx, input}) => {
      await prisma.user.update({
        where: {
          id: await getUserIdByWallet(getWalletKeyFromContext(ctx))
        },
        data: {
          profilePictureUrl: input.url ?? null
        }
      })
    }
  })
  .query('liked', {
    resolve: ({ctx}) => getLikedRaffles(getWalletKeyFromContext(ctx))
  })
  .query('isPlatformAdmin', {
    resolve: ({ctx}) => isPlatformAdmin(getWalletKeyFromContext(ctx))
  })
  .middleware(userPlatformAdminMiddleware)
  .mutation('flagUser', {
    input: z.object({
      wallet: z.string()
    }),
    resolve: async ({ctx, input}) => {
      const user = await getUserByWalletSafe(input.wallet)
      const updatedUser = await prisma.user.update({
        data: {
          hasBeenFlagged: true
        },
        where: {
          id: user.id
        }
      })
      return updatedUser
    }
  })
  .mutation('banUser', {
    input: z.object({
      wallet: z.string()
    }),
    resolve: async ({ctx, input}) => {
      const user = await getUserByWalletSafe(input.wallet)
      const updatedUser = await prisma.user.update({
        data: {
          hasBeenBanned: true,
          hasBeenFlagged: true
        },
        where: {
          id: user.id
        }
      })
      return updatedUser
    }
  })
  .mutation('setAsTrusted', {
    input: z.object({
      wallet: z.string()
    }),
    resolve: async ({ctx, input}) => {
      const user = await getUserByWalletSafe(input.wallet)
      const updatedUser = await prisma.user.update({
        data: {
          isTrustedRaffler: true,
          hasBeenBanned: false,
          hasBeenFlagged: false
        },
        where: {
          id: user.id
        }
      })
      return updatedUser
    }
  })