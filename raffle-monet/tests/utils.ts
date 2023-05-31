import * as anchor from '@project-serum/anchor'
import { Program, Wallet } from '@project-serum/anchor'
import * as spl from '@solana/spl-token'
import { Connection, Keypair, PublicKey, Cluster, clusterApiUrl, Commitment, LAMPORTS_PER_SOL, Signer, TransactionInstruction } from '@solana/web3.js'
import asyncBatch from 'async-batch'
import fs from 'fs'
import _ from 'lodash'
import process from 'process'
import Reattempt from 'reattempt'
import { PrismaClient } from '../../bot/node_modules/@prisma/client'
import { PrismaClient as SacPrisma } from '../../web/node_modules/@prisma/client'
import { Raffle } from '../target/types/raffle'
import { stringifyPKsAndBNs } from './publicKeyUtils'

const botPrisma = new PrismaClient()

export const sacPrisma = new SacPrisma({
  datasources: {
    db: {
      url: process.env.SAC_DATABASE_URL,
    },
  },
}) as any as SacPrisma

const log = console.log
console.log = function () {
  var args = Array.from(arguments) // ES5
  const newArgs = args.map((a) => stringifyPKsAndBNs(a))
  log.apply(console, newArgs)
}

const raffleIdl = require('../target/idl/raffle')
export const raffleProgramId = new PublicKey(raffleIdl.metadata.address)

export function loadKeypairFromPath(path: string) {
  if (!path || path == '') {
    throw new Error('path is required!')
  }
  const keypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(fs.readFileSync(path).toString()))
  )
  console.log(`loaded wallet public key: ${keypair.publicKey}`)
  return keypair
}

export function loadKeypairFromEnv(name: string) {
  const keypairString = process.env[name]

  if (!keypairString || typeof keypairString !== 'string') {
    throw new Error('env for keypair not found')
  }

  const keypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(keypairString))
  )
  return keypair
}

export function loadWallet(path: string) {
  return new Wallet(loadKeypairFromPath(path))
}

export async function airdrop(
  connection: Connection,
  dest: PublicKey,
  solAmount?: number
) {
  return await connection.confirmTransaction(
    await connection.requestAirdrop(dest, solToLamports(solAmount ?? 1)),
    'confirmed'
  )
}

export function solToLamports(sol: number): any {
  return LAMPORTS_PER_SOL * sol
}

export async function getOrCreateTestToken({
  connection,
  tokenOwner,
  decimals,
  mint,
}: {
  connection: Connection
  tokenOwner: Keypair
  mint?: PublicKey
  decimals?: number
}) {
  if (mint) {
    return new spl.Token(connection, mint, spl.TOKEN_PROGRAM_ID, tokenOwner)
  }
  const token = await spl.Token.createMint(
    connection,
    tokenOwner,
    tokenOwner.publicKey,
    tokenOwner.publicKey,
    decimals ?? 0,
    spl.TOKEN_PROGRAM_ID
  )

  return token
}

export async function getOrCreateAssociatedTokenAddressInstruction(
  mint: PublicKey,
  owner: PublicKey,
  connection: anchor.web3.Connection
) {
  const address = await getAssociatedTokenAddress(mint, owner)

  const tokenAccount = await connection.getAccountInfo(address)

  let instructions: TransactionInstruction[] = []
  if (!tokenAccount) {
    instructions.push(
      spl.Token.createAssociatedTokenAccountInstruction(
        spl.ASSOCIATED_TOKEN_PROGRAM_ID,
        spl.TOKEN_PROGRAM_ID,
        mint,
        address,
        owner,
        owner
      )
    )
  }

  return {
    address,
    instructions,
  }
}

export async function getAssociatedTokenAddress(
  mint: PublicKey,
  owner: PublicKey
) {
  return await spl.Token.getAssociatedTokenAddress(
    spl.ASSOCIATED_TOKEN_PROGRAM_ID,
    spl.TOKEN_PROGRAM_ID,
    mint,
    owner
  )
}

export async function getTokenAccount({
  connection,
  mint,
  user,
}: {
  connection: Connection
  mint: PublicKey
  user: PublicKey
}) {
  const userTokenAccounts = await connection.getParsedTokenAccountsByOwner(
    user,
    {
      mint: mint,

    },
    'recent'
  )

  if (userTokenAccounts.value.length === 0) return null
  return (
    userTokenAccounts.value.find(
      (t) => t.account.data.parsed.info.tokenAmount.uiAmount
    ) ?? userTokenAccounts.value[0]
  )
}

