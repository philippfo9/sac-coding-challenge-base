import { getRaffleProgram, raffleProgram, raffleProgramId } from './raffleConfig'
import * as d from 'date-fns'
import asyncBatch from 'async-batch'
import * as web3 from '@solana/web3.js'
import {
  ParsedConfirmedTransaction,
  PublicKey,
} from '@solana/web3.js'
import reattempt from 'reattempt'
import {
  getNftWithMetadata,
  pub,
} from '../../utils/solUtils'
import { NftMetadata } from '../../utils/nftmetaData.type'
import config, { connection, MONET_USER_PUBKEY } from '../../config/config'
import { solToSpl } from '../../utils/sacUtils'
import { filterNull } from '../../utils/utils'
import * as csv from 'json2csv'
import _ from 'lodash'

type NftPrize = NftMetadata & {
  mint: PublicKey
  prizeSent: boolean
  isWhitelistRaffle: false
}

type WlPrize = {
  wlName: string
  wlSpots: number
  isWhitelistRaffle: true
}


export type Raffle = Awaited<ReturnType<typeof getActiveRaffle>>
export type RaffleAccount = NonNullable<Awaited<ReturnType<typeof getRaffleAccount>>>
export type RaffleRaw = Awaited<
  ReturnType<typeof raffleProgram.account.raffle.fetch>
>

export async function getPrizeFromRaffle(raffleRaw: RaffleRaw) {
  try {
    if (raffleRaw.isWhitelistRaffle) {
      return {
        isWhitelistOrIRLRaffle: true,
        winnerSpots: raffleRaw.wlSpots,
      }
    } else {
      const nftMetadata = await getNftWithMetadata({ mint: raffleRaw.nftMint })
      return {
        ...nftMetadata,
        isWhitelistRaffle: false,
        mint: raffleRaw.nftMint,
        prizeSent: !!raffleRaw.nftPrizeSent as boolean,
      }
    }
  } catch (error) {
    console.log('error in loadMetdata', error)
    return null
  }
}

export async function buildRaffle(pubkey: PublicKey, raffleRaw: RaffleRaw) {
  const startDate = new Date(raffleRaw.starts.toNumber() * 1000)
  const endDate = new Date(raffleRaw.ends.toNumber() * 1000)
  return {
    ...raffleRaw,
    startDate: startDate,
    endDate: endDate,
    prize: await getPrizeFromRaffle(raffleRaw),
    isRaffled: raffleRaw.winners.length > 0,
    hasEnded: new Date().getTime() > endDate.getTime(),
    publicKey: pubkey,
    isHoldersOnly: false, // TODO: is holders only from DB
  }
}

export function isRaffleFullySetup(raffleRaw: RaffleRaw) {
  const now = new Date()

  return (
    d.isAfter(now, new Date(raffleRaw.starts.toNumber() * 1000)) &&
    ((raffleRaw.isWhitelistRaffle && raffleRaw.wlSpots) || raffleRaw.nftMint)
  )
}

export async function getAllFullRaffles(exact: boolean) {
  let raffles = (await raffleProgram.account.raffle.all()) as (Awaited<
    ReturnType<typeof raffleProgram.account.raffle.all>
  >[0] & { account: RaffleAccount })[]

  const now = new Date()
  if (!exact) {
    raffles = raffles.filter(
      (raffle) =>
        isRaffleFullySetup(raffle.account)
    )
  }
  return await Promise.all(
    raffles.map(async (raffleRaw) => {
      const raffle = raffleRaw.account
      const prize = await getPrizeFromRaffle(raffle)

      const startDate = new Date(raffle.starts.toNumber() * 1000)
      const endDate = new Date(raffle.ends.toNumber() * 1000)
      const activeRaffle = {
        ...raffle,
        startDate: startDate,
        endDate: endDate,
        prize,
        isRaffled: raffle.winners.length > 0,
        hasEnded: new Date().getTime() > endDate.getTime(),
        publicKey: raffleRaw.publicKey,
        isHoldersOnly: false,
      }
      return activeRaffle
    })
  )
}

