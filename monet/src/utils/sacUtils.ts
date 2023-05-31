import { Token } from '@prisma/client'
import { PublicKey } from '@solana/web3.js'
import axios from 'axios'
import reattempt from 'reattempt'
import config from '../config/config'
import { pub } from './solUtils'

export const predefinedTokens = {
  PUFF: {
    symbol: 'PUFF',
    address: 'G9tt98aYSznRk7jWsfuz9FnTdokxS6Brohdo9hSmjTRB',
  },
  SOL: {
    symbol: 'SOL',
    address: 'So11111111111111111111111111111111111111112',
  },
  USDC: {
    symbol: 'USDC',
    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  },
}

export type TToken = Pick<Token, 'symbol' | 'address'>

export function getValueInOtherToken(
  value: number,
  tokenInUsdPrice: number,
  tokenOutUsdPrice: number
) {
  return (value * tokenInUsdPrice) / tokenOutUsdPrice
}

export async function getLatestUsdcRates(tokens: TToken[]) {
  const rates = await reattempt.run({ times: 3, delay: 2000 }, async () => {
    try {
      const birdEyeRates = await getBirdEyeUsdcRates(tokens)
      return birdEyeRates
    } catch (err) {
      console.log('birdeye with errors', err)
    }
    try {
      const jupiterRates = await getJupiterUsdcRates(tokens)
      return jupiterRates
    } catch (err) {
      console.log('jupiter rate with error', err)
    }

    try {
      const coingeckoRates = await getCoingeckoUsdcPrices(tokens)
      return coingeckoRates
    } catch (err) {
      console.log('coingecko rate with error', err)
      console.log('retrying both rates failed')
      throw err
    }
  })
  return rates
}

export async function getBirdEyeUsdcRates(
  tokens: TToken[]
): Promise<{ [key: string]: { value: number; updateUnixTime?: number } }> {
  console.log('fetching prices from birdeye', tokens.map(t => t.symbol));
  
  const tokenList = tokens.map((token) => token.address).join(',')
  const multiPrices = await axios.get(
    `https://public-api.birdeye.so/public/multi_price?list_address=${tokenList}`
  )
  const prices = multiPrices.data.data // { "token_address" : {value: "xxx", updateUnixTime: "xxx"} }
  console.log('prices fetched from birdeye', prices)

  return prices
}

export async function getBirdEyeUsdcRate(token: TToken) {
  const birdEyeRes = await axios.get(
    `https://public-api.birdeye.so/public/price?address=${token.address}`
  )
  return birdEyeRes.data
}

export function chunks<T>(a: T[], size: number) {
  return Array.from(new Array(Math.ceil(a.length / size)), (_, i) =>
    a.slice(i * size, i * size + size)
  )
}

export async function getJupiterUsdcRates(
  tokens: TToken[]
): Promise<{ price: number; id: string; mintSymbol: string }[]> {
  const tokenChunks = chunks(tokens, 10) // jupiter api can only handle 10 tokens at a time
  const allRates: { price: number; id: string; mintSymbol: string }[] = []
  for (const tokenChunk of tokenChunks) {
    const tokenList = tokenChunk.map((token) => token.address).join(',')
    const priceRes = await axios.get(
      `https://price.jup.ag/v1/price?id=${tokenList}`
    )
    const rateData = priceRes.data.data
    allRates.push(...rateData)
  }
  return allRates
}

export async function getJupiterRate(tokenIn: TToken, tokenOut: TToken) {
  const inputPriceData = await axios.get(
    `https://price.jup.ag/v1/price?id=${tokenIn.address}&vsToken=${tokenOut.address}`
  )
  console.log(inputPriceData.data)

  const inputRate = inputPriceData.data.data.price

  return inputRate as number
}

export async function getCoingeckoUsdcPrices(
  tokens: TToken[]
): Promise<{ [key: string]: { usd: number } }> {
  const tokenList = tokens.map((token) => token.symbol.toLowerCase()).join(',')
  const res = await axios.get(
    `https://api.coingecko.com/api/v3/simple/price?ids=${tokenList}&vs_currencies=usd`
  )
  console.log('coingecko prices', res.data)

  return res.data
}

export async function getCoingeckoPrice(tokenIn: TToken, tokenOut: TToken) {
  /* const uris = {
    'PUFF/USDC': 'FjkwTi1nxCa1S2LtgDwCU8QjrbGuiqpJvYWu3SWUHdrV',
    'SOL/USDC': '9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT',
    'ALL/SOL': 'HnYTh7fKcXN4Dz1pu7Mbybzraj8TtLvnQmw471hxX3f5',
  }

  const recentPricesRes = await axios.get(
    `https://open-api.dexlab.space/v1/prices/${uris[pair]}/last`
  ) */

  const res = await axios.get(
    `https://api.coingecko.com/api/v3/simple/price?ids=${tokenIn.symbol.toLowerCase()}&vs_currencies=${tokenOut.symbol.toLowerCase()}`
  )

  let price = res.data[tokenIn.symbol.toLowerCase()][
    tokenOut.symbol.toLowerCase()
  ] as number

  return price
}

export async function getRate(tokenIn: TToken, tokenOut: TToken) {
  const rate = await reattempt.run({ times: 3, delay: 2000 }, async () => {
    try {
      const rate = await getJupiterRate(tokenIn, tokenOut)
      return rate
    } catch (err) {
      console.log('jupiter rate with error', err)
    }

    try {
      const price = await getCoingeckoPrice(tokenIn, tokenOut)
      return price
    } catch (err) {
      console.log('coingecko rate with error', err)
      console.log('retrying both rates failed')
      throw err
    }
  })
  return rate
}

export async function getPUFFSolprice() {
  const [puffPrice, solPrice] = await Promise.all([
    getRate(predefinedTokens.PUFF, predefinedTokens.USDC),
    getRate(predefinedTokens.SOL, predefinedTokens.USDC),
  ])
  return puffPrice / solPrice
}

export async function getSolPrice(usd: number) {
  const solPrice = await getRate(predefinedTokens.SOL, predefinedTokens.USDC)
  return usd / solPrice
}

export async function getPuffPrice(usd: number) {
  const puffPrice = await getRate(predefinedTokens.PUFF, predefinedTokens.USDC)
  console.log({ puffPrice })

  return usd / puffPrice
}

export async function solToSpl(amount: number, token: PublicKey) {
  if (token.equals(pub(config.puffToken)))
    return amount / (await getPUFFSolprice())

  throw new Error('cannot calculate price for token')
}

export async function splToSol(amount: number, token: PublicKey) {
  if (token.equals(pub(config.puffToken)))
    return amount * (await getPUFFSolprice())

  throw new Error('cannot calculate price for token')
}
