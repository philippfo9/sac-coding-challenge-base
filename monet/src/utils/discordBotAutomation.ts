import asyncBatch from 'async-batch'
import config from '../config/config'
import prisma from '../lib/prisma'
import { getRunningVerifiedRafflesWithoutCreatedTweet, getRunningVerifiedRafflesWithoutEndingDiscordMessage, getRunningVerifiedRafflesWithoutEndingTweet, postDiscordEndingSoonRaffleAndUpdateStatus } from '../modules/techRaffles/services/RaffleService'
import postDiscordNewRaffle, { postDiscordEndingSoonRaffle } from './discordBot'


export async function postDiscordEndingSoonRaffles() {
  const raffles = await getRunningVerifiedRafflesWithoutEndingDiscordMessage()

  console.log(raffles.length)

  const rafflesPosted = await asyncBatch(raffles, async (raffle) => {

    if (!raffle) {
      console.log('No raffle found', raffle);
      return
    }

    if (!raffle.raffleEndPostedToDiscord) {

        const creatorProject = raffle.creatorProject 

        if (creatorProject?.discordNewRafflesHook) {

          const success = await postDiscordEndingSoonRaffleAndUpdateStatus(
            creatorProject?.id,
            creatorProject.discordNewRafflesHook,
            raffle.id,
            raffle.name,
            raffle.creatorProject?.communityName ?? raffle.creatorUser!.name,
            raffle.maxTickets,
            raffle.ticketsSold,
            raffle.collection?.floorPrice ?? 0,
            raffle.ticketPrice,
            raffle.ticketPriceToken.symbol,
            raffle.allowedPurchaseTokens.map(t => t.token.symbol),
            raffle.pngUrl ?? raffle.imageUrl,
            raffle.ends,
            `${config.host}/r/${raffle.id}`,
            raffle.animationUrl,
            creatorProject.discordNewRafflesRoleId,
          )

          if (success) { 
            console.log('Successfully posted ending soon discord for raffle=', raffle.id, 'community=', creatorProject.communityName)
          } else {
            console.error('Error posting ending soon discord for raffle=', raffle.id, 'community=', creatorProject.communityName)
          }
        }
      
        for (const p of raffle.benefitingProjects) {
          console.log(p.communityName)

          try {
            if (p.discordNewRafflesHook) {
              const success = await postDiscordEndingSoonRaffleAndUpdateStatus(
                  p.id,
                  p.discordNewRafflesHook,
                  raffle.id,
                  raffle.name,
                  raffle.creatorProject?.communityName ?? raffle.creatorUser!.name,
                  raffle.maxTickets,
                  raffle.ticketsSold,
                  raffle.collection?.floorPrice ?? 0,
                  raffle.ticketPrice,
                  raffle.ticketPriceToken.symbol,
                  raffle.allowedPurchaseTokens.map(t => t.token.symbol),
                  raffle.pngUrl ?? raffle.imageUrl,
                  raffle.ends,
                  `${config.host}/r/${raffle.id}`,
                  raffle.animationUrl,
                  p.discordNewRafflesRoleId,
              )

              if (success) { 
                console.log('Successfully posted ending soon discord for raffle=', raffle.id, 'community=', p.communityName)
              } else {
                console.error('Error posting ending soon discord for raffle=', raffle.id, 'community=', p.communityName)
              }
            }
          }
          catch (e) {
            console.log('Error posting ending soon discord for raffle=', raffle.id, ' for community=', p.communityName, ' error=', e);
          }
        }

        try {
          return await prisma.raffle.update({
            where: {
              id: raffle.id
            },
            data: {
              raffleEndPostedToDiscord: true
            }
          })
        } catch (e) {
          console.log('Error updating raffle=', raffle.id, 'error=', e);
        } 
    }
  }, 4)

  console.log('Posted', rafflesPosted.length, 'raffles');
}