export async function getTokenAccountAdressOrCreateTokenAccountInstruction({
  connection,
  mint,
  user,
}: {
  connection: Connection
  mint: PublicKey
  user: PublicKey
}) {
  const userTokenAccount = await getTokenAccount({ connection, mint, user })

  if (userTokenAccount)
    return {
      address: userTokenAccount.pubkey,
      instructions: [],
    }

  return await getOrCreateAssociatedTokenAddressInstruction(
    mint,
    user,
    connection
  )
}

type AnchorContextOpts = {
  network?: Cluster
  keypairPath?: string
  user?: Keypair
  url?: string
}

export function getAnchorContext(opts: AnchorContextOpts) {
  const { network, user } = opts

  const url = opts.network
    ? {
        devnet: clusterApiUrl(opts.network),
        testnet: clusterApiUrl(opts.network),
        'mainnet-beta':
          'https://late-falling-firefly.solana-mainnet.quiknode.pro/62a17da3d2e5355ccbdc942c6f0cd308fbb37b8c/',
      }[opts.network]
    : undefined

  console.log('url', url)
  console.log('opts', opts);
  

  const adminUser =
    user ??
    (opts.keypairPath
      ? loadKeypairFromPath(opts.keypairPath)
      : loadKeypairFromEnv('RAFFLE_WALLET'))
  
  const connection = new Connection(
    opts.url ?? url ?? process.env.ANCHOR_PROVIDER_URL!, {
      commitment: 'confirmed',
      wsEndpoint: opts.url?.includes('p2pify.com/')
      ? 'wss://ws-nd-875-154-106.p2pify.com/9628fbd634defb2cd8a659ae9ef3d4a9'
      : undefined
    }
  )
  

  const provider = new anchor.AnchorProvider(
    connection,
    adminUser ? new anchor.Wallet(adminUser) : ({} as any),
    {
      commitment: 'confirmed',
    }
  )
  anchor.setProvider(provider)

  
  const program = anchor.workspace.Raffle as Program<Raffle>

  console.log(program.programId.toBase58());
  return { adminUser: adminUser!, connection, program, provider }
}

export function setAnchorUser(user: Keypair) {
  const envProvider = anchor.getProvider()
  const provider = new anchor.AnchorProvider(
    envProvider.connection,
    new anchor.Wallet(user),
    anchor.AnchorProvider.defaultOptions()
  )
  anchor.setProvider(provider)
}

export async function handleTransaction(
  tx: string,
  connection: Connection,
  opts: {
    showLogs?: boolean
    commitment?: Commitment
  } = {
    showLogs: false,
    commitment: 'confirmed',
  }
) {
  let trial = 0
  await Reattempt.run(
    {
      times: 3,
      delay: 1000,
    },
    async () => {
      trial++
      console.log('trial ', trial)

      await connection.confirmTransaction(tx, opts.commitment)
    }
  )

  const trans = await connection.getTransaction(tx)
  if (opts?.showLogs) {
    console.log('trans logs', trans?.meta?.logMessages)
  }
  return tx
}

export function buildToken(
  mint: PublicKey,
  connection: Connection,
  payer?: Signer
) {
  return new spl.Token(connection, mint, spl.TOKEN_PROGRAM_ID, {} as any)
}

export async function generateUserWithSol(
  connection: Connection,
  amount?: number
) {
  const user = Keypair.generate()
  await airdrop(connection, user.publicKey, amount ?? 1)
  return user
}

