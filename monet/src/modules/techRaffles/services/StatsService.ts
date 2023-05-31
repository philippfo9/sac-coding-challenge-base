import { format, subDays, subMonths } from 'date-fns'
import prisma from '../../../lib/prisma'
import { getStandardFormattedDateTime } from '../../../utils/dateUtil';
import { getRaffleOnChainDataRetried } from '../raffleOnChainUtils';
import { endedRaffleType, OnChainRaffleType } from '../types';


type TVolumeResponse = { totalTicketsSold: number; totalVolumeInSol: number; totalEstimatedRevenueInSol: number; totalEstimatedRevenueInSolForSAC: number  }

export async function getPlatformStats() {
  const totalVolumeResponse = (await prisma.$queryRaw`
    select SUM(r.ticketsSoldFinal) AS "totalTicketsSold", 
    SUM(r.ticketsSoldFinal * IFNULL(r.estimateTicketPriceInSol, 0)) AS "totalVolumeInSol",
    SUM(r.ticketsSoldFinal * IFNULL(r.estimateTicketPriceInSol, 0) * r.feeAmount)  AS "totalEstimatedRevenueInSol",
    SUM(r.ticketsSoldFinal * IFNULL(r.estimateTicketPriceInSol, 0) * r.feeAmount) * 0.6  AS "totalEstimatedRevenueInSolForSAC" 
    from Raffle r 
    where r.status = 'FINISHED';
  `) as TVolumeResponse[]

  const monthlyVolumeResponse = (await prisma.$queryRaw`
    select SUM(r.ticketsSoldFinal) AS "totalTicketsSold", 
    SUM(r.ticketsSoldFinal * IFNULL(r.estimateTicketPriceInSol, 0)) AS "totalVolumeInSol",
    SUM(r.ticketsSoldFinal * IFNULL(r.estimateTicketPriceInSol, 0) * r.feeAmount)  AS "totalEstimatedRevenueInSol",
    SUM(r.ticketsSoldFinal * IFNULL(r.estimateTicketPriceInSol, 0) * r.feeAmount) * 0.6  AS "totalEstimatedRevenueInSolForSAC"
    from Raffle r 
    where r.status = 'FINISHED' and ends > ${getStandardFormattedDateTime(
      subMonths(new Date(), 1)
    )};
  `) as TVolumeResponse[]

  const weeklyVolumeResponse = (await prisma.$queryRaw`
    select SUM(r.ticketsSoldFinal) AS "totalTicketsSold", 
    SUM(r.ticketsSoldFinal * IFNULL(r.estimateTicketPriceInSol, 0)) AS "totalVolumeInSol", 
    SUM(r.ticketsSoldFinal * IFNULL(r.estimateTicketPriceInSol, 0) * r.feeAmount)  AS "totalEstimatedRevenueInSol",
    SUM(r.ticketsSoldFinal * IFNULL(r.estimateTicketPriceInSol, 0) * r.feeAmount) * 0.6  AS "totalEstimatedRevenueInSolForSAC"
    from Raffle r 
    where r.status = 'FINISHED' and ends > ${getStandardFormattedDateTime(
      subDays(new Date(), 7)
    )};
  `) as TVolumeResponse[]

  const previousWeeklyVolumeResponse = (await prisma.$queryRaw`
    select SUM(r.ticketsSoldFinal) AS "totalTicketsSold", 
    SUM(r.ticketsSoldFinal * IFNULL(r.estimateTicketPriceInSol, 0)) AS "totalVolumeInSol", 
    SUM(r.ticketsSoldFinal * IFNULL(r.estimateTicketPriceInSol, 0) * r.feeAmount)  AS "totalEstimatedRevenueInSol",
    SUM(r.ticketsSoldFinal * IFNULL(r.estimateTicketPriceInSol, 0) * r.feeAmount) * 0.6  AS "totalEstimatedRevenueInSolForSAC"
    from Raffle r 
    where r.status = 'FINISHED' and ends < ${getStandardFormattedDateTime(
      subDays(new Date(), 7)
    )} and ends > ${getStandardFormattedDateTime(
      subDays(new Date(), 14)
    )};
    `) as TVolumeResponse[]

  const last3DaysResponse = (await prisma.$queryRaw`
    select SUM(r.ticketsSoldFinal) AS "totalTicketsSold", 
    SUM(r.ticketsSoldFinal * IFNULL(r.estimateTicketPriceInSol, 0)) AS "totalVolumeInSol", 
    SUM(r.ticketsSoldFinal * IFNULL(r.estimateTicketPriceInSol, 0) * r.feeAmount)  AS "totalEstimatedRevenueInSol",
    SUM(r.ticketsSoldFinal * IFNULL(r.estimateTicketPriceInSol, 0) * r.feeAmount) * 0.6  AS "totalEstimatedRevenueInSolForSAC"
    from Raffle r 
    where r.status = 'FINISHED' and ends > ${getStandardFormattedDateTime(
      subDays(new Date(), 3)
    )};
  `) as TVolumeResponse[]

  const totalRafflesCreated = await prisma.raffle.count({
    where: { status: 'FINISHED' },
  })
  const monthlyRafflesCreated = await prisma.raffle.count({
    where: { status: 'FINISHED', ends: { gte: subMonths(new Date(), 1) } },
  })
  const weeklyRafflesCreated = await prisma.raffle.count({
    where: { status: 'FINISHED', ends: { gte: subDays(new Date(), 7) } },
  })

  const last3DaysCreated = await prisma.raffle.count({
    where: { status: 'FINISHED', ends: { gte: subDays(new Date(), 3) } },
  })

  const totalVerifiedProjects = await prisma.project.count({
    where: { verified: true },
  })

  const totalUserCount = await prisma.user.count()
  const weeklyNewUsers = await prisma.user.count({where: {createdAt: {gte: subDays(new Date(), 7)}}})
  const last3DaysNewUsers = await prisma.user.count({where: {createdAt: {gte: subDays(new Date(), 3)}}})
  const monthlyNewUsers = await prisma.user.count({where: {createdAt: {gte: subMonths(new Date(), 1)}}})
  const totalUsersWithRaffles = await prisma.user.count({where: {createdRaffles: {some: {id: {not: undefined}}}}})
  const totalUsersWithDiscordLinked = await prisma.user.count({where: {discordRefreshToken: {not: ''}}})
  const totalUsersWithTwitterLinked = await prisma.user.count({where: {twitterRefreshToken: {not: ''}}})

  console.log({
    totalVolumeResponse,
    monthlyVolumeResponse,
    weeklyVolumeResponse,
    totalVerifiedProjects,
    totalRafflesCreated,
    monthlyRafflesCreated,
    weeklyRafflesCreated,
    totalUserCount,
    weeklyNewUsers,
    last3DaysNewUsers,
    monthlyNewUsers
  })

  console.log('growth', {
    weeklyVolume: weeklyVolumeResponse[0].totalVolumeInSol,
    previous: previousWeeklyVolumeResponse[0].totalVolumeInSol,
    weeklyGrowth: (weeklyVolumeResponse[0].totalVolumeInSol - previousWeeklyVolumeResponse[0].totalVolumeInSol) / previousWeeklyVolumeResponse[0].totalVolumeInSol * 100
  });
  

  return {
    totalVolume: totalVolumeResponse[0] ? totalVolumeResponse[0] : undefined,
    monthlyVolume: monthlyVolumeResponse[0] ? monthlyVolumeResponse[0] : undefined,
    weeklyVolume: weeklyVolumeResponse[0] ? weeklyVolumeResponse[0] : undefined,
    threeDayVolume: last3DaysResponse[0] ? last3DaysResponse[0] : undefined,
    weeklyGrowth: {
      volume: (weeklyVolumeResponse[0].totalVolumeInSol - previousWeeklyVolumeResponse[0].totalVolumeInSol) / previousWeeklyVolumeResponse[0].totalVolumeInSol * 100,
      revenue: (weeklyVolumeResponse[0].totalEstimatedRevenueInSol - previousWeeklyVolumeResponse[0].totalEstimatedRevenueInSol) / previousWeeklyVolumeResponse[0].totalEstimatedRevenueInSol * 100,
      revenueMonet: (weeklyVolumeResponse[0].totalEstimatedRevenueInSolForSAC - previousWeeklyVolumeResponse[0].totalEstimatedRevenueInSolForSAC) / previousWeeklyVolumeResponse[0].totalEstimatedRevenueInSolForSAC * 100,
      ticketsSold: (weeklyVolumeResponse[0].totalTicketsSold - previousWeeklyVolumeResponse[0].totalTicketsSold) / previousWeeklyVolumeResponse[0].totalTicketsSold * 100,
    },
    totalVerifiedProjects,
    totalRafflesCreated,
    monthlyRafflesCreated,
    weeklyRafflesCreated,
    last3DaysCreated,
    totalUserCount,
    last3DaysNewUsers,
    weeklyNewUsers,
    monthlyNewUsers,
    totalUsersWithRaffles,
    totalUsersWithDiscordLinked,
    totalUsersWithTwitterLinked
  }
}
