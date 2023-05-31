import * as anchor from '@project-serum/anchor'
import * as web3 from '@solana/web3.js'
import {
  airdrop,
  getAnchorContext,
  getRafflePda,
  getRaffleUserPda,
  getOrCreateTestToken,
  handleTransaction,
  loadKeypairFromPath,
  parseAnchorDate,
  drawLots,
  loadWallet,
  loadKeypairFromEnv,
} from './tests/utils'
import * as d from 'date-fns'
import { BN } from '@project-serum/anchor'
import { createCLI, path } from 'soly'
import * as s from 'soly'
import { Cluster, ParsedConfirmedTransaction, PublicKey } from '@solana/web3.js'
import fs from 'fs'
import reattempt from 'reattempt'
import _ from 'lodash'
import { PrismaClient } from '../bot/node_modules/@prisma/client'
import asyncBatch from 'async-batch'
import nodePath from 'path'
import * as csv from 'json2csv'
import { client } from './tests/client'
import { getMintInfo } from '@project-serum/common'
import { Metadata } from '@metaplex-foundation/mpl-token-metadata'

const botPrisma = new PrismaClient()

const cli = createCLI('cli')

const dateString = s.preprocess((arg) => {
  if (typeof arg == 'string' || arg instanceof Date) return new Date(arg)
}, s.date())

const backendSigner = fs.existsSync(
  `${process.env.HOME}/config/solana/backend-signer.json`
)
  ? loadKeypairFromPath(`${process.env.HOME}/config/solana/backend-signer.json`)
  : loadKeypairFromEnv('BACKEND_SIGNER')

cli.command('fetch', (c) => {
  // path is used to parse and throw error if the path does not exists
  const [raffleName] = c.positionals([s.string()])

  const { network, keypair } = c.named({
    network: s.enum(['mainnet-beta', 'devnet']).default('mainnet-beta'),
    keypair: s.path().optional(),
  })
  network.alias('n')
  keypair.alias('k')

  return async () => {
    const { adminUser, connection, program } = getAnchorContext({
      keypairPath: keypair.value,
      network: network.value,
    })

    const rafflePda = await getRafflePda(
      adminUser.publicKey,
      raffleName.value
    )

    console.log('raffle pubkey', rafflePda[0])

    let raffle = await program.account.raffle.fetch(rafflePda[0])
    console.log(
      'raffle',
      JSON.stringify(
        {
          ...raffle,
          start: new Date(raffle.starts.toNumber() * 1000),
          ends: new Date(raffle.ends.toNumber() * 1000),
        },
        null,
        3
      )
    )

    const raffleUsers = (await program.account.raffleUser.all()).filter(
      (lu) => lu.account.raffle.equals(rafflePda[0])
    )

    console.log('raffleUsers', raffleUsers.length)

    const winners = raffle.winners
    console.log('winners', winners)
  }
})

