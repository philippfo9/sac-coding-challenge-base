import axios from "axios";
import {TRPCError} from "@trpc/server";
import {removeDiscordFromUser, removeTwitterFromUser} from "../services/UserService";
import { getRedirectBaseUrl } from '../../../config/config';
import reattempt from "reattempt";
import prisma from "../../../lib/prisma";
import {removeAllHoldersFromUser} from "../services/HolderService";

const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID!
const TWITTER_REDIRECT_URI = getRedirectBaseUrl() + '/verify/twitter'
const TWITTER_PROJECT_REDIRECT_URI = getRedirectBaseUrl() + '/verify/twitterProject'

export const getTwitterRefreshAndAccessToken = async (code: string, codeVerifier: string) => {
  try {
    return (await axios.post<{ access_token: string, refresh_token: string }>('https://api.twitter.com/2/oauth2/token', new URLSearchParams({
      "client_id": TWITTER_CLIENT_ID,
      "code": code,
      "grant_type": "authorization_code",
      "code_verifier": codeVerifier,
      "redirect_uri": TWITTER_REDIRECT_URI,
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })).data
  } catch (e) {
    console.log(e);
    throw new TRPCError({code: 'BAD_REQUEST', message: 'Auth code or code verifier incorrect'})
  }
}

export const getTwitterProjectAccessToken = async (code: string, codeVerifier: string) => {
  try {
    return (await axios.post<{ access_token: string }>('https://api.twitter.com/2/oauth2/token', new URLSearchParams({
      "client_id": TWITTER_CLIENT_ID,
      "code": code,
      "grant_type": "authorization_code",
      "code_verifier": codeVerifier,
      "redirect_uri": TWITTER_PROJECT_REDIRECT_URI,
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })).data
  } catch {
    throw new TRPCError({code: 'BAD_REQUEST', message: 'Auth code or code verifier incorrect'})
  }
}

export const getTwitterAccessTokenByRefreshToken = async (refreshToken: string, wallet: string) => {
  try {
    const response = await reattempt.run({times: 2, delay: 10 * 1000}, async () => {
      return (await axios.post<{ access_token: string, refresh_token: string }>('https://api.twitter.com/2/oauth2/token', new URLSearchParams({
        "client_id": TWITTER_CLIENT_ID,
        "refresh_token": refreshToken,
        "grant_type": "refresh_token",
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })).data
    });

    if (!response.refresh_token || !response.access_token) {
      console.log(response);
      throw new Error();
    }

    prisma.user.update({
      where: {
        wallet: wallet
      },
      data: {
        twitterRefreshToken: response.refresh_token
      }
    }).then(() => console.log('twitter refresh token updated; wallet =', wallet, 'old refresh token=', refreshToken, 'new refresh token=', response.refresh_token))
    return response.access_token;
  } catch (e: any) {
    console.log('discord refresh token failed; wallet =', wallet, 'old refresh token=', refreshToken, 'error=', e?.response?.status, e?.response?.statusText)
    if (e?.response?.status === 400) {
      // Means we don't have access to the account anymore. Therefore remove it
      await removeTwitterFromUser(wallet);
    }

    throw new TRPCError({code: 'UNAUTHORIZED', message: 'Could not refresh access token'});
  }
}

export const getTwitterUser = async (accessToken: string) => (await axios.get<{data: {id: number, name: string, username: string}}>('https://api.twitter.com/2/users/me', {
  headers: {
    authorization: `Bearer ${accessToken}`,
  }
})).data.data

export const getTwitterProfilePicture = async (accessToken: string, username: string) => (await axios.get<{data: {profile_image_url?: string}}>(`https://api.twitter.com/2/users/by/username/${username}?user.fields=profile_image_url`, {
  headers: {
    authorization: `Bearer ${accessToken}`,
  }
})).data.data