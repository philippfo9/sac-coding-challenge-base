import asyncBatch from 'async-batch'
import config from '../config/config'
import prisma from '../lib/prisma'
import { getRunningVerifiedRafflesWithoutCreatedTweet, getRunningVerifiedRafflesWithoutEndingTweet, postDiscordNewRaffleAndUpdateStatus } from '../modules/techRaffles/services/RaffleService'
import postDiscordNewRaffle from './discordBot'
import tweetNewRaffle, { tweetEndingSoonRaffle } from './twitterBot'

export async function tweetNewlyStartedRaffles() {
  const raffles = await getRunningVerifiedRafflesWithoutCreatedTweet()

  const rafflesTweeted = await asyncBatch(raffles, async (raffle) => {
    if (!raffle) {
      console.log('No raffle found')
      return
    }

    const creatorTwitterAcc = raffle.isUserRaffle ? raffle.creatorUser?.twitterId : raffle.creatorProject?.twitterUserHandle
    if (!creatorTwitterAcc) {
      console.log('No twitter account found for raffle', raffle.id)
      return
    }

    if (!raffle.createdTweetUrl) {
      try {
        const url = await tweetNewRaffle(raffle.name, raffle.newRaffleImageUrl as string, creatorTwitterAcc, raffle.id)
        if (!!url) {
          return await prisma.raffle.update({
            where: {
              id: raffle.id
            },
            data: {
              createdTweetUrl: url
            }
          })
        }
      } catch (e) {
        console.log('Error tweeting raffle=', raffle.id, 'error=', e);
      }
    }

    if (!raffle.raffleStartPostedToDiscord && !!raffle.creatorProject?.discordNewRafflesHook) {
      await postDiscordNewRaffleAndUpdateStatus(
        raffle.creatorProject.id,
        raffle.creatorProject.discordNewRafflesHook,
        raffle.name,
        raffle.creatorProject?.communityName,
        raffle.maxTickets,
        raffle.pngUrl ?? raffle.imageUrl,
        `${config.host}/r/${raffle.id}`,
        raffle.animationUrl,
        raffle.creatorProject?.discordNewRafflesRoleId
      )
      await prisma.raffle.update({
        where: {id: raffle.id},
        data: {raffleStartPostedToDiscord: true},
      })
    }
   
    
  }, 4)

  console.log('Tweeted', rafflesTweeted.length, 'raffles');
  
  return rafflesTweeted
}


export async function tweetEndingSoonRaffles() {
  const raffles = await getRunningVerifiedRafflesWithoutEndingTweet()

  console.log('raffles', raffles.length);

  const rafflesTweeted = await asyncBatch(raffles, async (raffle) => {
    if (!raffle) {
      console.log('No raffle found')
      return
    }

    const creatorTwitterAcc = raffle.isUserRaffle ? raffle.creatorUser?.twitterId : raffle.creatorProject?.twitterUserHandle
    if (!creatorTwitterAcc) {
      console.log('No twitter account found for raffle', raffle.id)
      return
    }

    if (!raffle.endingSoonTweetUrl) {
      try {
        const url = await tweetEndingSoonRaffle(raffle.id, raffle.name, raffle.maxTickets, raffle.ticketsSold, raffle.ticketPrice, raffle.ticketPriceToken.symbol, raffle.allowedPurchaseTokens.map(t => t.token.symbol), raffle.imageUrl, creatorTwitterAcc)
        if (!!url) {
          return await prisma.raffle.update({
            where: {
              id: raffle.id
            },
            data: {
              endingSoonTweetUrl: url
            }
          })
        }
      } catch (e) {
        console.log('Error tweeting raffle=', raffle.id, 'error=', e);
      }
    }
    
  }, 4)

  console.log('Tweeted', rafflesTweeted.length, 'raffles');

  return rafflesTweeted
}