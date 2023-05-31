import { createRouter } from '../../../server/createRouter'
import {
  addUserToProject,
  createProject,
  getFeaturedProjects,
  getProjectByIdSafe,
  getProjectByPublicId,
  getProjectIdByPublicId,
  getAllProjectsPaginated,
  getProjectWhereUserIsAdmin,
  getProjectWhereUserIsHolder,
  projectDefaultSelect,
  removeUserFromProject,
  updateProject,
  getProjectWhereUserIsHolderAndCommunityRaffleEnabled,
  getVerifiedAndCommunityRaffleEnabledProjects,
  getAllBySearch,
  getTicketsSoldPerProject,
} from '../services/ProjectService'
import { z } from 'zod'
import {
  getWalletKeyFromContext,
  userAuthedMiddleware,
  userPlatformAdminMiddleware,
} from '../../common/auth/authService'
import {
  getOrCreateUser,
  getUserByWalletSafe,
  getUserCreatedProjectsCount,
  getUserIdByWallet,
  isUserAdminOfProject,
  isUserMemberOfProject,
} from '../services/UserService'
import { TRPCError } from '@trpc/server'
import { getTwitterProjectAccessToken, getTwitterUser } from '../api/twitterApi'
import prisma from '../../../lib/prisma'
import { userDefaultSelect } from '../services/selects/user'
import { monetFeatureConfig } from '../../../config/monetFeatureConfig'
import {
  getDiscordAccessTokenByRefreshToken,
  getDiscordCurrentUserGuilds,
  getGuildIdFromDiscordLink,
} from '../api/discordApi'
import { tweetVerifiedCommunity } from '../../../utils/twitterBot'
import {
  discordHolderCheck,
  isUserHolderDBCheck,
} from '../services/HolderService'
import { sub } from 'date-fns'
import { getPlatformStats } from '../services/StatsService'
import { timeframeFilterValidation, userCommunityMemberType } from '../types'
import { filterRaffleEndsByTimeFrame, getMinDateStringForTimeFrame } from '../../../utils/dbUtils'

export const publicIdBlacklist = ['new']

export type TLeaderboardStatsProject = {
  id: string
  publicId: string
  communityName: string
  profilePictureUrl: string
  ticketsSold?: number
  totalVolume?: number
  holders?: number
  benefitingRaffles?: number
  createdRaffles?: number
}

