import axios from "axios";
import { TRPCError } from "@trpc/server";
import prisma from "../../../lib/prisma";
import { getRedirectBaseUrl } from '../../../config/config';
import fetch from 'node-fetch';
import { removeDiscordFromUser } from '../services/UserService';
import { removeAllHoldersFromUser } from '../services/HolderService';
import reattempt from 'reattempt';

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID!
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET!
const DISCORD_REDIRECT_URI = getRedirectBaseUrl() + '/verify/discord'

export async function getGuildIdFromDiscordLink(discordLink: string) {
  const discordLinkParts = discordLink.split('.gg/')
  const inviteCode = discordLinkParts[discordLinkParts.length - 1]
  const getGuildByInviteCodeUri = `https://discord.com/api/invites/${inviteCode}`
  const result = await axios.get(getGuildByInviteCodeUri)
  console.log('got response', result.data, '\n');

  const guildId = result.data.guild.id
  console.log({guildId});

  return guildId
}

export const getDiscordAccessTokenByRefreshToken = async (refreshToken: string, wallet: string) => {
  try {
    const response = await reattempt.run({times: 2, delay: 10 * 1000}, async () => {
      return (await axios.post<{ access_token?: string, refresh_token?: string }>('https://discord.com/api/v10/oauth2/token', new URLSearchParams({
        "client_id": DISCORD_CLIENT_ID,
        "client_secret": DISCORD_CLIENT_SECRET,
        "refresh_token": refreshToken,
        "grant_type": "refresh_token",
        "scope": "identify guilds guilds.members.read",
        "redirect_uri": DISCORD_REDIRECT_URI,
      }).toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })).data;
    })

    if (!response.refresh_token || !response.access_token) {
      console.log(response);
      throw new Error();
    }
    prisma.user.update({
      where: {
        wallet: wallet
      },
      data: {
        discordRefreshToken: response.refresh_token
      }
    }).then(() => console.log('discord refresh token updated; wallet =', wallet, 'old refresh token=', refreshToken, 'new refresh token=', response.refresh_token))
    return response.access_token;
  } catch (e: any) {
    console.log('discord refresh token failed; wallet =', wallet, 'old refresh token=', refreshToken, 'error=', e?.response?.status, e?.response?.statusText)
    if (e?.response?.status === 400) {
      // Means we don't have access to the account anymore. Therefore remove it
      await removeDiscordFromUser(wallet);
      await removeAllHoldersFromUser(wallet);
    }

    throw new TRPCError({code: 'UNAUTHORIZED', message: 'Could not refresh access token'});
  }
}

export const getDiscordRefreshAndAccessTokenByCode = async (code: string) => {
  try {
    return (await axios.post<{ access_token: string, refresh_token: string }>('https://discord.com/api/oauth2/token', new URLSearchParams({
      "client_id": DISCORD_CLIENT_ID,
      "client_secret": DISCORD_CLIENT_SECRET,
      "code": code,
      "grant_type": "authorization_code",
      "scope": "identify guilds guilds.members.read",
      "redirect_uri": DISCORD_REDIRECT_URI,
    }).toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })).data;
  } catch {
    throw new TRPCError({code: 'BAD_REQUEST', message: 'Auth code incorrect'})
  }
}

export const getDiscordUser = async (accessToken: string) => (await axios.get<{ username: string, discriminator: string, id: number }>('https://discord.com/api/users/@me', {
  headers: {
    authorization: `Bearer ${accessToken}`,
  }
})).data

export const getDiscordCurrentUserGuildMember = async (guildId: string, accessToken: string) => (await (await fetch(`https://discord.com/api/users/@me/guilds/${guildId}/member`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
})).json()) as { roles?: string[], message?: string, code?: number, retry_after?: number };

export const getDiscordCurrentUserGuilds = async (accessToken: string) => (await (await fetch(`https://discord.com/api/users/@me/guilds`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
  },
})).json()) as {
  "id": string,
  "name": string,
  "icon": string,
  "owner": boolean,
  "permissions": any,
  "features": string[]
}[]