export async function getRaffleUserPda(raffle: PublicKey, user: PublicKey) {
  return PublicKey.findProgramAddress(
    [raffle.toBuffer(), user.toBuffer()],
    raffleProgramId
  )
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

export async function drawLots({
  adminUser,
  id,
  program,
  connection,
  reset,
}: {
  adminUser: Keypair
  id: string
  program: Program<Raffle>
  connection: Connection
  reset?: boolean
}) {
  const rafflePda = await getRafflePda(adminUser.publicKey, id)

  const backendSigner = fs.existsSync(
    `${process.env.HOME}/config/solana/backend-signer.json`
  )
    ? loadKeypairFromPath(
        `${process.env.HOME}/config/solana/backend-signer.json`
      )
    : loadKeypairFromEnv('BACKEND_SIGNER')

  let raffle = await program.account.raffle.fetch(rafflePda[0])
  console.log('pda', rafflePda[0])

  console.log('ticketCount', raffle.ticketCount)

  console.log('winners', raffle.winners)

  const sortedRaffleUsers = (await program.account.raffleUser.all())
    .filter((u) => u.account.raffle.equals(rafflePda[0]))
    .sort((a, b) =>
      a.account.authority
        .toBase58()
        .localeCompare(b.account.authority.toBase58())
    )

  const prizesLength = raffle.isWhitelistRaffle ? raffle.wlSpots : 1

  /* 
    TODO: don't need winning tickets anymore
    raffle.winners = []
    if (raffle.winners.length < prizesLength) {
      console.log('add winners to already raffled raffle')

      let winners = raffle.winningTickets.map(
        (w) =>
          raffleUsers.find((u) => u.account.tickets.includes(w))?.account
            .authority!
      )

      await addWinners({
        rafflePubkey: rafflePda[0],
        winners,
        adminUser,
        backendSigner,
        program,
        connection,
      })

      const winnersWithDiscordId = await getDiscordIdsFromWinners(winners)
      console.log('winners', winnersWithDiscordId)

      return { winnersWithDiscordId, addedAllWinners: true }
  } */

  if (raffle.winners.length > 0 && !reset) {
    throw Error('already raffled')
  }

  let winning_tickets: number[] = []
  let winners: PublicKey[] = []

  let includesUserAlready = (newWinner: PublicKey) => {
    return winners.some((winner) => winner.equals(newWinner))
  }

  const sortedUserEntries = []
  let startIndex = 1
  for (const user of sortedRaffleUsers) {
    sortedUserEntries.push({
      raffleUserStruct: user,
      ticketStart: startIndex, // 1 , 8, 13
      ticketEnd: startIndex + user.account.counter - 1, // 7, 12, ...
    }) // User 1 has tickets 1-7, User 2 has tickets 8-12, ...
    startIndex += user.account.counter // 8, 13, ...
  }

  for (
    let i = 0;
    i <
    (prizesLength > sortedRaffleUsers.length
      ? sortedRaffleUsers.length
      : prizesLength);
    i++
  ) {
    let ticket = -1
    let selectedUserEntry = undefined
    while (ticket == -1 || winning_tickets.includes(ticket)) {
      let count = 0
      ticket = _.random(1, raffle.ticketCount)
      selectedUserEntry = sortedUserEntries.find(
        (userEntry) =>
          userEntry.ticketStart <= ticket && userEntry.ticketEnd >= ticket
      )
      while ((!selectedUserEntry || includesUserAlready(selectedUserEntry.raffleUserStruct.account.authority)) && count < 100) {
        ticket = _.random(1, raffle.ticketCount)
        count++
      }
    }
    if (selectedUserEntry) {
      winners.push(selectedUserEntry.raffleUserStruct.account.authority)
      winning_tickets.push(ticket)
    }
  }

  if (reset) {
    winners = []
    winning_tickets = []
  }

  let tx = await program.rpc.raffle([], {
    accounts: {
      raffle: rafflePda[0],
      user: adminUser.publicKey,
      backendUser: backendSigner.publicKey,
    },
    signers: [backendSigner],
  })
  await handleTransaction(tx, connection, { showLogs: false })

  let raffleAccount = await program.account.raffle.fetch(rafflePda[0])

  await addWinners({
    rafflePubkey: rafflePda[0],
    winners,
    adminUser,
    backendSigner,
    program,
    connection,
  })

  const winnersWithDiscordId = await getDiscordIdsFromWinners(winners)

  console.log('winners', winnersWithDiscordId)

  return { raffleAccount, winnersWithDiscordId }
}

export async function getDiscordIdsFromWinners(winners: PublicKey[]) {
  const winnersWithDiscordId = await asyncBatch(
    winners,
    async (winner) => {
      const user = await sacPrisma.discordWalletLink.findFirst({
        where: { wallet: winner.toBase58() },
      })

      return {
        winner: winner.toBase58(),
        discordId: user?.discordId,
        discordUsername: user?.discordUsername,
      }
    },
    5
  )

  return winnersWithDiscordId
}

export async function addWinners(args: {
  rafflePubkey: PublicKey
  winners: PublicKey[]
  adminUser: Keypair
  backendSigner: Keypair
  program: Program<Raffle>
  connection: Connection
}) {
  await Reattempt.run({ times: 5 }, async () => {
    const winnerChunk = _.chunk(args.winners, 23)

    await asyncBatch(
      winnerChunk,
      async (winners, i) => {
        const reset = i === 0
        let tx = await args.program.rpc.draw(winners, reset, {
          accounts: {
            raffle: args.rafflePubkey,
            user: args.adminUser.publicKey,
            backendUser: args.backendSigner.publicKey,
          },
          signers: [args.backendSigner],
        })

        const txid = await handleTransaction(tx, args.connection)
      },
      1
    )
  })
}

export function parseAnchorDate(date: anchor.BN) {
  return new Date(date.toNumber() * 1000)
}