export async function getRafflesOnChainByDBIds(raffleIds: string[]) {
  const rafflePdas = await Promise.all(raffleIds.map(raffleId => getRafflePda(MONET_USER_PUBKEY, raffleId)))
  const raffleAddresses = rafflePdas.map(rafflePdas => rafflePdas[0])
  const allRaffles = await raffleProgram.account.raffle.fetchMultiple(raffleAddresses)
  const existingRaffles = allRaffles.filter(raffle => !!raffle) as RaffleRaw[]
  return Promise.all(existingRaffles.map(async raffle => {
    const rafflePda = await getRafflePda(MONET_USER_PUBKEY, raffle.id as string)
    return {
      ...raffle,
      publicKey: rafflePda[0],
      raffleBump: rafflePda[1]
    }
  }))
}

export async function getRaffleOnChainDataByDBId(raffleId: string) {
  return getRaffleOnChainDataRetried(MONET_USER_PUBKEY, raffleId)
}

export async function getRaffleOnChainDataRetried(raffleAdminUser: PublicKey, raffleId: string) {
  const raffleOnChainData = await reattempt.run(
    { times: 3, delay: 1500 },
    async () => {
      const raffleOnChainData = await getRaffleOnChainData(raffleAdminUser, raffleId)
      return raffleOnChainData
    }
  )
  return raffleOnChainData
}

export async function getRaffleOnChainData(raffleAdminUser: PublicKey, raffleId: string) {
  console.log('pre pda', raffleAdminUser.toBase58(), raffleId);
  
  const rafflePda = await getRafflePda(raffleAdminUser, raffleId)

  console.log('post pda', rafflePda[0].toBase58());
  
  const raffleOnChainData = await getRaffleAccount(rafflePda[0])

  if (!raffleOnChainData) {
    throw new Error('Raffle not found on-chain')
  }

  return {
    ...raffleOnChainData,
    publicKey: rafflePda[0],
    raffleBump: rafflePda[1]
  }
}

export async function getRafflePubkeyAndCheck(raffleId: string) {
  const rafflePda = await getRafflePda(MONET_USER_PUBKEY, raffleId)
  try {
    const raffleOnChainData = await getRaffleOnChainDataRetried(MONET_USER_PUBKEY, raffleId)
    return raffleOnChainData.publicKey
  } catch (e) {
    console.log('couldnt find raffle on chain after creation');
    console.log(e);
  }

  return rafflePda[0]
}

export async function getRaffleAccount(pubKey: PublicKey) {
  const raffleRaw = await raffleProgram.account.raffle.fetch(pubKey)

  if (!raffleRaw) return null

  const raffle = raffleRaw as typeof raffleRaw

  return raffle
}

export async function getRaffleByAddress(address: string) {
  const now = new Date()
  const raffle = await getRaffleAccount(new PublicKey(address))

  if (!raffle) return null

  const prize = await getPrizeFromRaffle(raffle)
  const startDate = new Date(raffle.starts.toNumber() * 1000)
  const endDate = new Date(raffle.ends.toNumber() * 1000)
  const activeRaffle = {
    ...raffle,
    startDate: startDate,
    endDate: endDate,
    prize,
    isRaffled: raffle.winners.length > 0,
    hasEnded: now.getTime() > endDate.getTime(),
    publicKey: new PublicKey(address),
  }

  return activeRaffle
}

export async function getActiveRaffle() {
  const raffles = (await raffleProgram.account.raffle.all()) as (Awaited<
    ReturnType<typeof raffleProgram.account.raffle.all>
  >[0] & { account: RaffleAccount })[]

  const now = d.addDays(new Date(), 2)
  let lastRaffle = raffles
    .sort((a, b) => b.account.ends.toNumber() - a.account.ends.toNumber())
    .filter(
      (a) =>
        isRaffleFullySetup(a.account)
    )[0]

  if (!lastRaffle) throw new Error('no active raffle found')

  /* if (lotteries.find((l) => l.account.name == 'Lucky Dip #11'))
    lastRaffle = lotteries.find((l) => l.account.name == 'Lucky Dip #11')! */

  const prize = await getPrizeFromRaffle(lastRaffle.account)

  const startDate = new Date(lastRaffle.account.starts.toNumber() * 1000)
  const endDate = new Date(lastRaffle.account.ends.toNumber() * 1000)
  const activeRaffle = {
    ...lastRaffle,
    startDate: startDate,
    endDate: endDate,
    prize,
    isRaffled: lastRaffle.account.winners.length > 0,
    hasEnded: now.getTime() > endDate.getTime(),
  }

  return activeRaffle
}

