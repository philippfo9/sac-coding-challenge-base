import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import fetch from 'node-fetch'
import config from '../config/config'
import { raffleType, tokenType } from '../modules/techRaffles/types'

function getNewRaffleMessage(
  raffleName: string,
  creatorName: string,
  ticketCount: number | undefined | null,
  nftImage: string,
  raffleUrl: string,
  nftVideo?: string | null,
  tagRoleId?: string | null
): object {
  return {
    username: 'Monet Bot',
    awatar_url: 'https://storage.monet.community/monet-logo-small.png',
    content: `${
      tagRoleId ? `${tagRoleId} \n` : ''
    }${raffleName} now live on Monet.`,
    embeds: [
      {
        title: `Raffle for ${raffleName}`,
        url: raffleUrl,
        color: 16777215,
        fields: [
          {
            name: 'Tickets left',
            value: ticketCount ?? 'Unlimited',
            inline: true,
          },
          {
            name: 'Created by',
            value: creatorName,
            inline: true,
          },
        ],
        image: {
          url: nftImage,
        },
        /* https://github.com/discord/discord-api-docs/issues/1253
        ...(!!nftVideo ? {
          "video": {
            "url": nftVideo
          }
        } : {
          "image": {
            "url": nftImage
          },
        }), */
        thumbnail: {
          url: 'https://storage.monet.community/monet-logo.png',
        },
        footer: {
          text: 'Powered by Monet',
          icon_url: 'https://storage.monet.community/monet-logo-small.png',
        },
      },
    ],
  }
}

export default async function postDiscordNewRaffle(
  discordWebhook: string,
  raffleName: string,
  creatorName: string,
  ticketCount: number | undefined | null,
  nftImage: string,
  raffleUrl: string,
  nftVideo?: string | null,
  tagRoleId?: string | null
) {
  try {
    console.log(`Posting to Discord new raffle: ${raffleName}`)
    console.log(
      getNewRaffleMessage(
        raffleName,
        creatorName,
        ticketCount,
        nftImage,
        raffleUrl,
        nftVideo,
        tagRoleId
      ) as any
    )

    const res = await fetch(discordWebhook, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(
        getNewRaffleMessage(
          raffleName,
          creatorName,
          ticketCount,
          nftImage,
          raffleUrl,
          nftVideo,
          tagRoleId
        )
      ),
    })

    console.log("Discord response", res.status, res.statusText)

    return res.status
  } catch (e) {
    console.log('Error posting to Discord', e)
    return 404
  }
}

export function getPostWinnersMessage(
  raffle: raffleType,
  winners: raffleType['winners'],
  tagRoleId?: string | null
) {
  return {
    username: 'Monet Bot',
    awatar_url: 'https://storage.monet.community/monet-logo-small.png',
    content: `${tagRoleId ? `${tagRoleId} \n` : ''}${
      raffle.name
    } has just been drawn.`,
    embeds: [
      {
        title: `Raffle Winner(s) for ${raffle.name}`,
        url: `${config.host}/r/${raffle.id}`,
        color: 16777215,
        fields: [
          {
            name: 'Winner(s)',
            value: winners
              .map((w) => `${w.wallet} : <@${w.discordUsername}>`)
              .join('\n'), // TODO: can we tag the discord user?
            inline: true,
          },
        ],
        image: {
          url: raffle.pngUrl ?? raffle.imageUrl,
        },
        /* https://github.com/discord/discord-api-docs/issues/1253
        ...(!!raffle.animationUrl ? {
          "video": {
            "url": raffle.animationUrl
          }
        } : {
          "image": {
            "url": raffle.pngUrl ?? raffle.imageUrl
          },
        }), */
        thumbnail: {
          url: 'https://storage.monet.community/monet-logo.png',
        },
        footer: {
          text: 'Powered by Monet',
          icon_url: 'https://storage.monet.community/monet-logo-small.png',
        },
      },
    ],
  }
}

export async function postDiscordWinners(
  discordWebhook: string,
  raffle: raffleType,
  winners: raffleType['winners'],
  initiator?: string,
  tagRoleId?: string | null
) {
  console.log(`Posting discord winners for raffle=${raffle.id}`, initiator)

  const res = await fetch(discordWebhook, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(getPostWinnersMessage(raffle, winners, tagRoleId)),
  })
}

function getEndingSoonRaffleMessage(
  raffleId: string,
  raffleName: string,
  creatorName: string,
  maxTickets: number | undefined | null,
  ticketsSold: number,
  floorPrice: number,
  ticketPrice: number,
  priceToken: string,
  allowedTokens: string[],
  nftImage: string,
  ends: Date,
  raffleUrl: string,
  nftVideo?: string | null,
  tagRoleId?: string | null
): object {
  return {
    username: 'Monet Bot',
    awatar_url: 'https://storage.monet.community/monet-logo-small.png',
    content: `${
      tagRoleId ? `${tagRoleId} \n` : ''
    }🔥 **Raffle Ending Soon:** ${raffleName}`,
    embeds: [
      {
        title: `${raffleName}`,
        color: 16777215,
        url: raffleUrl,
        fields: [
          {
            name: `Floor Price`,
            value: `${(floorPrice / LAMPORTS_PER_SOL).toFixed(2)} SOL`,
          },
          {
            name: `Tickets left`,
            value: `${maxTickets ? maxTickets - ticketsSold : ''} ${maxTickets ? ' of ' + maxTickets : 'unlimited'}`,
            inline: true,
          },
          {
            name: `Ticket Price`,
            value: `${ticketPrice} ${priceToken}`,
            inline: true,
          },
          {
            name: `Tickets available in`,
            value: `${allowedTokens.join(', ')}`,
          },
          {
            name: `Hosted by`,
            value: creatorName,
          },
          {
            name: `Ends in`,
            value: `<t:${Math.floor(ends.getTime() / 1000)}:R>`,
          },
        ],
        image: {
          url: nftImage,
        },
        thumbnail: {
          url: 'https://storage.monet.community/monet-logo.png',
        },
        footer: {
          text: 'Powered by Monet',
          icon_url: 'https://storage.monet.community/monet-logo-small.png',
        },
      },
    ],
  }
}
 
export async function postDiscordEndingSoonRaffle(
  discordWebhook: string,
  raffleId: string,
  raffleName: string,
  creatorName: string,
  maxTickets: number | undefined | null,
  ticketsSold: number,
  floorPrice: number,
  ticketPrice: number,
  priceToken: string,
  allowedTokens: string[],
  nftImage: string,
  ends: Date,
  raffleUrl: string,
  nftVideo?: string | null,
  tagRoleId?: string | null
) {
  try {
    console.log(`Posting to Discord ending soon raffle: ${raffleName}`)
    const msg = getEndingSoonRaffleMessage(
      raffleId,
      raffleName,
      creatorName,
      maxTickets,
      ticketsSold,
      floorPrice,
      ticketPrice,
      priceToken,
      allowedTokens,
      nftImage,
      ends,
      raffleUrl,
      nftVideo,
      tagRoleId
    )

    const res = await fetch(discordWebhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(msg),
    })

    console.log("body:", res.body)
    console.log("Discord response", res.status, res.statusText)

    return res.status
  } catch (e) {
    console.log('Error posting to Discord', e)
    return 404
  }
}