export const projectRouter = createRouter()
  .query('all-paginated', {
    input: z.object({
      page: z.number().min(0),
    }),
    resolve: ({ input }) => getAllProjectsPaginated(input.page),
  })
  .query('all-leader-paginated', {
    input: z.object({
      page: z.number().min(0),
      timeframe: timeframeFilterValidation
    }),
    resolve: async ({ input }) => {
      console.log('page', input.page)

      if (input.page > 1) {
        input.page = 1
      }

      console.log(`
      select
          p.id,
          p.publicId,
          p.communityName,
          p.profilePictureUrl,
          SUM(DISTINCT r.ticketsSoldFinal * IFNULL(r.estimateTicketPriceInSol, 0)) as "totalVolume",
          COUNT(DISTINCT r.id) as "createdRaffles",
          COUNT(DISTINCT h.B) as "holders"
      from Project p
          left outer join Raffle r on r.creatorProjectId = p.id
          left outer join _holderProject h on h.A = p.id
      where p.verified = true AND r.status = "FINISHED" AND r.ends > ${getMinDateStringForTimeFrame(input.timeframe)}
      group by p.id
        order by totalVolume desc
      LIMIT 50 OFFSET ${50 * input.page};
  `);
      


      const projectLeaderboardStats = (await prisma.$queryRaw`
          select
              p.id,
              p.publicId,
              p.communityName,
              p.profilePictureUrl,
              SUM(DISTINCT r.ticketsSoldFinal * IFNULL(r.estimateTicketPriceInSol, 0)) as "totalVolume",
              COUNT(DISTINCT r.id) as "createdRaffles",
              COUNT(DISTINCT h.B) as "holders"
          from Project p
              left outer join Raffle r on r.creatorProjectId = p.id
              left outer join _holderProject h on h.A = p.id
          where p.verified = true AND r.status = "FINISHED" AND r.ends > ${getMinDateStringForTimeFrame(input.timeframe)}
          group by p.id
            order by totalVolume desc
          LIMIT 50 OFFSET ${50 * input.page};
      `) as TLeaderboardStatsProject[]

      return projectLeaderboardStats

      // const projects = await prisma.project.findMany({
      //   select: {
      //     ...projectDefaultSelect,
      //     _count: {
      //       select: {
      //         benefitingRaffles: true,
      //         createdRaffles: true,
      //         holders: true,
      //       },
      //     },
      //   },
      //   where: { verified: true, isHidden: false },
      //   take: 24,
      //   skip: input.page * 24,
      //   orderBy: {
      //     holders: {
      //       _count: 'desc',
      //     },
      //   },
      // })

      // const projectStats = await getTicketsSoldPerProject()

      // const projectsWithStats = projects.map(project => {
      //   const communityRaffleStats = projectStats.communityRaffleStats.find(stat => stat.pId === project.id)
      //   const createdRaffleStats = projectStats.createdRaffleStats.find(stat => stat.pId === project.id)
      //   return {
      //     ...project,
      //     communityRaffleStats,
      //     createdRaffleStats
      //   }
      // })

      // return projectsWithStats.sort((a, b) => {
      //   const aVal = (a.communityRaffleStats?.totalVolume ?? 0) + (a.createdRaffleStats?.totalVolume ?? 0)
      //   const bVal = (b.communityRaffleStats?.totalVolume ?? 0) + (b.createdRaffleStats?.totalVolume ?? 0)
      //   return bVal - aVal
      // })
    },
  })
  .query('search', {
    input: z.object({
      search: z.string(),
    }),
    resolve: async ({ input }) => getAllBySearch(input.search),
  })
  .query('communityRaffleEnabled', {
    resolve: () => getVerifiedAndCommunityRaffleEnabledProjects(),
  })
  .query('featured.cache', {
    resolve: () => getFeaturedProjects(),
  })
  .query('single', {
    input: z.object({
      id: z.string(),
    }),
    resolve: async ({ input }) => getProjectByPublicId(input.id),
  })
  .query('all-user-holder', {
    input: z.object({
      wallet: z.string(),
    }),
    resolve: ({ input }) => getProjectWhereUserIsHolder(input.wallet),
  })
  .query('community-members', {
    input: z.object({
      publicId: z.string(),
    }),
    async resolve({ input }) {
      const data = await prisma.$queryRaw`
        SELECT u.name, u.profilePictureUrl, u.twitterUsername, 
        u.wallet, u.gradientStart, u.gradientEnd, raffleUsers.raffle_count as rafflesCount
          FROM Project
            JOIN _holderProject ON Project.id = _holderProject.A
            JOIN User u ON _holderProject.B = u.id

            left join (
                SELECT User.id AS "UID", count(Raffle.id) as raffle_count FROM Project
                    JOIN _holderProject ON Project.id = _holderProject.A
                    JOIN User ON _holderProject.B = User.id
                    LEFT JOIN Raffle ON User.id = Raffle.creatorUserId
                    where Project.publicId = ${input.publicId}
                    AND ((Raffle.status != 'CANCELLED' AND Raffle.status != 'IN_CREATION')
                    OR Raffle.status IS NULL)
                    GROUP BY User.id
            ) raffleUsers on u.id = raffleUsers.UID
        WHERE Project.publicId = ${input.publicId}
        ORDER BY raffleUsers.raffle_count desc;
      `

      ;(data as userCommunityMemberType[]).map((user) => {
        user.rafflesCount = user.rafflesCount || 0
        return user
      })

      return data as userCommunityMemberType[]
    },
  })