export async function getRaffleUser(args: {
  user: PublicKey
  raffle: PublicKey
}) {
  const raffleUserPda = await getRaffleUserPda(args.raffle, args.user)

  const raffleUser = await raffleProgram.account.raffleUser
    .fetch(raffleUserPda[0])
    .catch((e) => {
      console.log(
        `error in fetching raffleUser ${raffleUserPda[0].toBase58()}`
      )
    })

  console.log({raffleUser});
  

  if (!raffleUser) return {counter: 0}

  return raffleUser
}

export async function getUserPrizes({
  user,
  raffle,
}: {
  user: PublicKey
  raffle: Awaited<ReturnType<typeof getRaffleByAddress>> | RaffleRaw
}) {
  if (!raffle || raffle.winners.length === 0) return null

  const isWinner = raffle.winners.some(winner => winner.equals(user))
  if (isWinner) {
    const prize = await getPrizeFromRaffle(raffle)
    return [prize]
  }

  return []
}

export async function getTicketPriceOld(
  raffle: RaffleAccount,
  payToken?: PublicKey
) {
  const mockPayToken = pub(config.puffToken)

  return await solToSpl(
    payToken?.toBase58() === config.puffToken
      ? raffle.ticketPrice.toNumber() * 0.9
      : raffle.ticketPrice.toNumber(),
    payToken ?? mockPayToken
  )
}

export async function getRaffleUserPda(raffle: PublicKey, user: PublicKey) {
  return PublicKey.findProgramAddress(
    [raffle.toBuffer(), user.toBuffer()],
    raffleProgramId
  )
}

export async function getAllRaffleParticipants(raffle: PublicKey) {
  return raffleProgram.account.raffleUser.all([{
    memcmp: {
      offset: 41, // raffle is first seed
      bytes: raffle.toBase58()
    }
  }])
}

export async function getAllRaffleParticipantsRetried(raffle: PublicKey) {
  let attempts = 0
  return reattempt.run({times: 7}, async () => {
    try {
      const raffleProgram = getRaffleProgram(attempts)
      const participants = await raffleProgram.account.raffleUser.all([{
        memcmp: {
          offset: 41, // raffle is first seed
          bytes: raffle.toBase58()
        }
      }])
      return participants
    } catch(err) {
      console.log('err on attempt', err);
      attempts++
      throw err
    }
  })
}

export async function getAllParticipantRaffles(user: PublicKey) {
  return raffleProgram.account.raffleUser.all([{
    memcmp: {
      offset: 9, // user is 8 seed
      bytes: user.toBase58()
    }
  }])
}

export async function getRafflePda(user: PublicKey, id: string) {
  return PublicKey.findProgramAddress(
    [user.toBuffer(), Buffer.from(id)],
    raffleProgramId
  )
}

export async function getRaffleTreasuryPda(rafflePubKey: PublicKey) {
  return PublicKey.findProgramAddress(
    [rafflePubKey.toBuffer(), Buffer.from('treasury')],
    raffleProgramId
  )
}

export async function getPricesVaultPda(raffle: PublicKey) {
  return PublicKey.findProgramAddress(
    [Buffer.from('prices'), raffle.toBuffer()],
    raffleProgramId
  )
}