cli.command('fetchAll', (c) => {
  // path is used to parse and throw error if the path does not exists

  const { network } = c.named({
    network: s.enum(['mainnet-beta', 'devnet']).default('mainnet-beta'),
  })
  network.alias('n')

  return async () => {
    const { adminUser, connection, program } = getAnchorContext({
      network: network.value,
    })

    let allRaffles = (await program.account.raffle.all())
      .sort((a, b) => {
        /*  if (
        !(a.account.name as string).includes('#') ||
        !(b.account.name as string).includes('#')
      ) */
        return (
          Number(a.account.starts.toNumber()) -
          Number(b.account.starts.toNumber())
        )
      })
      .slice(50)

    const defaultRaffleStat = {
      name: '',
      tokens: [
        {
          name: 'SOL',
          amount: 0,
        },
        {
          name: '$PUFF',
          token: 'G9tt98aYSznRk7jWsfuz9FnTdokxS6Brohdo9hSmjTRB',
          amount: 0,
        },
        {
          name: '$ALL',
          token: '7ScYHk4VDgSRnQngAUtQk4Eyf7fGat8P4wXq6e2dkzLj',
          amount: 0,
        },
      ],
    }

    const raffleStats: typeof defaultRaffleStat[] = []

    for (let raffle of allRaffles) {
      console.log(`started ${raffle.account.id}`)
      console.log(`authority ${raffle.account.authority.toBase58()}`)

      const signatures = await connection.getConfirmedSignaturesForAddress2(
        raffle.publicKey,
        {}
      )

      console.log('signatures', signatures.length)

      const transactions = (await connection.getParsedConfirmedTransactions(
        signatures.map((s) => s.signature)
      ))!

      console.log('transactions', transactions.length)

      const buyTransactions = transactions.filter((t) =>
        t?.meta?.logMessages?.find((m) => m.includes('will buy_ticket'))
      ) as ParsedConfirmedTransaction[]

      const tokenNamesMap = {
        G9tt98aYSznRk7jWsfuz9FnTdokxS6Brohdo9hSmjTRB: 'puff',
        '7ScYHk4VDgSRnQngAUtQk4Eyf7fGat8P4wXq6e2dkzLj': 'all',
      }

      const raffleStat = _.cloneDeep(defaultRaffleStat)
      raffleStat.name = raffle.account.id as string

      console.log('buyTransactions', buyTransactions.length)

      buyTransactions.forEach((t) => {
        const user = t.transaction.message.accountKeys[0].pubkey

        const solTrans = t.meta?.innerInstructions?.find((innerInstruction) =>
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

        if (tokenStat && preTokenBalance && postTokenBalance)
          tokenStat.amount +=
            (preTokenBalance.uiTokenAmount.uiAmount ?? 0) -
            (postTokenBalance.uiTokenAmount.uiAmount ?? 0)
      })

      raffleStats.push(raffleStat)
    }

    const parser = new csv.Parser({
      transforms: [csv.transforms.flatten()],
    })
    const csvStr = parser.parse(
      raffleStats.map((s) => ({
        name: s.name,
        ...s.tokens.reduce((a, v) => ({ ...a, [v.name]: v.amount }), {} as any),
      }))
    )

    fs.writeFileSync(nodePath.join(__dirname, 'raffleStats.csv'), csvStr)
  }
})
/*  */

cli.command('winnersToDiscordIds', (c) => {
  // path is used to parse and throw error if the path does not exists
  const [ldNameArg] = c.positionals([s.string()])

  const { network, keypair } = c.named({
    network: s.enum(['mainnet-beta', 'devnet']).default('mainnet-beta'),
    keypair: s.path().optional(),
  })
  network.alias('n')
  keypair.alias('k')

  return async () => {
    const { adminUser, connection, program } = getAnchorContext({
      network: network.value,
      keypairPath: keypair.value,
    })

    await client.login(process.env.BOT_TOKEN!)

    const rafflePda = await getRafflePda(adminUser.publicKey, ldNameArg.value)

    // log raffle name
    console.log('raffle name', ldNameArg.value)

    console.log('raffle pubkey', rafflePda[0])

    let raffle = await program.account.raffle.fetch(rafflePda[0])
    console.log('raffle', JSON.stringify(raffle, null, 3))

    const firstPrize = raffle.isWhitelistRaffle ? raffle.wlName : (await Metadata.load(
      connection,
      await Metadata.getPDA(raffle.nftMint)
    )).data.data.name

    const winners = raffle.winners
    const winnersWithDiscordId = await asyncBatch(
      winners,
      async (winner) => {
        const user = await botPrisma.user.findFirst({
          where: { address: winner.toBase58() },
        })

        return {
          winner: winner.toBase58(),
          discordId: user?.discordId,
        }
      },
      5
    )
    console.log('winners', winners)

    console.log('winners', winnersWithDiscordId)

    const guild = await client.guilds.fetch('897158531193638913')

    const channel = await guild.channels.fetch('899935334547210290')

    if (channel && channel.isText()) {
      await channel.send(
        `Winners of ${raffle.id as string} (${
          firstPrize
        })\n\n ${winnersWithDiscordId
          .map((w, i) => i + ': ' + [w.winner, w.discordId].join(', '))
          .join('\n')}`
      )
    }

    await client.destroy()
  }
})

/* cli.command('migrate', (c) => {
  // path is used to parse and throw error if the path does not exists

  const { network, keypair } = c.named({
    network: s.enum(['mainnet-beta', 'devnet']).default('mainnet-beta'),
    keypair: s.path(),
  })
  network.alias('n')
  keypair.alias('k')


  return async () => {
    const { adminUser, connection, program } = getAnchorContext({
      keypairPath: keypair.value,
      network: network.value,
    })

    const allRaffles = await program.account.raffle.all()

    console.log(
      'raffleAccounts',
      allRaffles.map((l) => l.account.migrateMock.toNumber())
    )

    await asyncBatch(
      allRaffles,
      async (raffle, i) => {
        console.log('migrate raffle', i)

        const addPricesInstr = await program.instruction.migrateMock({
          accounts: {
            raffle: raffle.publicKey,
            user: adminUser.publicKey,
            systemProgram: web3.SystemProgram.programId,
          },
        })

        const addPricesTx = await connection.sendTransaction(
          new web3.Transaction({
            recentBlockhash: (await connection.getRecentBlockhash()).blockhash,
            feePayer: adminUser.publicKey,
          }).add(addPricesInstr),
          [adminUser]
        )
        await handleTransaction(addPricesTx, connection, {
          commitment: 'confirmed',
        })
      },
      5
    )

    let raffleAccounts = await program.account.raffle.all()
    console.log(
      'raffleAccounts',
      raffleAccounts.map((l) => l.account.migrateMock)
    )
  }
}) */

cli.command('create', (c) => {
  // path is used to parse and throw error if the path does not exists
  const [file] = c.positionals([s.path()])

  const { network, keypair } = c.named({
    network: s.enum(['mainnet-beta', 'devnet']).default('mainnet-beta'),
    keypair: s.path(),
  })
  network.alias('n')
  keypair.alias('k')

  return async () => {
    const { adminUser, connection, program } = getAnchorContext({
      keypairPath: keypair.value,
      network: network.value,
    })

    console.log('before')

    const raffleConfig = s
      .object({
        name: s.string(),
        start: dateString,
        end: dateString,
        solPrice: s.number(),
        totalPriceValue: s.number(),
        payTokens: s.string().array(),
        disableSol: s.boolean(),
        isHoldersOnly: s.boolean(),
        isWhitelistRaffle: s.boolean(),
        prices: s.array(
          s.object({
            mint: s.string(),
            amount: s.number(),
          })
        ),
      })
      .parse(JSON.parse(fs.readFileSync(file.value, 'utf-8')))

    console.log('after')

    console.log('raffleConfig', raffleConfig)

    const ticketPrice = new BN(raffleConfig.solPrice * web3.LAMPORTS_PER_SOL)

    const rafflePda = await getRafflePda(
      adminUser.publicKey,
      raffleConfig.name
    )

    console.log('rafflePda', rafflePda[0])

    let parsedPrices = raffleConfig.prices.map((price, i) => {
      return {
        amount: new anchor.BN(price.amount),
        mint: new PublicKey(price.mint),
      }
    })

    if (raffleConfig.name === 'Lucky Dip #14') {
      ;(parsedPrices[0] as any).winningTicket = new anchor.BN(1641)
    }

    console.log('adminUser', adminUser.publicKey)

    console.log('before init')
    const initRaffle = await program.instruction.initRaffle(
      rafflePda[1],
      raffleConfig.name,
      ticketPrice,
      [],
      new BN(raffleConfig.start.getTime() / 1000),
      new BN(raffleConfig.end.getTime() / 1000),
      new BN(raffleConfig.totalPriceValue),
      raffleConfig.payTokens.map((p) => new web3.PublicKey(p)),
      raffleConfig.disableSol,
      raffleConfig.isHoldersOnly,
      raffleConfig.isWhitelistRaffle,
      {
        accounts: {
          raffle: rafflePda[0],
          user: adminUser.publicKey,
          systemProgram: web3.SystemProgram.programId,
        },
      }
    )
    console.log('after init')

    const tx = await connection.sendTransaction(
      new web3.Transaction({
        recentBlockhash: (await connection.getRecentBlockhash()).blockhash,
        feePayer: adminUser.publicKey,
      }).add(initRaffle),
      [adminUser]
    )

    await handleTransaction(tx, connection, {
      showLogs: true,
      commitment: 'finalized',
    })
    console.log('raffle created')

    const pricesChunks = _.chunk(parsedPrices, 23)
/*
    for (const prices of pricesChunks) {
      const addPricesInstr = await program.instruction.addPrices(prices, {
        accounts: {
          raffle: rafflePda[0],
          user: adminUser.publicKey,
          systemProgram: web3.SystemProgram.programId,
        },
      })

      const addPricesTx = await connection.sendTransaction(
        new web3.Transaction({
          recentBlockhash: (await connection.getRecentBlockhash()).blockhash,
          feePayer: adminUser.publicKey,
        }).add(addPricesInstr),
        [adminUser]
      )
      await handleTransaction(addPricesTx, connection, {
        commitment: 'confirmed',
      })
    }*/

    let raffleAccount = await program.account.raffle.fetch(rafflePda[0])
    console.log('raffleAccount', {
      ...raffleAccount,
      authority: raffleAccount.authority.toBase58(),
      tickets: undefined,
      prize: raffleAccount.nftMint.toBase58()
    })
  }
})

cli.command('raffle', (c) => {
  // path is used to parse and throw error if the path does not exists
  const [file] = c.positionals([s.path()])

  const { network, keypair } = c.named({
    network: s.enum(['mainnet-beta', 'devnet']).default('mainnet-beta'),
    keypair: s.path(),
  })
  network.alias('n')
  keypair.alias('k')

  return async () => {
    const { adminUser, connection, program } = getAnchorContext({
      keypairPath: keypair.value,
      network: network.value,
    })

    const raffleConfig = s
      .object({
        name: s.string(),
      })
      .parse(JSON.parse(fs.readFileSync(file.value, 'utf-8')))

    console.log('raffleConfig', raffleConfig)

    await drawLots({
      adminUser: adminUser,
      id: raffleConfig.name,
      connection,
      program,
      reset: true,
    })
  }
})

cli.command('raffleAll', (c) => {
  // path is used to parse and throw error if the path does not exists

  const { network, keypair } = c.named({
    network: s.enum(['mainnet-beta', 'devnet']).default('mainnet-beta'),
    keypair: s.path().optional(),
  })
  network.alias('n')
  keypair.alias('k')

  return async () => {
    await client.login(process.env.BOT_TOKEN!)

    const { adminUser, connection, program } = getAnchorContext({
      keypairPath: keypair.value,
      network: network.value,
      user: loadKeypairFromEnv('RAFFLE_WALLET'),
    })

    const now = new Date()

    let raffles = await program.account.raffle.all()

    raffles = raffles.filter(
      (r) =>
        [''].includes(r.account.id as string) ||
        (d.isAfter(now, parseAnchorDate(r.account.ends)) &&
          d.isAfter(now, parseAnchorDate(r.account.starts)) &&
          r.account.winners.length === 0 &&
          r.account.authority.equals(adminUser.publicKey))
    )

    console.log(`found ${raffles.length} raffles to draw lots`)

    for (let raffle of raffles) {
      try {
        console.log(
          `\nstart drawing lots for ${
            raffle.account.id
          }, ${raffle.publicKey.toBase58()}`
        )

        const nftPrize = await Metadata.load(
          connection,
          await Metadata.getPDA(raffle.account.nftMint)
        )

        const { winnersWithDiscordId } = await drawLots({
          adminUser: adminUser,
          id: raffle.account.id as string,
          connection,
          program,
        })

        const guild = await client.guilds.fetch('897158531193638913')

        const channel = await guild.channels.fetch('976499084754030592')

        if (channel && channel.isText()) {
          const text = `Winners of ${raffle.account.id as string} (${
            nftPrize.data.data.name
          })\n\n ${winnersWithDiscordId
            .map(
              (w, i) =>
                i +
                ': ' +
                [
                  w.winner,
                  w.discordUsername ? '@' + w.discordUsername : w.discordId,
                ].join(', ')
            )
            .join('\n')}`

          const textLines = text.split('\n')

          const chunks = _.chunk(textLines, 27)

          await asyncBatch(
            chunks,
            async (chunk) => {
              const textPart = chunk.join('\n')
              await channel.send(textPart)
            },
            1
          )

          console.log(
            `finished drawing lots for ${
              raffle.account.id
            }, ${raffle.publicKey.toBase58()}`
          )
        }
      } catch (error) {
        console.error(
          `error in drawing lots for ${
            raffle.account.id
          }, ${raffle.publicKey.toBase58()}`,
          error
        )
      }
    }

    await client.destroy()
  }
})

cli.command('simulateWinner', (c) => {
  // path is used to parse and throw error if the path does not exists
  const [file] = c.positionals([s.path()])

  const { network, keypair } = c.named({
    network: s.enum(['mainnet-beta', 'devnet']).default('mainnet-beta'),
    keypair: s.path(),
  })
  network.alias('n')
  keypair.alias('k')

  return async () => {
    const { adminUser, connection, program } = getAnchorContext({
      keypairPath: keypair.value,
      network: network.value,
    })

    const raffleConfig = s
      .object({
        name: s.string(),
      })
      .parse(JSON.parse(fs.readFileSync(file.value, 'utf-8')))

    console.log('raffleConfig', raffleConfig)

    const rafflePda = await getRafflePda(
      adminUser.publicKey,
      raffleConfig.name
    )

    let raffle = await program.account.raffle.fetch(rafflePda[0])
    console.log('pda', rafflePda[0])

    console.log('raffle.ticketCount', raffle.ticketCount)

    const winner = new PublicKey('EDLSeXxksEBQyznGETif7TUcHnqxjXQQzsDCuYyATfor')
    const raffleUserPda = await getRaffleUserPda(rafflePda[0], winner)
    const raffleUser = await program.account.raffleUser.fetch(
      raffleUserPda[0]
    )

    const winners = [winner]

    let tx = await program.rpc.raffle(winners, {
      accounts: {
        raffle: rafflePda[0],
        user: adminUser.publicKey,
        backendUser: backendSigner.publicKey,
      },
      signers: [backendSigner],
    })
    await handleTransaction(tx, connection, { showLogs: true })

    let raffleAccount = await program.account.raffle.fetch(rafflePda[0])

    console.log('raffleAccount', JSON.stringify(raffleAccount, null, 3))
  }
})

cli.parse()
