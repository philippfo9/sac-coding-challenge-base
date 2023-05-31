import axios from 'axios';
import { solToken } from '../../../config/config';
import prisma from "../../../lib/prisma";
import { getTokensWithLatestPrices, getValueInOtherTokenFromRates } from '../../../utils/dbRateUtils';
import { getValueInOtherToken } from '../../../utils/sacUtils';

export type createTokenType = {
  name: string,
  symbol: string,
  decimals: number,
  address: string,
  isSPL?: boolean
  onDEX?: boolean
  lastUsdcPrice?: number
}

export const createToken = (data: createTokenType) =>
  prisma.token.create({
    data
  })


export const tokenDefaultSelect = {
  id: true,
  name: true,
  symbol: true,
  address: true,
  decimals: true,
  isSPL: true,
  onDEX: true,
  lastUsdcPrice: true,
  updatedAt: true,
  sort: true
}


export const getTokenByIdUnsafe = (id: number) => prisma.token.findUnique({where: {id}})

export const getTokenByIdSafe = (id: number) => prisma.token.findUnique({where: {id}, rejectOnNotFound: true})

export const getTokens = () => getTokensWithLatestPrices()

export const getTokensByIdsUnsafe = (ids: number[]) => prisma.token.findMany({
  where: {
    id: {
      in: ids
    }
  }
})

export const getTokensByIdsSafe = async (ids: number[]) => {
  const tokens = await getTokensByIdsUnsafe(ids);
  if (tokens.length !== ids.length) {
    throw new Error("Some token where not found");
  }
  return tokens;
}

export const getTokenIdsByIdsUnsafe = async (ids: number[]) => (await prisma.token.findMany({
  where: {
    id: {
      in: ids
    }
  },
  select: {
    id: true
  }
})).map(it => it.id);

export const getTokenIdsByIdsSafe = async (ids: number[]) => {
  const tokens = await getTokenIdsByIdsUnsafe(ids);
  if (tokens.length !== ids.length) {
    throw new Error("Some token where not found");
  }
  return tokens;
}


export async function getEstimatedTokenPriceInSolOrUndefined(ticketPrice: number, ticketPriceToken: Awaited<ReturnType<typeof getTokenByIdSafe>>) {
  if (!ticketPriceToken.onDEX) return
  try {
    const ticketPriceInSol = await getValueInOtherTokenFromRates(ticketPrice, ticketPriceToken, {symbol: 'SOL', address: solToken.toBase58()})
    return ticketPriceInSol
  } catch (e: any) {
    console.log('couldnt fetch sol rate for ticket price, token=', ticketPriceToken.symbol, e.message);
    return 
  }
}

export async function getTokenMetaFromSolscan(tokenAddress: string) {
  const tokenInfo = await axios.get(`https://public-api.solscan.io/token/meta?tokenAddress=${tokenAddress}`)
  console.log(tokenInfo.data);
  return tokenInfo.data
}

export async function addProdToken(tokenInput: Parameters<typeof createToken>[0], failIfExists?: boolean) {
  const tokens = await prisma.token.findMany()
  const existingToken = tokens.find(t => t.symbol === tokenInput.symbol)
  if (!!existingToken) {
    console.log('token already exists', existingToken.symbol);
    if (failIfExists) {
      throw new Error('Token exists already')
    }
    return existingToken
  }
  const token = await createToken(tokenInput)
  console.log('token created', token.symbol)
  return token
}