export async function getStatsCsv() {
  let allRaffles = (await raffleProgram.account.raffle.all()).sort((a, b) => {
    /*  if (
        !(a.account.name as string).includes('#') ||
        !(b.account.name as string).includes('#')
      ) */
    return (
      Number(a.account.starts.toNumber()) - Number(b.account.starts.toNumber())
    )
  })
  /* .slice(25) */

  let raffleStats = (
    await asyncBatch(
      allRaffles,
      async (raffle) => {
        try {
          /* console.log(`started ${raffle.account.name}`) */

          const signatures = await connection.getConfirmedSignaturesForAddress2(
            raffle.publicKey,
            {}
          )

          const prize = await getPrizeFromRaffle(raffle.account)

          const signatureChunks = _.chunk(signatures, 200)

          const transactions = _.flatten(
            await asyncBatch(
              signatureChunks,
              async (signatures) => {
                return await connection.getParsedTransactions(
                  signatures.map((s) => s.signature)
                )!
              },
              1
            )
          )

          const buyTransactions = transactions.filter((t) =>
            t?.meta?.logMessages?.find((m) => m.includes('will buy_ticket'))
          ) as ParsedConfirmedTransaction[]

          const tokenNamesMap = {
            G9tt98aYSznRk7jWsfuz9FnTdokxS6Brohdo9hSmjTRB: 'puff',
            '7ScYHk4VDgSRnQngAUtQk4Eyf7fGat8P4wXq6e2dkzLj': 'all',
          }

          // TODO: stats for other tokens

          const raffleStat = {
            id: raffle.account.id as string,
            started: new Date(raffle.account.starts.toNumber() * 1000),
            ended: new Date(raffle.account.ends.toNumber() * 1000),
            prize: (prize?.isWhitelistOrIRLRaffle ? 'Whitelist' : (prize as NftPrize).name) ?? 'No prize',
            tokens: [
              {
                name: 'SOL',
                token: config.solToken,
                amount: 0,
              },
              {
                name: 'PUFF',
                token: config.puffToken,
                amount: 0,
              },
            ],
          }

          buyTransactions.forEach((t) => {
            const user = t.transaction.message.accountKeys[0].pubkey

            const solTrans = t.meta?.innerInstructions?.find(
              (innerInstruction) =>
                innerInstruction.instructions.find(
                  (i: any) =>
                    i.programId.equals(web3.SystemProgram.programId) &&
                    i.parsed.type === 'transfer'
                )
            )

            const solInstr = solTrans?.instructions.find(
              (i: any) =>
                i.programId.equals(web3.SystemProgram.programId) &&
                i.parsed.type === 'transfer'
            )

            const solStat = raffleStat.tokens.find((s) => s.name == 'SOL')
            if (solInstr && solStat) {
              solStat.amount +=
                (solInstr as any).parsed.info.lamports / web3.LAMPORTS_PER_SOL

              solStat.amount = _.round(solStat.amount, 4)
            }

            const preTokenBalance = t.meta?.preTokenBalances?.find(
              (p) => p.owner === user.toBase58()
            )

            const postTokenBalance = t.meta?.postTokenBalances?.find(
              (p) => p.owner === user.toBase58()
            )

            const tokenStat = raffleStat.tokens.find(
              (t) =>
                t.token === preTokenBalance?.mint &&
                t.token === postTokenBalance?.mint
            )

            if (tokenStat && preTokenBalance && postTokenBalance) {
              tokenStat.amount +=
                (preTokenBalance.uiTokenAmount.uiAmount ?? 0) -
                (postTokenBalance.uiTokenAmount.uiAmount ?? 0)

              tokenStat.amount = _.round(tokenStat.amount, 4)
            }
          })

          return raffleStat
          /* raffleStats.push(raffleStat) */
        } catch (e) {
          console.error(`error at ${raffle.account.id}`, e)
          return null
        }
      },
      10
    )
  ).filter(filterNull)

  raffleStats = raffleStats.sort((a, b) => {
    return a.started.getTime() - b.started.getTime()
  })

  const parser = new csv.Parser({
    transforms: [csv.transforms.flatten()],
  })
  const csvStr = parser.parse(
    raffleStats.map((s) => ({
      id: s.id,
      started: s.started,
      ended: s.ended,
      prize: s.prize,
      ...s.tokens.reduce((a, v) => ({ ...a, [v.name]: v.amount }), {} as any),
    }))
  )

  return csvStr
}
