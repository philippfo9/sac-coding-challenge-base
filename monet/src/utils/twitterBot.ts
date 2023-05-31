import axios from 'axios'
import { TwitterApi } from 'twitter-api-v2'
import {
  createRaffleEndingSoonImage,
  createRaffleImage,
  createVerifiedCommunityImage,
  createWinnerImage,
  downloadImage
} from './twitterImages'

const TWITTER_ACCOUNT = 'MonetSAC'
const twitterMonetSAC = new TwitterApi({
  appKey: process.env.TWITTER_MONET_APP_KEY as string,
  appSecret: process.env.TWITTER_MONET_APP_SECRET as string,
  accessToken: process.env.TWITTER_MONET_ACCESS_TOKEN as string,
  accessSecret: process.env.TWITTER_MONET_ACCESS_TOKEN_SECRET as string,
})
const twitterMonetLive = new TwitterApi({
  appKey: process.env.TWITTER_MONET_LIVE_APP_KEY as string,
  appSecret: process.env.TWITTER_MONET_LIVE_APP_SECRET as string,
  accessToken: process.env.TWITTER_MONET_LIVE_ACCESS_TOKEN as string,
  accessSecret: process.env.TWITTER_MONET_LIVE_ACCESS_TOKEN_SECRET as string,
})
twitterMonetSAC.readWrite
twitterMonetLive.readWrite

function getTweetUrlFromId(id: string) {
  return `https://twitter.com/${TWITTER_ACCOUNT}/status/${id}`
}

export default async function tweetNewRaffle(raffleName: string, newRaffleImgUrl: string, creatorTwitterAccount: string, raffleId: string): Promise<string | undefined> {
  try {
    const img = await downloadImage(newRaffleImgUrl)
    const mediaId = await twitterMonetLive.v1.uploadMedia(img, {mimeType: 'png'})
    
    const { data: tweet } = await twitterMonetLive.v2.tweet(
      `${raffleName} now live on Monet.\nCreated by ${creatorTwitterAccount}\n\nmonet.community/r/${raffleId}`, 
      {
        media: { media_ids: [mediaId] },
      }
    )
  
    console.log(`Tweet created #${tweet.id}: `, tweet.text)
    return getTweetUrlFromId(tweet.id)
  } catch(err) {
    console.error('Error tweeting raffle', err)
    return undefined;
  }
}

export async function twitterCreateWinnerImage(raffleName: string, nftImage: string, winnerTwitterAccount?: string): Promise<string> {
  const img = await createWinnerImage(raffleName, nftImage);
  const mediaId = await twitterMonetLive.v1.uploadMedia(img, {mimeType: 'png'})
  const { data: tweet } = await twitterMonetLive.v2.tweet(
    `${raffleName} just won ${winnerTwitterAccount ? `by @${winnerTwitterAccount}` : ''}on @MonetSAC 🙌`,
    {
      media: { media_ids: [mediaId] },
    }
  )
  
  console.log(`Tweet created #${tweet.id}: `, tweet.text)
  return getTweetUrlFromId(tweet.id)
}

export async function tweetVerifiedCommunity(publicId: string, communityName: string, logoUrl: string, communityTwitterAccount: string): Promise<string> {
  const img = await createVerifiedCommunityImage(communityName, logoUrl);
  const mediaId = await twitterMonetSAC.v1.uploadMedia(img, {mimeType: 'png'})

  const { data: tweet } = await twitterMonetSAC.v2.tweet(
    `Welcome @${communityTwitterAccount}. \nYou are now a verified community on @MonetSAC!\n\nmonet.community/p/${publicId}`,
    {
      media: { media_ids: [mediaId] },
    }
  )
  
  console.log(`Tweet created #${tweet.id}: `, tweet.text)
  return getTweetUrlFromId(tweet.id)
}


export async function tweetRaffleWinner(raffleName: string, imageUrl: string, winnerTwitterAccount: string): Promise<string> {
  console.log('Downloading image from ', imageUrl)
  const imgResp = await axios.get(imageUrl, {responseType: 'arraybuffer'})
  const mediaId = await twitterMonetLive.v1.uploadMedia(imgResp.data, {mimeType: 'png'})

  const { data: tweet } = await twitterMonetLive.v2.tweet(
    `${raffleName} just won by @${winnerTwitterAccount} on @MonetSAC 🙌`,
    {
      media: { media_ids: [mediaId] },
    }
  )
  
  console.log(`Tweet created #${tweet.id}: `, tweet.text)
  return getTweetUrlFromId(tweet.id)
}

export async function tweetEndingSoonRaffle(raffleId: string, raffleName: string, maxTickets: number|undefined|null, ticketsSold: number|undefined|null, ticketPrice: number, priceToken: string, ticketTokens: string[], nftImage: string, creatorTwitterAccount: string): Promise<string | undefined> {
  try {
    const img = await createRaffleEndingSoonImage(raffleName, maxTickets as number, ticketsSold as number, nftImage)
    const mediaId = await twitterMonetSAC.v1.uploadMedia(img, {mimeType: 'png'})
    
    const { data: tweet } = await twitterMonetSAC.v2.tweet(
      `Hot Raffle: for ${raffleName} is ending soon on Monet 🔥
      \nTickets available in ${ticketTokens.join(', ')}
      \nTicket Price ${ticketPrice} ${priceToken}
      \n\nmonet.community/r/${raffleId}`, 
      {
        media: { media_ids: [mediaId] },
      }
    )
  
    console.log(`Tweet created #${tweet.id}: `, tweet.text)
    return getTweetUrlFromId(tweet.id)
  } catch(err) {
    console.error('Error tweeting raffle', err)
  }
}