import prisma from '../../../lib/prisma'
import { getRandomGradient } from './GradientService'
import { shuffle } from '../../../utils/utils'
import { number } from 'zod'

export type createProjectType = {
  publicId: string
  fundsWallet: string
  platformName: string
  communityName: string
  profilePictureUrl?: string
  bannerUrl?: string
  twitterUserHandle?: string
  discordInviteLink?: string
  discordGuildId?: string
  magicEdenSlug?: string
  websiteUrl?: string
  verified?: boolean
  contactDiscordId?: string
}

export const createProject = (data: createProjectType) => {
  const gradient = getRandomGradient()

  return prisma.project.create({
    data: {
      ...data,
      gradientStart: gradient.start,
      gradientEnd: gradient.end,
    },
  })
}

export type updateProjectType = {
  publicId: string
  fundsWallet: string
  platformName: string
  communityName: string
  profilePictureUrl?: string
  bannerUrl?: string
  magicEdenSlug?: string
  websiteUrl?: string
  contactDiscordId?: string
}

export const updateProject = (id: string, data: updateProjectType) =>
  prisma.project.update({
    where: {
      id,
    },
    data,
  })

export const addUserToProject = async (
  userId: string,
  projectId: string,
  assignedBy: string,
  admin?: boolean
) =>
  await prisma.projectUsers.create({
    data: {
      userId,
      projectId,
      assignedBy,
      admin,
    },
  })

export const removeUserFromProject = async (
  userId: string,
  projectId: string
) =>
  await prisma.projectUsers.delete({
    where: {
      projectId_userId: {
        userId,
        projectId,
      },
    },
  })

export const projectDefaultSelect = {
  id: true,
  publicId: true,
  platformName: true,
  communityName: true,
  profilePictureUrl: true,
  gradientStart: true,
  gradientEnd: true,
  bannerUrl: true,
  verifyHoldersBy: true,
  verified: true,
  twitterUserHandle: true,
  discordInviteLink: true,
  magicEdenSlug: true,
  websiteUrl: true,
  fundsWallet: true,
}

export const getAllProjectsPaginated = (page: number) =>
  prisma.project.findMany({
    select: projectDefaultSelect,
    where: { verified: true, isHidden: false },
    take: 24,
    skip: page * 24,
    orderBy: {
      holders: {
        _count: 'desc',
      },
    },
  })

type TTicketsSoldPerProject = {
  ticketsSold: number
  totalVolume: number
  pId: string
}

export async function getTicketsSoldPerProject(): Promise<{
  communityRaffleStats: TTicketsSoldPerProject[]
  createdRaffleStats: TTicketsSoldPerProject[]
}> {
  const communityRaffleStats = (await prisma.$queryRaw`
  select SUM(r.ticketsSoldFinal) as "ticketsSold", 
         SUM(r.ticketsSoldFinal * IFNULL(r.estimateTicketPriceInSol, 0)) as "totalVolume",
          p.id AS "pId" from Project p
    inner join _benefitingRaffles bR on p.id = bR.A
    inner join Raffle r on r.id = bR.B
  group by p.id;
 `) as TTicketsSoldPerProject[]
  console.log(communityRaffleStats)

  const createdRaffleStats = (await prisma.$queryRaw`
  select SUM(r.ticketsSoldFinal) as "ticketsSold", 
         SUM(r.ticketsSoldFinal * IFNULL(r.estimateTicketPriceInSol, 0)) as "totalVolume",
          p.id AS "pId" from Project p
    inner join Raffle r on r.creatorProjectId = p.id
  group by p.id;
 `) as TTicketsSoldPerProject[]
  console.log(createdRaffleStats)
  return {
    communityRaffleStats,
    createdRaffleStats,
  }
}

export const getAllBySearch = (search: string) => {
  return prisma.project.findMany({
    where: {
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
      verified: true,
      isHidden: false,
    },
    take: 2,
    select: {
      platformName: true,
      gradientStart: true,
      gradientEnd: true,
      communityName: true,
      publicId: true,
      profilePictureUrl: true,
    },
    orderBy: {
      holders: {
        _count: 'desc',
      },
    },
  })
}

export const getVerifiedAndCommunityRaffleEnabledProjects = () =>
  prisma.project.findMany({
    where: {
      verified: true,
      isHidden: false,
      verifyHoldersBy: {
        not: 'DISABLED',
      },
    },
    select: projectDefaultSelect,
  })

export const getProjectIdByPublicId = async (publicId: string) =>
  (
    await prisma.project.findUnique({
      select: { id: true },
      where: { publicId },
      rejectOnNotFound: true,
    })
  ).id
export const getProjectByPublicId = (publicId: string) =>
  prisma.project.findUnique({
    select: projectDefaultSelect,
    where: { publicId },
  })
export const getProjectByIdSafe = (id: string) =>
  prisma.project.findUnique({
    select: projectDefaultSelect,
    where: { id },
    rejectOnNotFound: true,
  })

export const getProjectWhereUserIsHolder = (wallet: string) =>
  prisma.project.findMany({
    where: {
      holders: { some: { wallet } },
      verified: true,
      verifyHoldersBy: { not: 'DISABLED' },
    },
    select: projectDefaultSelect,
  })

export const getProjectWhereUserIsHolderAndCommunityRaffleEnabled = (
  wallet: string
) =>
  prisma.project.findMany({
    where: {
      verified: true,
      verifyHoldersBy: {
        not: 'DISABLED',
      },
      holders: { some: { wallet } },
    },
    select: projectDefaultSelect,
  })

export const getProjectWhereUserIsAdmin = (userId: string) =>
  prisma.project.findMany({
    where: { users: { some: { userId } }, isHidden: false },
    select: projectDefaultSelect,
  })

export const getFeaturedProjects = async () => {
  const popularProjects = await prisma.project.findMany({
    where: {
      verified: true,
      isHidden: false,
    },
    select: projectDefaultSelect,
    take: 8,
    orderBy: {
      holders: {
        _count: 'desc',
      },
    },
  })
  const popularProjectsIds = popularProjects.map((p) => p.id)

  const randomTakeCount = 12 - popularProjectsIds.length

  const randomPick = (values: string[]) => {
    const index = Math.floor(Math.random() * values.length)
    return values[index]
  }
  const itemCount = await prisma.project.count({
    where: {
      id: { notIn: popularProjectsIds },
      verified: true,
      isHidden: false,
    },
  })
  const skip = Math.max(
    0,
    Math.floor(Math.random() * itemCount) - randomTakeCount
  )
  const orderBy = randomPick([
    'id',
    'publicId',
    'fundsWallet',
    'platformName',
    'communityName',
    'profilePictureUrl',
    'bannerUrl',
  ])
  const orderDir = randomPick(['asc', 'desc'])

  const randomProjects = await prisma.project.findMany({
    where: {
      id: { notIn: popularProjectsIds },
      verified: true,
      isHidden: false,
    },
    take: randomTakeCount,
    skip: skip,
    orderBy: { [orderBy]: orderDir },
    select: {
      ...projectDefaultSelect,
      _count: {
        select: { benefitingRaffles: true },
      },
    },
  })

  return shuffle([...popularProjects, ...randomProjects])
}
