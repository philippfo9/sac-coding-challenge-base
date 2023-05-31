import { Token } from '@prisma/client';
import { addSeconds, isBefore } from 'date-fns';
import reattempt from 'reattempt'
import prisma from '../lib/prisma';
import { getBirdEyeUsdcRates, getJupiterUsdcRates, TToken } from './sacUtils';
import { compareTokensForSort } from './tokenSortUtil';


const isRateOutdated = (token: Token) => !token.lastUsdcPrice || isBefore(addSeconds(token.updatedAt, 180), new Date())

export async function getTokensWithLatestPrices() {
  await updateAllTokensInDatabase()
  const tokens = await prisma.token.findMany({})
  const tokensSorted = tokens.sort(compareTokensForSort)
  const onDEXTokens = tokensSorted.filter(t => t.onDEX)
  const notDEXListedToken = tokensSorted.filter(t => !t.onDEX)
  return [...onDEXTokens, ...notDEXListedToken]
}

export async function getValueInOtherTokenFromRates(value: number, tokenIn: TToken, tokenOut: TToken) {
  let tokenDbIn = await prisma.token.findUnique({where: {address: tokenIn.address}, rejectOnNotFound: true})
  let tokenDbOut = await prisma.token.findUnique({where: {address: tokenOut.address}, rejectOnNotFound: true})

  if (isRateOutdated(tokenDbIn) || isRateOutdated(tokenDbOut)) {
    await updateAllTokensInDatabase()
    tokenDbIn = await prisma.token.findUnique({where: {id: tokenDbIn.id}, rejectOnNotFound: true})
    tokenDbOut = await prisma.token.findUnique({where: {id: tokenDbOut.id}, rejectOnNotFound: true})
  } else {
    console.log('using cached rates');
    
  }

  if (!tokenDbIn.lastUsdcPrice || !tokenDbOut.lastUsdcPrice) {
    throw new Error(`No rate found for ${tokenDbIn.symbol}/${tokenDbOut.symbol}`)
  }

  const priceInOtherToken = value * tokenDbIn.lastUsdcPrice / tokenDbOut.lastUsdcPrice
  return priceInOtherToken
}


export async function updateAllTokensInDatabase() {
  const tokens = await prisma.token.findMany()
  await updateSelectedTokensInDatabase(tokens)
}

export async function updateSelectedTokensInDatabase(tokens: Token[]) {
  const tokensToUpdate = tokens.filter(token => isRateOutdated(token) && token.onDEX)

  if (tokensToUpdate.length === 0) {
    console.log('No token to update');
    return
  }

  await reattempt.run({ times: 3, delay: 2000 }, async () => {
    // UPDATING BASED ON BIRDEYE
    try {
      const rates = await getBirdEyeUsdcRates(tokensToUpdate)

      for (const [tokenAddress, tokenValues] of Object.entries(rates)) {
        const token = tokensToUpdate.find(token => token.address === tokenAddress)
        if (!token) {
          continue
        }

        console.log('updating token', token.symbol, token.address, 'with rate', tokenValues.value);
        

        await prisma.token.update({
          where: { address: tokenAddress },
          data: { lastUsdcPrice: tokenValues.value },
        })
      }
      console.log('all token rates successfully updated based on birdeye');
      return
    } catch(err: any) {
      console.log('birdeye with errors', err.message)
    }

    // UPDATING BASED ON JUPITER
    try {
      const rates = await getJupiterUsdcRates(tokensToUpdate)

      for (const rate of rates) {
        const token = tokensToUpdate.find(token => token.address === rate.id)
        if (!token) {
          continue
        }

        await prisma.token.update({
          where: { address: rate.id },
          data: { lastUsdcPrice: rate.price },
        })
      }
      console.log('all token rates successfully updated based on jupiter');
      return
    } catch(err: any) {
      console.log('jupiter rate with error', err.message)
    }
  })
}